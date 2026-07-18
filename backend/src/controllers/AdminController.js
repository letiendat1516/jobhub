import AdminService from '../services/AdminService.js';
import ApiResponse from '../utils/ApiResponse.js';

class AdminController {
  static async listJobSeekers(req, res) {
    return ApiResponse.ok(res, await AdminService.listJobSeekers(req.query));
  }

  static async listUserEmployers(req, res) {
    return ApiResponse.ok(res, await AdminService.listUserEmployers(req.query));
  }

  static async listEmployers(req, res) {
    return ApiResponse.ok(res, await AdminService.listEmployers(req.query));
  }

  static async updateJobSeekerStatus(req, res) {
    const result = await AdminService.updateJobSeekerStatus(req.params.id, req.body.action);
    return ApiResponse.ok(res, result);
  }

  static async updateEmployerStatus(req, res) {
    const result = await AdminService.updateEmployerStatus(req.params.id, req.body.action);
    return ApiResponse.ok(res, result);
  }

  static async updateEmployerVerification(req, res) {
    const result = await AdminService.updateEmployerVerification(req.params.id, req.body.action);
    return ApiResponse.ok(res, result);
  }
}

export default AdminController;
