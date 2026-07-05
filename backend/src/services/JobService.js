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

class JobService {
  static async searchJobs(_filters) {
    throw ApiError.notImplemented('JobService.searchJobs');
  }

  static async getJobById(_jobId) {
    throw ApiError.notImplemented('JobService.getJobById');
  }

  static async createJob(_employerId, _payload) {
    throw ApiError.notImplemented('JobService.createJob');
  }

  static async updateJob(_employerId, _jobId, _payload) {
    throw ApiError.notImplemented('JobService.updateJob');
  }

  static async deleteJob(_employerId, _jobId) {
    throw ApiError.notImplemented('JobService.deleteJob');
  }

  static async closeJob(_employerId, _jobId) {
    throw ApiError.notImplemented('JobService.closeJob');
  }

  static async getApplicants(_employerId, _jobId) {
    throw ApiError.notImplemented('JobService.getApplicants');
  }
}

export default JobService;
