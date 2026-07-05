/**
 * ResumeService
 * ------------------------------------------------------------------
 * Business logic for resumes, including the AI analysis workflow:
 *
 *   Upload CV → parse/validate → DeepSeek extraction → structured
 *   profile → persist via ResumeRepository.
 *
 * The Service owns the orchestration and validation; DeepSeek acts
 * only as an analysis service (docs/07_AI_AGENT_RULES.md §8). The
 * Service must never trust AI output blindly — results are validated
 * before persistence.
 *
 * Implemented in Phase 6 (Resume) and Phase 9 (AI Resume Analysis).
 */
import ApiError from '../utils/ApiError.js';

class ResumeService {
  static async uploadResume(_userId, _file) {
    throw ApiError.notImplemented('ResumeService.uploadResume');
  }

  static async getResume(_userId, _resumeId) {
    throw ApiError.notImplemented('ResumeService.getResume');
  }

  static async updateResume(_userId, _resumeId, _payload) {
    throw ApiError.notImplemented('ResumeService.updateResume');
  }

  static async deleteResume(_userId, _resumeId) {
    throw ApiError.notImplemented('ResumeService.deleteResume');
  }

  /**
   * Runs the AI extraction pipeline on a stored resume and persists
   * the structured result (skills, experience, education, ...).
   */
  static async analyzeResume(_userId, _resumeId) {
    throw ApiError.notImplemented('ResumeService.analyzeResume');
  }
}

export default ResumeService;
