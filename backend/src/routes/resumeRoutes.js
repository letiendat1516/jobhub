/**
 * Resume routes — /api/resumes
 * ------------------------------------------------------------------
 * Candidate resume upload (multipart) + management + AI analysis.
 */
import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ResumeController from '../controllers/ResumeController.js';

const router = Router();

router.post('/', asyncHandler(ResumeController.uploadResume));
router.get('/me', asyncHandler(ResumeController.getMyResume));
router.put('/:id', asyncHandler(ResumeController.updateResume));
router.delete('/:id', asyncHandler(ResumeController.deleteResume));
router.post('/:id/analyze', asyncHandler(ResumeController.analyzeResume));

export default router;
