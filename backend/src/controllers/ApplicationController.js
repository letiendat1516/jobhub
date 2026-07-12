import ApplicationService from '../services/ApplicationService.js';
import ApiResponse from '../utils/ApiResponse.js';

class ApplicationController {
  static async getApplyContext(req, res) {
    return ApiResponse.ok(
      res,
      await ApplicationService.getApplyContext(req.user.sub, req.params.id),
    );
  }

  static async applyJob(req, res) {
    return ApiResponse.created(res, await ApplicationService.applyJob(req.user.sub, req.body));
  }

  static async getMyApplications(req, res) {
    const result = await ApplicationService.listMine(req.user.sub, req.query);
    return ApiResponse.ok(res, result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  }

  static async getMyApplication(req, res) {
    return ApiResponse.ok(res, await ApplicationService.getMine(req.user.sub, req.params.id));
  }

  static async getEmployerApplications(req, res) {
    const result = await ApplicationService.listForEmployer(req.user.sub, req.user.role, req.query);
    return ApiResponse.ok(res, result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  }

  static async reviewApplication(req, res) {
    return ApiResponse.ok(
      res,
      await ApplicationService.reviewForEmployer(req.user.sub, req.user.role, req.params.id),
    );
  }

  static async updateApplicationStatus(req, res) {
    return ApiResponse.ok(
      res,
      await ApplicationService.updateStatus(req.user.sub, req.user.role, req.params.id, req.body),
    );
  }
}

export default ApplicationController;
