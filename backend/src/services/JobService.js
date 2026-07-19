/**
 * JobService
 * ------------------------------------------------------------------
 * Business logic for job postings: creation, update, lifecycle, and
 * search/filtering. Search uses the filter dimensions listed in
 * docs/01_PROJECT_OVERVIEW.md §5 (keyword, salary, location,
 * experience, category, work type, employment type).
 *
 * Delegates persistence to JobRepository. Implemented in Phase 7 (Job).
 */
import ApiError from '../utils/ApiError.js';
import JobRepository from '../repositories/JobRepository.js';
import * as systemConfigurationService from './systemConfigurationService.js';
const WORK_MODE_MAP = {
  onsite: 'ONSITE',
  remote: 'REMOTE',
  hybrid: 'HYBRID',
};

const JOB_TYPE_MAP = {
  full_time: 'FULL_TIME',
  part_time: 'PART_TIME',
  internship: 'INTERNSHIP',
  contract: 'CONTRACT',
};

const EXPERIENCE_MAP = {
  intern: 'INTERN',
  fresher: 'FRESHER',
  junior: 'JUNIOR',
  mid: 'MID',
  senior: 'SENIOR',
  lead: 'LEAD',
};

const normalizeExperience = (value) => {
  if (!value) return null;

  return EXPERIENCE_MAP[String(value).trim().toLowerCase()] ?? null;
};

const normalizeDeadline = (value) => {
  if (!value) return null;
  return value;
};

const normalizeSkillNames = (skills = []) =>
  skills
    .map((skill) => String(skill).trim())
    .filter(Boolean)
    .filter(
      (skill, index, array) =>
        array.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) === index,
    );

const ensureEmployerOwnsJob = (job, employerId) => {
  if (!job) {
    throw ApiError.notFound('Không tìm thấy tin tuyển dụng.');
  }

  if (Number(job.employer_id) !== Number(employerId)) {
    throw ApiError.forbidden('Bạn chỉ được quản lý tin tuyển dụng của công ty mình.');
  }
};

class JobService {
  static async searchJobs(filters = {}) {
    const MAX_LIMIT = 1000;
    return JobRepository.searchJobs({
      keyword: filters.keyword,
      city: filters.city,
      location: filters.location,
      workMode: WORK_MODE_MAP[filters.workType],
      jobType: JOB_TYPE_MAP[filters.employmentType],
      categoryId: filters.categoryId,
      salaryMin: filters.salaryMin,
      salaryMax: filters.salaryMax,
      page: Math.max(1, Number(filters.page) || 1),
      // Clamp limit to [1, MAX_LIMIT] to prevent unbounded queries.
      limit: Math.min(MAX_LIMIT, Math.max(1, Number(filters.limit) || 20)),
    });
  }

  static async getJobById(jobId) {
    const job = await JobRepository.findJobById(jobId);

    if (!job) {
      throw ApiError.notFound('Không tìm thấy tin tuyển dụng.');
    }

    return job;
  }

  static async getEmployerJobs(employerId) {
    return JobRepository.searchJobs({
      employerId,
      includeUnapproved: true,
      limit: 100,
    });
  }

  static async getPendingReviewJobs() {
    return JobRepository.searchJobs({
      status: 'DRAFT',
      includeUnapproved: true,
      limit: 100,
    });
  }

  static async createJob(employerId, payload) {
    if (!employerId) {
      throw ApiError.unauthorized('Vui lòng đăng nhập bằng tài khoản nhà tuyển dụng.');
    }
    const [
      maxSkillsConfig,
      defaultDeadlineConfig,
      requireApprovalConfig,
    ] = await Promise.all([
      systemConfigurationService.getConfigValue(
        'MAX_SKILLS_PER_JOB',
        30,
      ),
      systemConfigurationService.getConfigValue(
        'DEFAULT_DEADLINE_DAYS',
        30,
      ),
      systemConfigurationService.getConfigValue(
        'REQUIRE_JOB_APPROVAL',
        true,
      ),
    ]);

    const maxSkillsPerJob =
      Number(maxSkillsConfig) > 0
        ? Number(maxSkillsConfig)
        : 30;

    const defaultDeadlineDays =
      Number(defaultDeadlineConfig) > 0
        ? Number(defaultDeadlineConfig)
        : 30;

    const requireApproval =
      requireApprovalConfig === true ||
      String(requireApprovalConfig).toLowerCase() ===
      'true';

    const skillNames =
      normalizeSkillNames(payload.skills ?? []);

    if (skillNames.length > maxSkillsPerJob) {
      throw ApiError.badRequest(
        `Một tin tuyển dụng không được có quá ${maxSkillsPerJob} kỹ năng.`,
      );
    }

    const defaultApplicationDeadline =
      new Date(
        Date.now() +
        defaultDeadlineDays *
        24 *
        60 *
        60 *
        1000,
      ).toISOString();

    const applicationDeadline =
      normalizeDeadline(
        payload.applicationDeadline,
      ) ?? defaultApplicationDeadline;
    if (
      payload.salaryMin !== undefined &&
      payload.salaryMax !== undefined &&
      Number(payload.salaryMin) > Number(payload.salaryMax)
    ) {
      throw ApiError.badRequest('Lương tối thiểu phải nhỏ hơn hoặc bằng lương tối đa.');
    }

    let categoryId = payload.categoryId ?? null;

    if (!categoryId && payload.category) {
      let category = await JobRepository.findCategoryByName(payload.category);

      if (!category) {
        category = await JobRepository.createCategory(payload.category);
      }

      categoryId = category.category_id;
    }

    const jobPayload = {
      employer_id: employerId,
      category_id: categoryId,
      job_title: payload.title,
      job_description: payload.description,
      salary_min: payload.salaryMin ?? null,
      salary_max: payload.salaryMax ?? null,
      salary_currency: payload.currency ?? 'VND',
      location: payload.location,
      city: payload.city ?? payload.location,
      work_mode: WORK_MODE_MAP[payload.workType],
      job_type: JOB_TYPE_MAP[payload.employmentType],
      experience_level: normalizeExperience(payload.experience),
      positions_available: payload.positionsAvailable ?? 1,
      application_deadline: applicationDeadline,

      // Trên giao diện gọi là "Chờ duyệt"
      // Dưới database lưu là DRAFT + is_approved = false
      status: requireApproval
        ? 'DRAFT'
        : 'OPEN',

      is_approved: !requireApproval,
    };

    const createdJob = await JobRepository.createJob(jobPayload);

    // Batch upsert skills — replaces the per-skill N+1 loop.
    if (skillNames.length > 0) {
      const skills = await JobRepository.upsertSkillsByNames(skillNames);
      const skillRows = skills.map((skill) => ({
        skill_id: skill.skill_id,
        is_required: true,
        min_experience_years: 0,
        weight: 1,
      }));
      await JobRepository.replaceJobSkills(createdJob.job_id, skillRows);
    }

    return JobRepository.findJobById(createdJob.job_id);
  }

  static async updateJob(employerId, jobId, payload) {
    const existingJob = await JobRepository.findJobById(jobId);
    ensureEmployerOwnsJob(existingJob, employerId);

    if (
      payload.salaryMin !== undefined &&
      payload.salaryMax !== undefined &&
      Number(payload.salaryMin) > Number(payload.salaryMax)
    ) {
      throw ApiError.badRequest('Lương tối thiểu phải nhỏ hơn hoặc bằng lương tối đa.');
    }
    if (Array.isArray(payload.skills)) {
      const maxSkillsPerJob =
        await systemConfigurationService
          .getConfigValue(
            'MAX_SKILLS_PER_JOB',
            30,
          );

      const normalizedSkills =
        normalizeSkillNames(
          payload.skills,
        );

      if (
        normalizedSkills.length >
        Number(maxSkillsPerJob)
      ) {
        throw ApiError.badRequest(
          `Một tin tuyển dụng không được có quá ${maxSkillsPerJob} kỹ năng.`,
        );
      }
    }
    let categoryId = payload.categoryId ?? existingJob.category_id ?? null;

    if (payload.category) {
      let category = await JobRepository.findCategoryByName(payload.category);

      if (!category) {
        category = await JobRepository.createCategory(payload.category);
      }

      categoryId = category.category_id;
    }

    const jobPayload = {
      category_id: categoryId,
      job_title: payload.title,
      job_description: payload.description,
      salary_min: payload.salaryMin,
      salary_max: payload.salaryMax,
      salary_currency: payload.currency,
      location: payload.location,
      city: payload.city,
      work_mode: payload.workType ? WORK_MODE_MAP[payload.workType] : undefined,
      job_type: payload.employmentType ? JOB_TYPE_MAP[payload.employmentType] : undefined,
      experience_level: payload.experience
        ? normalizeExperience(payload.experience)
        : undefined,
      positions_available: payload.positionsAvailable,
      application_deadline: normalizeDeadline(payload.applicationDeadline),
    };

    Object.keys(jobPayload).forEach((key) => {
      if (jobPayload[key] === undefined) {
        delete jobPayload[key];
      }
    });

    await JobRepository.updateJob(jobId, jobPayload);

    if (Array.isArray(payload.skills)) {
      const skillNames = normalizeSkillNames(payload.skills);
      if (skillNames.length > 0) {
        // Batch upsert — replaces the per-skill N+1 loop.
        const skills = await JobRepository.upsertSkillsByNames(skillNames);
        const skillRows = skills.map((skill) => ({
          skill_id: skill.skill_id,
          is_required: true,
          min_experience_years: 0,
          weight: 1,
        }));
        await JobRepository.replaceJobSkills(jobId, skillRows);
      } else {
        await JobRepository.replaceJobSkills(jobId, []);
      }
    }

    return JobRepository.findJobById(jobId);
  }

  static async deleteJob(employerId, jobId) {
    const existingJob = await JobRepository.findJobById(jobId);
    ensureEmployerOwnsJob(existingJob, employerId);

    await JobRepository.deleteJob(jobId);

    return {
      deleted: true,
      message: 'Đã xoá tin tuyển dụng.',
    };
  }

  static async closeJob(employerId, jobId) {
    const existingJob = await JobRepository.findJobById(jobId);
    ensureEmployerOwnsJob(existingJob, employerId);

    return JobRepository.setJobStatus(jobId, 'CLOSED');
  }

  static async reopenJob(employerId, jobId) {
    const existingJob = await JobRepository.findJobById(jobId);
    ensureEmployerOwnsJob(existingJob, employerId);

    // Tin bị admin từ chối (CLOSED + chưa duyệt) không cho employer tự mở lại.
    if (existingJob.is_approved === false) {
      throw ApiError.badRequest(
        'Tin tuyển dụng này đã bị từ chối, không thể mở lại.',
      );
    }

    return JobRepository.setJobStatus(jobId, 'OPEN');
  }

  static async moderateJob(jobId, decision) {
    const existingJob = await JobRepository.findJobById(jobId);

    if (!existingJob) {
      throw ApiError.notFound('Không tìm thấy tin tuyển dụng.');
    }

    if (decision === 'Approved') {
      const updatedJob = await JobRepository.setJobStatus(jobId, 'OPEN', {
        is_approved: true,
      });

      await JobRepository.createEmployerNotification({
        employer_id: updatedJob.employer_id,
        type: 'JOB_APPROVED',
        title: 'Tin tuyển dụng đã được duyệt',
        message: `Tin tuyển dụng "${updatedJob.job_title}" đã được duyệt và hiển thị công khai.`,
      });

      return updatedJob;
    }

    if (decision === 'Rejected') {
      const updatedJob = await JobRepository.setJobStatus(jobId, 'CLOSED', {
        is_approved: false,
      });

      await JobRepository.createEmployerNotification({
        employer_id: updatedJob.employer_id,
        type: 'JOB_REJECTED',
        title: 'Tin tuyển dụng bị từ chối',
        message: `Tin tuyển dụng "${updatedJob.job_title}" đã bị từ chối.`,
      });

      return updatedJob;
    }

    throw ApiError.badRequest('Quyết định duyệt tin không hợp lệ.');
  }

  static async listCategories() {
    return JobRepository.listCategories();
  }

  static async createCategory(name) {
    const existing = await JobRepository.findCategoryByName(name);

    if (existing) {
      throw ApiError.conflict('Ngành nghề này đã tồn tại.');
    }

    return JobRepository.createCategory(name);
  }

  static async updateCategory(id, name) {
    return JobRepository.updateCategory(id, name);
  }

  static async deleteCategory(id) {
    await JobRepository.deleteCategory(id);

    return {
      deleted: true,
      message: 'Đã xoá ngành nghề.',
    };
  }

  static async listSkills() {
    return JobRepository.listSkills();
  }

  static async createSkill(name) {
    const existing = await JobRepository.findSkillByName(name);

    if (existing) {
      throw ApiError.conflict('Kỹ năng này đã tồn tại.');
    }

    return JobRepository.createSkill(name);
  }

  static async updateSkill(id, name) {
    return JobRepository.updateSkill(id, name);
  }

  static async deleteSkill(id) {
    await JobRepository.deleteSkill(id);

    return {
      deleted: true,
      message: 'Đã xoá kỹ năng.',
    };
  }

  static async getApplicants(employerId, jobId) {
    const existingJob = await JobRepository.findJobById(jobId);
    ensureEmployerOwnsJob(existingJob, employerId);
    // TODO: implement via ApplicationRepository when Phase 8 (Application) is complete.
    throw ApiError.notImplemented('JobService.getApplicants — sử dụng GET /api/applications/employer?jobId=:id thay thế.');
  }
}

export default JobService;
