/**
 * ApplicationService
 * ------------------------------------------------------------------
 * Business logic for job applications: submission, ownership checks,
 * status transitions, and listing (candidate-facing & employer-facing).
 *
 * Enforces business rules (e.g. one active application per job per
 * candidate, allowed status transitions). Delegates persistence to
 * ApplicationRepository. Implemented in Phase 8 (Application).
 */
import ApiError from '../utils/ApiError.js';

class ApplicationService {
  static async applyJob(_userId, _payload) {
    throw ApiError.notImplemented('ApplicationService.applyJob');
  }

  static async getMyApplications(_userId, _query) {
    throw ApiError.notImplemented('ApplicationService.getMyApplications');
  }

  static async getApplicationById(_userId, _applicationId) {
    throw ApiError.notImplemented('ApplicationService.getApplicationById');
  }

  static async updateApplicationStatus(_employerId, _applicationId, _status) {
    throw ApiError.notImplemented('ApplicationService.updateApplicationStatus');
  }
}

export default ApplicationService;
