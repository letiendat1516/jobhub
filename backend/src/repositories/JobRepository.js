/**
 * JobRepository
 * ------------------------------------------------------------------
 * Data access for job postings, including filtered search across the
 * dimensions defined in docs/01_PROJECT_OVERVIEW.md §5. Only this
 * layer issues SQL against the jobs tables. Implemented in Phase 7.
 */
import ApiError from '../utils/ApiError.js';

class JobRepository {
  static async searchJobs(_filters) {
    throw ApiError.notImplemented('JobRepository.searchJobs');
  }

  static async findJobById(_id) {
    throw ApiError.notImplemented('JobRepository.findJobById');
  }

  static async createJob(_payload) {
    throw ApiError.notImplemented('JobRepository.createJob');
  }

  static async updateJob(_id, _payload) {
    throw ApiError.notImplemented('JobRepository.updateJob');
  }

  static async deleteJob(_id) {
    throw ApiError.notImplemented('JobRepository.deleteJob');
  }

  static async setJobStatus(_id, _status) {
    throw ApiError.notImplemented('JobRepository.setJobStatus');
  }
}

export default JobRepository;
