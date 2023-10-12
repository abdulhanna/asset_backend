import {Router} from 'express';
import fieldManagementRouter from './router/fieldManagement.js';
import assetFormManagement from './router/assetFormManagement';
import assetFormStepManagement from './router/assetFormStep';

const router = Router();
router.use('/field-management', fieldManagementRouter);
router.use('/form-management', assetFormManagement);
router.use('/form-step', assetFormStepManagement);

const fieldManagementModule = {
    init: (app) => {
        app.use(router);
        Logger.info({
            msg: 'fieldManagement module Loaded',
        });
    },
};

export default fieldManagementModule;
