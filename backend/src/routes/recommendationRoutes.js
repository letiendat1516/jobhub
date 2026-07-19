/**
 * Recommendation routes — /api/recommendations
 * ------------------------------------------------------------------
 * AI-powered job recommendations for the authenticated candidate.
 *
 * SECURITY:
 *   - All routes require a valid JWT (authenticate).
 *   - AI-cost routes (/score, /extract-cv) have a tighter rate-limit
 *     to prevent billing DoS and prompt-injection abuse.
 *   - /logs exposes raw prompt/response PII → admin only.
 */
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import asyncHandler from '../utils/asyncHandler.js';
import RecommendationController from '../controllers/RecommendationController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

/** Tighter rate-limit for DeepSeek calls: 20 requests / 15 min / IP */
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Quá nhiều yêu cầu AI. Vui lòng thử lại sau 15 phút.' },
  },
});

const router = Router();

// All recommendation endpoints require authentication.
router.use(authenticate);

router.get('/', asyncHandler(RecommendationController.getRecommendations));
router.get('/insights', asyncHandler(RecommendationController.getRecommendationInsights));

// AI logs contain full CV text / PII — admin only.
router.get('/logs', authorize('admin'), asyncHandler(RecommendationController.getAiLogs));

// DeepSeek-backed routes carry a cost → extra rate-limiting.
router.post('/score', aiRateLimit, asyncHandler(RecommendationController.scoreJobs));
router.post('/score-sql', asyncHandler(RecommendationController.scoreJobsSql));
router.post('/extract-cv', aiRateLimit, asyncHandler(RecommendationController.extractCv));

// Authenticated job_seeker save/retrieve scored results.
router.post('/save', authorize('job_seeker'), asyncHandler(RecommendationController.saveScores));
router.get('/saved', authorize('job_seeker'), asyncHandler(RecommendationController.getSavedScores));

// DeepSeek API key runtime override — admin only (thay server AI credentials).
// /test gọi thật DeepSeek → gắn aiRateLimit như /score, /extract-cv.
router.get('/deepseek-key', authorize('admin'), asyncHandler(RecommendationController.getDeepseekKeyStatus));
router.post('/deepseek-key', authorize('admin'), asyncHandler(RecommendationController.setDeepseekKey));
router.delete('/deepseek-key', authorize('admin'), asyncHandler(RecommendationController.clearDeepseekKey));
router.post('/deepseek-key/test', authorize('admin'), aiRateLimit, asyncHandler(RecommendationController.testDeepseekKey));

export default router;
