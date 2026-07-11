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
import ApiResponse from '../utils/ApiResponse.js';
import JobService from '../services/JobService.js';

class JobController {
  static async getJobs(req, res) {
    const result = await JobService.searchJobs(req.query);

    return ApiResponse.ok(res, result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  }

  static async getJobById(req, res) {
    const job = await JobService.getJobById(req.params.id);
    return ApiResponse.ok(res, job);
  }

  static async getMyJobPostings(req, res) {
    const result = await JobService.getEmployerJobs(req.user.sub);

    return ApiResponse.ok(res, result.items, {
      total: result.total,
    });
  }

  static async createJob(req, res) {
    const job = await JobService.createJob(req.user.sub, req.body);
    return ApiResponse.created(res, job);
  }

  static async updateJob(req, res) {
    const job = await JobService.updateJob(req.user.sub, req.params.id, req.body);
    return ApiResponse.ok(res, job);
  }

  static async deleteJob(req, res) {
    const result = await JobService.deleteJob(req.user.sub, req.params.id);
    return ApiResponse.ok(res, result);
  }

  static async closeJob(req, res) {
    const job = await JobService.closeJob(req.user.sub, req.params.id);
    return ApiResponse.ok(res, job);
  }

  static async getPendingReviewJobs(_req, res) {
    const result = await JobService.getPendingReviewJobs();

    return ApiResponse.ok(res, result.items, {
      total: result.total,
    });
  }

  static async moderateJob(req, res) {
    const job = await JobService.moderateJob(req.params.id, req.body.decision);
    return ApiResponse.ok(res, job);
  }

  static async listCategories(_req, res) {
    const categories = await JobService.listCategories();
    return ApiResponse.ok(res, categories);
  }

  static async createCategory(req, res) {
    const category = await JobService.createCategory(req.body.name);
    return ApiResponse.created(res, category);
  }

  static async updateCategory(req, res) {
    const category = await JobService.updateCategory(req.params.id, req.body.name);
    return ApiResponse.ok(res, category);
  }

  static async deleteCategory(req, res) {
    const result = await JobService.deleteCategory(req.params.id);
    return ApiResponse.ok(res, result);
  }

  static async listSkills(_req, res) {
    const skills = await JobService.listSkills();
    return ApiResponse.ok(res, skills);
  }

  static async createSkill(req, res) {
    const skill = await JobService.createSkill(req.body.name);
    return ApiResponse.created(res, skill);
  }

  static async updateSkill(req, res) {
    const skill = await JobService.updateSkill(req.params.id, req.body.name);
    return ApiResponse.ok(res, skill);
  }

  static async deleteSkill(req, res) {
    const result = await JobService.deleteSkill(req.params.id);
    return ApiResponse.ok(res, result);
  }

  static async getApplicants(req, res) {
    const applicants = await JobService.getApplicants(req.user.sub, req.params.id);
    return ApiResponse.ok(res, applicants);
  }
}

export default JobController;