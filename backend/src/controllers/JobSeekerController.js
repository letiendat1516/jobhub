/**
 * JobSeekerController
 * ------------------------------------------------------------------
 * HTTP entry point for job-seeker (candidate) profile management
 * (UC-03: Manage Profile).
 *
 * Thin controller delegating to JobSeekerService.
 */
import ApiResponse from '../utils/ApiResponse.js';
import JobSeekerService from '../services/JobSeekerService.js';

class JobSeekerController {
  static async getProfile(req, res) {
    const profile = await JobSeekerService.getFullProfile(req.user.sub);
    return ApiResponse.ok(res, profile);
  }

  static async updateProfile(req, res) {
    const profile = await JobSeekerService.updateProfile(req.user.sub, req.body);
    return ApiResponse.ok(res, profile);
  }
}

export default JobSeekerController;