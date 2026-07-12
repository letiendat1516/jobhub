import { Router } from 'express';
import ApplicationController from '../controllers/ApplicationController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import asyncHandler from '../utils/asyncHandler.js';
import applicationValidator from '../validators/applicationValidator.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('job_seeker'),
  validateRequest(applicationValidator.apply),
  asyncHandler(ApplicationController.applyJob),
);
router.get(
  '/me',
  authorize('job_seeker'),
  validateRequest(applicationValidator.list, 'query'),
  asyncHandler(ApplicationController.getMyApplications),
);
router.get(
  '/me/:id',
  authorize('job_seeker'),
  validateRequest(applicationValidator.params, 'params'),
  asyncHandler(ApplicationController.getMyApplication),
);
router.get(
  '/apply-context/:id',
  authorize('job_seeker'),
  validateRequest(applicationValidator.params, 'params'),
  asyncHandler(ApplicationController.getApplyContext),
);

router.get(
  '/employer',
  authorize('employer', 'admin'),
  validateRequest(applicationValidator.list, 'query'),
  asyncHandler(ApplicationController.getEmployerApplications),
);
router.get(
  '/employer/:id',
  authorize('employer', 'admin'),
  validateRequest(applicationValidator.params, 'params'),
  asyncHandler(ApplicationController.reviewApplication),
);
router.patch(
  '/employer/:id/status',
  authorize('employer', 'admin'),
  validateRequest(applicationValidator.params, 'params'),
  validateRequest(applicationValidator.updateStatus),
  asyncHandler(ApplicationController.updateApplicationStatus),
);

export default router;
