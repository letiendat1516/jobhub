/**
 * Job routes — /api/jobs
 * ------------------------------------------------------------------
 * Public search + detail endpoints, and employer-only write endpoints.
 * Authorization middleware will be applied here in Phase 7.
 */
import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import JobController from '../controllers/JobController.js';
import validateRequest from '../middlewares/validateRequest.js';
import jobValidator from '../validators/jobValidator.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

/* Public */
router.get('/', asyncHandler(JobController.getJobs));
router.get('/categories', asyncHandler(JobController.listCategories));
router.get('/skills', asyncHandler(JobController.listSkills));

/* Employer */
router.get(
  '/my-postings',
  authenticate,
  authorize('employer'),
  asyncHandler(JobController.getMyJobPostings),
);

router.post(
  '/',
  authenticate,
  authorize('employer'),
  validateRequest(jobValidator.create),
  asyncHandler(JobController.createJob),
);

router.put(
  '/:id',
  authenticate,
  authorize('employer'),
  validateRequest(jobValidator.update),
  asyncHandler(JobController.updateJob),
);

router.delete(
  '/:id',
  authenticate,
  authorize('employer'),
  asyncHandler(JobController.deleteJob),
);

router.patch(
  '/:id/close',
  authenticate,
  authorize('employer'),
  asyncHandler(JobController.closeJob),
);

router.patch(
  '/:id/reopen',
  authenticate,
  authorize('employer'),
  asyncHandler(JobController.reopenJob),
);

/* Admin */
router.get(
  '/admin/pending-review',
  authenticate,
  authorize('admin'),
  asyncHandler(JobController.getPendingReviewJobs),
);

router.patch(
  '/:id/moderate',
  authenticate,
  authorize('admin'),
  validateRequest(jobValidator.moderate),
  asyncHandler(JobController.moderateJob),
);

router.post(
  '/categories',
  authenticate,
  authorize('admin'),
  validateRequest(jobValidator.catalogItem),
  asyncHandler(JobController.createCategory),
);

router.put(
  '/categories/:id',
  authenticate,
  authorize('admin'),
  validateRequest(jobValidator.catalogItem),
  asyncHandler(JobController.updateCategory),
);

router.delete(
  '/categories/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(JobController.deleteCategory),
);

router.post(
  '/skills',
  authenticate,
  authorize('admin'),
  validateRequest(jobValidator.catalogItem),
  asyncHandler(JobController.createSkill),
);

router.put(
  '/skills/:id',
  authenticate,
  authorize('admin'),
  validateRequest(jobValidator.catalogItem),
  asyncHandler(JobController.updateSkill),
);

router.delete(
  '/skills/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(JobController.deleteSkill),
);

/* Detail */
router.get('/:id', asyncHandler(JobController.getJobById));

router.get(
  '/:id/applicants',
  authenticate,
  authorize('employer'),
  asyncHandler(JobController.getApplicants),
);

export default router;