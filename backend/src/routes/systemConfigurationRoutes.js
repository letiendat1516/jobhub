import express from 'express';

import * as configController
    from '../controllers/systemConfigurationController.js';

import {
    authenticate,
    authorize,
} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get(
    '/',
    configController.getAllConfigurations,
);

router.get(
    '/:key',
    configController.getConfigurationByKey,
);

router.patch(
    '/:key',
    authorize('admin'),
    configController.updateConfiguration,
);

export default router;