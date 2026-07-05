/**
 * JobController
 * ------------------------------------------------------------------
 * HTTP entry point for job postings (CRUD + search).
 *
 * Thin controller: validates input, delegates to JobService, returns
 * an ApiResponse. No SQL, no business rules, no AI calls.
 *
 * Implemented in Phase 7 (Job).
 */
import ApiError from '../utils/ApiError.js';

class JobController {
  /** GET /api/jobs — search/list with filters */
  static async getJobs(_req, _res) {
    throw ApiError.notImplemented('JobController.getJobs');
  }

  /** GET /api/jobs/:id */
  static async getJobById(_req, _res) {
    throw ApiError.notImplemented('JobController.getJobById');
  }

  /** POST /api/jobs */
  static async createJob(_req, _res) {
    throw ApiError.notImplemented('JobController.createJob');
  }

  /** PUT /api/jobs/:id */
  static async updateJob(_req, _res) {
    throw ApiError.notImplemented('JobController.updateJob');
  }

  /** DELETE /api/jobs/:id */
  static async deleteJob(_req, _res) {
    throw ApiError.notImplemented('JobController.deleteJob');
  }

  /** PATCH /api/jobs/:id/close */
  static async closeJob(_req, _res) {
    throw ApiError.notImplemented('JobController.closeJob');
  }

  /** GET /api/jobs/:id/applicants */
  static async getApplicants(_req, _res) {
    throw ApiError.notImplemented('JobController.getApplicants');
  }
}

export default JobController;
