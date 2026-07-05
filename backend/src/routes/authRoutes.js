/**
 * Auth routes — /api/auth
 * ------------------------------------------------------------------
 * Wires HTTP verbs to AuthController methods, applying request
 * validation. Routes remain declarative; no business logic here.
 */
import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import AuthController from '../controllers/AuthController.js';
import validateRequest from '../middlewares/validateRequest.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import authValidator from '../validators/authValidator.js';

const router = Router();

router.post(
  '/register',
  validateRequest(authValidator.register),
  asyncHandler(AuthController.register),
);
router.post('/login', validateRequest(authValidator.login), asyncHandler(AuthController.login));
router.post('/logout', asyncHandler(AuthController.logout));
router.post('/refresh-token', asyncHandler(AuthController.refreshToken));
router.post('/forgot-password', asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', asyncHandler(AuthController.resetPassword));
router.post('/change-password', asyncHandler(AuthController.changePassword));
// /me yêu cầu access token hợp lệ.
router.get('/me', authenticate, asyncHandler(AuthController.getMe));

export default router;
