import { Router } from 'express';
import locationRouter from './router/locations';
const router = Router();

router.use('/organization/locations', locationRouter);

const organizationModule = {
     init: (app) => {
          app.use(router);
          Logger.info({
               msg: 'Organization module Loaded',
          });
     },
};

export default organizationModule;
