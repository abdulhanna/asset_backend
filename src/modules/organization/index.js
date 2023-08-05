import { Router } from 'express';
import locationRouter from './router/locations';
import departementRouter from './router/departments';
import assetGroupRouter from './router/assetGroups';
const router = Router();

router.use('/organization/locations', locationRouter);
router.use('/organization/departments', departementRouter);
router.use('/organization/assetgroup', assetGroupRouter);

const organizationModule = {
     init: (app) => {
          app.use(router);
          Logger.info({
               msg: 'Organization module Loaded',
          });
     },
};

export default organizationModule;
