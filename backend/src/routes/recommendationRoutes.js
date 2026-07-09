/**
 * Recommendation routes — /api/recommendations
 * ------------------------------------------------------------------
 * AI-powered job recommendations for the authenticated candidate.
 */
import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import RecommendationController from '../controllers/RecommendationController.js';

const router = Router();

router.get('/', asyncHandler(RecommendationController.getRecommendations));
router.get('/insights', asyncHandler(RecommendationController.getRecommendationInsights));
router.get('/logs', asyncHandler(RecommendationController.getAiLogs));
router.post('/score', asyncHandler(RecommendationController.scoreJobs));
router.post('/score-sql', asyncHandler(RecommendationController.scoreJobsSql));
router.post('/extract-cv', asyncHandler(RecommendationController.extractCv));
router.post('/save', asyncHandler(RecommendationController.saveScores));
router.get('/saved', asyncHandler(RecommendationController.getSavedScores));

export default router;
