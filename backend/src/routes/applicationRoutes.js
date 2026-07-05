/**
 * Application routes — /api/applications
 * ------------------------------------------------------------------
 * Candidate submission + tracking, and employer status updates.
 */
import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApplicationController from '../controllers/ApplicationController.js';

const router = Router();

router.post('/', asyncHandler(ApplicationController.applyJob));
router.get('/me', asyncHandler(ApplicationController.getMyApplications));
router.get('/:id', asyncHandler(ApplicationController.getApplicationById));
router.patch('/:id/status', asyncHandler(ApplicationController.updateApplicationStatus));

export default router;
