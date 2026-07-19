import ApplicationRepository from '../repositories/ApplicationRepository.js';
import ApiError from '../utils/ApiError.js';

const TRANSITIONS = Object.freeze({
  SUBMITTED: ['UNDER_REVIEW', 'ACCEPTED', 'REJECTED'],
  UNDER_REVIEW: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
});

const ensureOwnedByEmployer = (application, actorId, actorRole) => {
  if (!application) throw ApiError.notFound('Không tìm thấy hồ sơ ứng tuyển.');
  if (actorRole !== 'admin' && Number(application.job?.employer_id) !== Number(actorId)) {
    throw ApiError.forbidden('Bạn không có quyền xem hồ sơ này.');
  }
};

class ApplicationService {
  static async getApplyContext(jobSeekerId, jobId) {
    const [candidate, job, duplicate] = await Promise.all([
      ApplicationRepository.getCandidateContext(jobSeekerId),
      ApplicationRepository.findJob(jobId),
      ApplicationRepository.findDuplicate(jobSeekerId, jobId),
    ]);
    if (!candidate.profile) throw ApiError.notFound('Không tìm thấy hồ sơ ứng viên.');
    return { ...candidate, job, alreadyApplied: Boolean(duplicate) };
  }

  static async applyJob(jobSeekerId, { jobId, coverLetter }) {
    const { profile, resume, job, alreadyApplied } = await ApplicationService.getApplyContext(
      jobSeekerId,
      jobId,
    );
    if (!profile.is_active) throw ApiError.forbidden('Tài khoản đã bị vô hiệu hóa.');
    const missing = ['full_name', 'headline', 'city'].filter((field) => !profile[field]);
    if (missing.length) throw ApiError.badRequest(`Hồ sơ chưa đầy đủ: ${missing.join(', ')}.`);
    if (!resume) throw ApiError.badRequest('Bạn chưa có CV chính để ứng tuyển.');
    if (!job) throw ApiError.notFound('Không tìm thấy công việc.');
    if (!job.is_approved || job.status !== 'OPEN') {
      throw ApiError.badRequest('Công việc không còn nhận hồ sơ.');
    }
    if (
      job.application_deadline &&
      // Compare YYYY-MM-DD strings in UTC to avoid locale/timezone drift.
      job.application_deadline < new Date().toISOString().slice(0, 10)
    ) {
      throw ApiError.badRequest('Công việc đã hết hạn ứng tuyển.');
    }
    if (alreadyApplied) throw ApiError.conflict('Bạn đã ứng tuyển công việc này.');
    return ApplicationRepository.createApplication({
      job_seeker_id: jobSeekerId,
      job_id: jobId,
      resume_id: resume.resume_id,
      cover_letter: coverLetter || null,
      status: 'SUBMITTED',
    });
  }

  static listMine(jobSeekerId, query) {
    return ApplicationRepository.listForCandidate(jobSeekerId, query);
  }

  static async getMine(jobSeekerId, applicationId) {
    const application = await ApplicationRepository.findDetail(applicationId);
    if (!application || Number(application.job_seeker_id) !== Number(jobSeekerId)) {
      throw ApiError.notFound('Không tìm thấy hồ sơ ứng tuyển.');
    }
    const history = await ApplicationRepository.listHistory(applicationId);
    return { ...application, history };
  }

  static listForEmployer(actorId, actorRole, query) {
    return ApplicationRepository.listForEmployer(actorRole === 'admin' ? null : actorId, query);
  }

  static async reviewForEmployer(actorId, actorRole, applicationId) {
    const application = await ApplicationRepository.findDetail(applicationId);
    ensureOwnedByEmployer(application, actorId, actorRole);
    const history = await ApplicationRepository.listHistory(applicationId);
    return { ...application, history, allowedTransitions: TRANSITIONS[application.status] ?? [] };
  }

  static async updateStatus(actorId, actorRole, applicationId, { status, expectedCurrentStatus }) {
    const application = await ApplicationRepository.findDetail(applicationId);
    ensureOwnedByEmployer(application, actorId, actorRole);
    if (application.status !== expectedCurrentStatus) {
      throw ApiError.conflict('Hồ sơ đã được cập nhật. Vui lòng tải lại.');
    }
    if (!(TRANSITIONS[application.status] ?? []).includes(status)) {
      throw ApiError.badRequest('Chuyển trạng thái không hợp lệ.');
    }
    return ApplicationRepository.updateStatusAtomic({
      applicationId,
      expectedStatus: application.status,
      newStatus: status,
      actorId,
      actorRole,
    });
  }
}

export { TRANSITIONS };
export default ApplicationService;
