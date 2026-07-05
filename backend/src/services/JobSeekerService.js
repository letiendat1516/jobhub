/**
 * JobSeekerService
 * ------------------------------------------------------------------
 * Business logic for job-seeker (candidate) accounts: profile
 * management, preferences, and resume linkage.
 *
 * Delegates persistence to JobSeekerRepository. Implemented in
 * Phase 4 (Job Seeker).
 */
import ApiError from '../utils/ApiError.js';

class JobSeekerService {
  static async getProfile(_userId) {
    throw ApiError.notImplemented('JobSeekerService.getProfile');
  }

  static async updateProfile(_userId, _payload) {
    throw ApiError.notImplemented('JobSeekerService.updateProfile');
  }

  static async setPreferences(_userId, _preferences) {
    throw ApiError.notImplemented('JobSeekerService.setPreferences');
  }

  static async getSavedJobs(_userId) {
    throw ApiError.notImplemented('JobSeekerService.getSavedJobs');
  }

  static async toggleSavedJob(_userId, _jobId) {
    throw ApiError.notImplemented('JobSeekerService.toggleSavedJob');
  }
}

export default JobSeekerService;
