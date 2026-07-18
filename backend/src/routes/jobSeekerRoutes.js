/**
 * Job-seeker routes — /api/job-seekers
 * ------------------------------------------------------------------
 * Candidate profile management (UC-03: Manage Profile).
 */
import { Router } from 'express';

import asyncHandler from '../utils/asyncHandler.js';
import JobSeekerController from '../controllers/JobSeekerController.js';
import validateRequest from '../middlewares/validateRequest.js';
import jobSeekerValidator from '../validators/jobSeekerValidator.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
  '/me',
  authenticate,
  authorize('job_seeker'),
  asyncHandler(JobSeekerController.getProfile),
);

router.put(
  '/me',
  authenticate,
  authorize('job_seeker'),
  validateRequest(jobSeekerValidator.updateProfile),
  asyncHandler(JobSeekerController.updateProfile),
);

export default router;
