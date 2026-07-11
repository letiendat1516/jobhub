/**
 * EmployerController
 * ------------------------------------------------------------------
 * HTTP entry point for employer/company account management.
 *
 * Thin controller delegating to EmployerService.
 *
 * Implemented in Phase 5 (Employer).
 */
import ApiResponse from '../utils/ApiResponse.js';
import EmployerService from '../services/EmployerService.js';

class EmployerController {
  static async listEmployers(req, res) {
    const result = await EmployerService.listEmployers(req.query);

    return ApiResponse.ok(res, result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  }

  static async getProfile(req, res) {
    const profile = await EmployerService.getProfile(req.user.sub);
    return ApiResponse.ok(res, profile);
  }

  static async updateProfile(req, res) {
    const profile = await EmployerService.updateProfile(req.user.sub, req.body);
    return ApiResponse.ok(res, profile);
  }

  static async getEmployerById(req, res) {
    const profile = await EmployerService.getPublicProfile(req.params.id);
    return ApiResponse.ok(res, profile);
  }

  static async getEmployerJobs(req, res) {
    const result = await EmployerService.getEmployerJobs(req.params.id);

    return ApiResponse.ok(res, result.items, {
      total: result.total,
    });
  }
}

export default EmployerController;