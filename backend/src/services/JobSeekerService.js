/**
 * JobSeekerService
 * ------------------------------------------------------------------
 * Business logic for job-seeker (candidate) accounts: profile,
 * education, work experience, and skills management (UC-03).
 *
 * Delegates persistence to JobSeekerRepository. Skill lookup/creation
 * reuses JobRepository (shared `skill` table with job postings).
 */
import ApiError from '../utils/ApiError.js';
import JobSeekerRepository from '../repositories/JobSeekerRepository.js';
import JobRepository from '../repositories/JobRepository.js';

const mapProfilePayload = (payload) => {
  const mapped = {
    full_name: payload.fullName,
    phone: payload.phone,
    address: payload.address,
    city: payload.city,
    headline: payload.headline,
    profile_summary: payload.profileSummary,
    is_open_to_work: payload.isOpenToWork,
  };

  Object.keys(mapped).forEach((key) => {
    if (mapped[key] === undefined) delete mapped[key];
  });

  return mapped;
};

const mapEducationRows = (rows = []) =>
  rows.map((row) => ({
    school_name: row.schoolName,
    degree: row.degree || null,
    major: row.major || null,
    start_year: row.startYear ?? null,
    end_year: row.endYear ?? null,
  }));

const mapExperienceRows = (rows = []) =>
  rows.map((row) => ({
    company_name: row.companyName,
    position: row.position,
    start_date: row.startDate || null,
    end_date: row.endDate || null,
    description: row.description || null,
  }));

class JobSeekerService {
  static async getFullProfile(userId) {
    const [profile, education, experience, skills] = await Promise.all([
      JobSeekerRepository.findJobSeekerById(userId),
      JobSeekerRepository.listEducation(userId),
      JobSeekerRepository.listWorkExperience(userId),
      JobSeekerRepository.listSkills(userId),
    ]);

    if (!profile) throw ApiError.notFound('Không tìm thấy hồ sơ ứng viên.');

    return { ...profile, education, experience, skills };
  }

  static async getProfile(userId) {
    const profile = await JobSeekerRepository.findJobSeekerById(userId);
    if (!profile) throw ApiError.notFound('Không tìm thấy hồ sơ ứng viên.');
    return profile;
  }

  static async updateProfile(userId, payload) {
    const existing = await JobSeekerRepository.findJobSeekerById(userId);
    if (!existing) throw ApiError.notFound('Không tìm thấy hồ sơ ứng viên.');

    const updatePayload = mapProfilePayload(payload);
    if (Object.keys(updatePayload).length > 0) {
      await JobSeekerRepository.updateJobSeeker(userId, updatePayload);
    }

    if (Array.isArray(payload.education)) {
      await JobSeekerRepository.replaceEducation(userId, mapEducationRows(payload.education));
    }

    if (Array.isArray(payload.experience)) {
      await JobSeekerRepository.replaceWorkExperience(
        userId,
        mapExperienceRows(payload.experience),
      );
    }

    if (Array.isArray(payload.skills)) {
      const skillRows = [];
      for (const item of payload.skills) {
        const name = String(item.name || '').trim();
        if (!name) continue;
        let skill = await JobRepository.findSkillByName(name);
        if (!skill) skill = await JobRepository.createSkill(name);
        skillRows.push({
          skill_id: skill.skill_id,
          experience_years: item.experienceYears ?? null,
          skill_detail: item.detail || null,
          source: 'MANUAL',
        });
      }
      await JobSeekerRepository.replaceSkills(userId, skillRows);
    }

    return JobSeekerService.getFullProfile(userId);
  }

  static async setPreferences(userId, preferences) {
    const existing = await JobSeekerRepository.findJobSeekerById(userId);
    if (!existing) throw ApiError.notFound('Không tìm thấy hồ sơ ứng viên.');

    const updatePayload = {};
    if (preferences.isOpenToWork !== undefined) {
      updatePayload.is_open_to_work = preferences.isOpenToWork;
    }
    if (Object.keys(updatePayload).length === 0) return existing;

    return JobSeekerRepository.updateJobSeeker(userId, updatePayload);
  }

  static async getSavedJobs(_userId) {
    throw ApiError.notImplemented('JobSeekerService.getSavedJobs');
  }

  static async toggleSavedJob(_userId, _jobId) {
    throw ApiError.notImplemented('JobSeekerService.toggleSavedJob');
  }
}

export default JobSeekerService;