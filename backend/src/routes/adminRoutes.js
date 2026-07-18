import { Router } from 'express';
import AdminController from '../controllers/AdminController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import adminValidator from '../validators/adminValidator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, authorize('admin'));

router.get(
  '/users/job-seekers',
  validateRequest(adminValidator.userList, 'query'),
  asyncHandler(AdminController.listJobSeekers),
);
router.get(
  '/users/employers',
  validateRequest(adminValidator.userList, 'query'),
  asyncHandler(AdminController.listUserEmployers),
);
router.patch(
  '/users/job-seekers/:id/status',
  validateRequest(adminValidator.idParams, 'params'),
  validateRequest(adminValidator.accountStatusAction),
  asyncHandler(AdminController.updateJobSeekerStatus),
);
router.patch(
  '/users/employers/:id/status',
  validateRequest(adminValidator.idParams, 'params'),
  validateRequest(adminValidator.accountStatusAction),
  asyncHandler(AdminController.updateEmployerStatus),
);
router.get(
  '/employers',
  validateRequest(adminValidator.employerList, 'query'),
  asyncHandler(AdminController.listEmployers),
);
router.patch(
  '/employers/:id/verification',
  validateRequest(adminValidator.idParams, 'params'),
  validateRequest(adminValidator.verificationAction),
  asyncHandler(AdminController.updateEmployerVerification),
);

export default router;
