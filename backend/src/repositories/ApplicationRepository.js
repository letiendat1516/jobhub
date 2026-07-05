/**
 * ApplicationRepository
 * ------------------------------------------------------------------
 * Data access for job applications and their status history. Only this
 * layer issues SQL against the applications tables. Implemented in
 * Phase 8 (Application).
 */
import ApiError from '../utils/ApiError.js';

class ApplicationRepository {
  static async createApplication(_payload) {
    throw ApiError.notImplemented('ApplicationRepository.createApplication');
  }

  static async findApplicationById(_id) {
    throw ApiError.notImplemented('ApplicationRepository.findApplicationById');
  }

  static async findApplicationsByCandidate(_userId, _query) {
    throw ApiError.notImplemented('ApplicationRepository.findApplicationsByCandidate');
  }

  static async findApplicationsByJob(_jobId, _query) {
    throw ApiError.notImplemented('ApplicationRepository.findApplicationsByJob');
  }

  static async updateStatus(_id, _status) {
    throw ApiError.notImplemented('ApplicationRepository.updateStatus');
  }
}

export default ApplicationRepository;
