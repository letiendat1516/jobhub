/**
 * RecommendationController
 * ------------------------------------------------------------------
 * HTTP entry point for AI-powered job recommendations.
 *
 * Delegates to RecommendationService, which coordinates:
 *   rule-based filtering (Repository) → AI matching (DeepSeek).
 *   See docs/02_ARCHITECTURE.md §5 and docs/01_PROJECT_OVERVIEW.md §5.
 *
 * Implemented in Phase 10 (AI Recommendation).
 */
import ApiError from '../utils/ApiError.js';

class RecommendationController {
  /** GET /api/recommendations — personalized jobs for the candidate */
  static async getRecommendations(_req, _res) {
    throw ApiError.notImplemented('RecommendationController.getRecommendations');
  }

  /** GET /api/recommendations/insights — matching reasoning for a job */
  static async getRecommendationInsights(_req, _res) {
    throw ApiError.notImplemented('RecommendationController.getRecommendationInsights');
  }
}

export default RecommendationController;
