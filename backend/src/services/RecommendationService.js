/**
 * RecommendationService
 * ------------------------------------------------------------------
 * Business logic for AI job recommendation (two-phase pipeline):
 *
 *   Phase 1 — Rule-based filtering via the Repository layer
 *             (location, salary, work type, required skills, experience).
 *   Phase 2 — AI matching via DeepSeek using the candidate profile +
 *             filtered jobs. Returns score, reasons, missing skills,
 *             strengths, and suggested improvements.
 *
 * DeepSeek is an external analysis service only (docs/02 §5,
 * docs/07 §8). The Service owns workflow, validation, and persistence;
 * AI never touches the database or receives raw SQL.
 *
 * Implemented in Phase 10 (AI Recommendation).
 */
import ApiError from '../utils/ApiError.js';

class RecommendationService {
  /** @param {string} _userId - candidate whose profile is matched. */
  static async getRecommendations(_userId, _context) {
    throw ApiError.notImplemented('RecommendationService.getRecommendations');
  }

  static async getRecommendationInsights(_userId, _jobId) {
    throw ApiError.notImplemented('RecommendationService.getRecommendationInsights');
  }
}

export default RecommendationService;
