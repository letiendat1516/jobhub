/**
 * JobSeekerRepository
 * ------------------------------------------------------------------
 * Data access for job-seeker profiles, preferences, and saved jobs.
 * Only this layer may issue SQL for these tables. Implemented in
 * Phase 4 (Job Seeker).
 */
import ApiError from '../utils/ApiError.js';

class JobSeekerRepository {
  static async getProfile(_userId) {
    throw ApiError.notImplemented('JobSeekerRepository.getProfile');
  }

  static async upsertProfile(_userId, _payload) {
    throw ApiError.notImplemented('JobSeekerRepository.upsertProfile');
  }

  static async getSavedJobs(_userId) {
    throw ApiError.notImplemented('JobSeekerRepository.getSavedJobs');
  }

  static async addSavedJob(_userId, _jobId) {
    throw ApiError.notImplemented('JobSeekerRepository.addSavedJob');
  }

  static async removeSavedJob(_userId, _jobId) {
    throw ApiError.notImplemented('JobSeekerRepository.removeSavedJob');
  }
}

export default JobSeekerRepository;
