/**
 * EmployerService
 * ------------------------------------------------------------------
 * Business logic for employer/company accounts: registration,
 * company profile management, and visibility of owned job postings.
 *
 * Delegates persistence to EmployerRepository. Implemented in
 * Phase 5 (Employer).
 */
import ApiError from '../utils/ApiError.js';

class EmployerService {
  static async register(_payload) {
    throw ApiError.notImplemented('EmployerService.register');
  }

  static async getProfile(_employerId) {
    throw ApiError.notImplemented('EmployerService.getProfile');
  }

  static async updateProfile(_employerId, _payload) {
    throw ApiError.notImplemented('EmployerService.updateProfile');
  }

  static async getPublicProfile(_employerId) {
    throw ApiError.notImplemented('EmployerService.getPublicProfile');
  }

  static async listEmployers(_query) {
    throw ApiError.notImplemented('EmployerService.listEmployers');
  }
}

export default EmployerService;
