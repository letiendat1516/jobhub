/**
 * ResumeController
 * ------------------------------------------------------------------
 * HTTP entry point for candidate resumes (PDF upload + management).
 *
 * Delegates to ResumeService, which orchestrates the AI analysis
 * workflow (see docs/02_ARCHITECTURE.md §5).
 *
 * Implemented in Phase 6 (Resume) and Phase 9 (AI Resume Analysis).
 */
import ApiError from '../utils/ApiError.js';

class ResumeController {
  /** POST /api/resumes (multipart/form-data) */
  static async uploadResume(_req, _res) {
    throw ApiError.notImplemented('ResumeController.uploadResume');
  }

  /** GET /api/resumes/me */
  static async getMyResume(_req, _res) {
    throw ApiError.notImplemented('ResumeController.getMyResume');
  }

  /** PUT /api/resumes/:id */
  static async updateResume(_req, _res) {
    throw ApiError.notImplemented('ResumeController.updateResume');
  }

  /** DELETE /api/resumes/:id */
  static async deleteResume(_req, _res) {
    throw ApiError.notImplemented('ResumeController.deleteResume');
  }

  /** POST /api/resumes/:id/analyze — triggers AI extraction */
  static async analyzeResume(_req, _res) {
    throw ApiError.notImplemented('ResumeController.analyzeResume');
  }
}

export default ResumeController;
