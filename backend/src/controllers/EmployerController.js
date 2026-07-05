/**
 * EmployerController
 * ------------------------------------------------------------------
 * HTTP entry point for employer/company account management.
 *
 * Thin controller delegating to EmployerService.
 *
 * Implemented in Phase 5 (Employer).
 */
import ApiError from '../utils/ApiError.js';

class EmployerController {
  /** POST /api/employers/register */
  static async register(_req, _res) {
    throw ApiError.notImplemented('EmployerController.register');
  }

  /** GET /api/employers/me */
  static async getProfile(_req, _res) {
    throw ApiError.notImplemented('EmployerController.getProfile');
  }

  /** PUT /api/employers/me */
  static async updateProfile(_req, _res) {
    throw ApiError.notImplemented('EmployerController.updateProfile');
  }

  /** GET /api/employers/:id */
  static async getEmployerById(_req, _res) {
    throw ApiError.notImplemented('EmployerController.getEmployerById');
  }

  /** GET /api/employers/:id/jobs */
  static async getEmployerJobs(_req, _res) {
    throw ApiError.notImplemented('EmployerController.getEmployerJobs');
  }
}

export default EmployerController;
