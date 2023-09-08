import {Router} from 'express';
import locationRouter from './router/locations';
import departementRouter from './router/departments';
import assetGroupRouter from './router/assetGroups';
import organizationRouter from './router/organizations';
import assetFieldsRouter from './router/assetFields';

const router = Router();

router.use('/organization/locations', locationRouter);
router.use('/organization/departments', departementRouter);
router.use('/organization/assetgroup', assetGroupRouter);
router.use('/organization', organizationRouter);
router.use('/organization/assetfields', assetFieldsRouter);

const organizationModule = {
    init: (app) => {
        app.use(router);
        Logger.info({
            msg: 'Organization module Loaded',
        });
    },
};

export default organizationModule;
