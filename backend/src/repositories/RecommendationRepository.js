/**
 * RecommendationRepository
 * ------------------------------------------------------------------
 * Data access supporting the recommendation pipeline: candidate
 * profile retrieval and rule-based pre-filtering of the job pool
 * (Phase 1 of the two-phase pipeline in docs/02_ARCHITECTURE.md §5).
 *
 * Only this layer issues the filtering SQL. The AI matching in
 * Phase 2 happens in the Service layer via DeepSeek. Implemented in
 * Phase 10 (AI Recommendation).
 */
import ApiError from '../utils/ApiError.js';

class RecommendationRepository {
  static async getCandidateProfile(_userId) {
    throw ApiError.notImplemented('RecommendationRepository.getCandidateProfile');
  }

  static async filterCandidateJobs(_userId, _filters) {
    throw ApiError.notImplemented('RecommendationRepository.filterCandidateJobs');
  }

  static async saveRecommendation(_payload) {
    throw ApiError.notImplemented('RecommendationRepository.saveRecommendation');
  }
}

export default RecommendationRepository;
