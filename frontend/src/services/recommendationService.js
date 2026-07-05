/**
 * recommendationService — AI job recommendation API surface.
 * Scaffold only. Wired in Phase 10 (AI Recommendation).
 */
import apiClient from './apiClient.js';

const recommendationService = {
  /** GET /recommendations */
  getRecommendations: () => apiClient.get('/recommendations'),
};

export default recommendationService;
