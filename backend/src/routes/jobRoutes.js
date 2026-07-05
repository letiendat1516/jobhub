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

const router = Router();

router.get('/', asyncHandler(JobController.getJobs));
router.get('/:id', asyncHandler(JobController.getJobById));
router.get('/:id/applicants', asyncHandler(JobController.getApplicants));

router.post('/', validateRequest(jobValidator.create), asyncHandler(JobController.createJob));
router.put('/:id', validateRequest(jobValidator.update), asyncHandler(JobController.updateJob));
router.delete('/:id', asyncHandler(JobController.deleteJob));
router.patch('/:id/close', asyncHandler(JobController.closeJob));

export default router;
