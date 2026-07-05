/**
 * Employer routes — /api/employers
 * ------------------------------------------------------------------
 * Public employer profiles + employer account management.
 */
import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import EmployerController from '../controllers/EmployerController.js';

const router = Router();

router.post('/register', asyncHandler(EmployerController.register));
router.get('/me', asyncHandler(EmployerController.getProfile));
router.put('/me', asyncHandler(EmployerController.updateProfile));
router.get('/:id', asyncHandler(EmployerController.getEmployerById));
router.get('/:id/jobs', asyncHandler(EmployerController.getEmployerJobs));

export default router;
