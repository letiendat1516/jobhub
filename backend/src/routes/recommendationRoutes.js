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

export default router;
