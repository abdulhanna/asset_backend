import { Router } from 'express';
import locationRouter from './router/locations';
import departementRouter from './router/departments';
const router = Router();

router.use('/organization/locations', locationRouter);
router.use('/organization/departments', departementRouter);

const organizationModule = {
     init: (app) => {
          app.use(router);
          Logger.info({
               msg: 'Organization module Loaded',
          });
     },
};

export default organizationModule;
