import express from 'express';

import * as configController
    from '../controllers/systemConfigurationController.js';

import {
    authenticate,
    authorize,
} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả endpoint đều cần đăng nhập.
// READ (GET) mở cho mọi user đã đăng nhập — employer cần đọc config
// (vd MAX_SKILLS_PER_JOB) khi đăng tin (xem CreateJobPage.jsx).
// Service-to-service calls (vd JobService) vẫn qua service layer trực tiếp.
router.use(authenticate);

router.get(
    '/',
    configController.getAllConfigurations,
);

router.get(
    '/:key',
    configController.getConfigurationByKey,
);

// Chỉ admin được thay đổi config.
router.patch(
    '/:key',
    authorize('admin'),
    configController.updateConfiguration,
);

export default router;
