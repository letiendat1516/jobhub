import { Router } from 'express';
import ResumeController from '../controllers/ResumeController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import resumeUpload from '../middlewares/resumeUpload.js';
import validateRequest from '../middlewares/validateRequest.js';
import resumeValidator from '../validators/resumeValidator.js';
import applicationValidator from '../validators/applicationValidator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, authorize('job_seeker'));

router.post('/', resumeUpload.single('resume'), asyncHandler(ResumeController.uploadResume));
router.get('/me', asyncHandler(ResumeController.getMyResume));
router.get(
  '/:id/download',
  validateRequest(applicationValidator.params, 'params'),
  asyncHandler(ResumeController.downloadResume),
);
router.put(
  '/:id',
  validateRequest(applicationValidator.params, 'params'),
  validateRequest(resumeValidator.setPrimary),
  asyncHandler(ResumeController.updateResume),
);
router.delete(
  '/:id',
  validateRequest(applicationValidator.params, 'params'),
  asyncHandler(ResumeController.deleteResume),
);

// UC-AI-01: phân tích CV bằng AI
router.post(
  '/:id/analyze',
  validateRequest(applicationValidator.params, 'params'),
  asyncHandler(ResumeController.analyzeResume),
);
router.get(
  '/:id/analysis',
  validateRequest(applicationValidator.params, 'params'),
  asyncHandler(ResumeController.getAnalysis),
);

export default router;