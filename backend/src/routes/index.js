/**
 * API router aggregator
 * ------------------------------------------------------------------
 * Mounts every resource router under /api. Each sub-router owns its
 * own validation + auth concerns; this file only composes them.
 */
import { Router } from 'express';

import authRoutes from './authRoutes.js';
import jobRoutes from './jobRoutes.js';
import employerRoutes from './employerRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import systemConfigurationRoutes from './systemConfigurationRoutes.js';
const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'JobHub API',
      docs: '/api/health',
      modules: [
        'auth',
        'jobs',
        'employers',
        'resumes',
        'applications',
        'recommendations',
        'system-configurations'
      ],
    },
  });
});

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/employers', employerRoutes);
router.use('/resumes', resumeRoutes);
router.use('/applications', applicationRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/system-configurations', systemConfigurationRoutes);
export default router;
