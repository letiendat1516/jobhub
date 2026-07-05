/**
 * ApplicationController
 * ------------------------------------------------------------------
 * HTTP entry point for job applications and their lifecycle status.
 *
 * Delegates to ApplicationService. Implemented in Phase 8 (Application).
 */
import ApiError from '../utils/ApiError.js';

class ApplicationController {
  /** POST /api/applications */
  static async applyJob(_req, _res) {
    throw ApiError.notImplemented('ApplicationController.applyJob');
  }

  /** GET /api/applications/me — candidate's submitted applications */
  static async getMyApplications(_req, _res) {
    throw ApiError.notImplemented('ApplicationController.getMyApplications');
  }

  /** GET /api/applications/:id */
  static async getApplicationById(_req, _res) {
    throw ApiError.notImplemented('ApplicationController.getApplicationById');
  }

  /** PATCH /api/applications/:id/status — employer approves/rejects */
  static async updateApplicationStatus(_req, _res) {
    throw ApiError.notImplemented('ApplicationController.updateApplicationStatus');
  }
}

export default ApplicationController;
