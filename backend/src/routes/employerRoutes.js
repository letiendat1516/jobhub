/**
 * Employer routes — /api/employers
 * ------------------------------------------------------------------
 * Public employer profiles + employer account management.
 */
import { Router } from 'express';

import asyncHandler from '../utils/asyncHandler.js';
import EmployerController from '../controllers/EmployerController.js';
import validateRequest from '../middlewares/validateRequest.js';
import employerValidator from '../validators/employerValidator.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', asyncHandler(EmployerController.listEmployers));

router.get(
  '/me',
  authenticate,
  authorize('employer'),
  asyncHandler(EmployerController.getProfile),
);

router.put(
  '/me',
  authenticate,
  authorize('employer'),
  validateRequest(employerValidator.updateProfile),
  asyncHandler(EmployerController.updateProfile),
);

router.get('/:id/jobs', asyncHandler(EmployerController.getEmployerJobs));
router.get('/:id', asyncHandler(EmployerController.getEmployerById));

export default router;