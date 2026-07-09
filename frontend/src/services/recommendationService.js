/**
 * recommendationService — AI job recommendation API surface.
 *
 * AI endpoints (score, extract-cv) có timeout dài hơn mặc định (3 phút / 2 phút)
 * vì DeepSeek có thể mất 30-90 giây để xử lý, đặc biệt khi chấm điểm nhiều jobs.
 */
import apiClient from './apiClient.js';

// Timeout cho AI endpoints (ms). Mặc định apiClient là 20s — quá ngắn cho AI.
const AI_TIMEOUT_SCORE = 300000; // 5 phút cho chấm điểm (batch processing)
const AI_TIMEOUT_EXTRACT = 120000; // 2 phút cho trích xuất CV

const recommendationService = {
  /** GET /recommendations */
  getRecommendations: () => apiClient.get('/recommendations'),

  /** POST /recommendations/score — AI score (DeepSeek) */
  scoreJobs: (cv, jobs) =>
    apiClient.post('/recommendations/score', { cv, jobs }, { timeout: AI_TIMEOUT_SCORE }),

  /** POST /recommendations/score-sql — SQL/rule-based score (instant, free) */
  scoreJobsSql: (cv, jobs) => apiClient.post('/recommendations/score-sql', { cv, jobs }),

  /** POST /recommendations/extract-cv — trích CV text → structured JSON */
  extractCv: (resumeText) =>
    apiClient.post('/recommendations/extract-cv', { resumeText }, { timeout: AI_TIMEOUT_EXTRACT }),

  /** POST /recommendations/save — lưu kết quả chấm điểm */
  saveScores: (payload) => apiClient.post('/recommendations/save', payload),

  /** GET /recommendations/saved — lấy kết quả đã lưu */
  getSavedScores: () => apiClient.get('/recommendations/saved'),

  /** GET /recommendations/logs — danh sách AI logs */
  getAiLogs: (limit = 50) => apiClient.get('/recommendations/logs', { params: { limit } }),
};

export default recommendationService;
