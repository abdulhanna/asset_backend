import { Router } from 'express';
import fieldManagementRouter from './router/fieldManagement.js';

const router = Router();
router.use('/field-management', fieldManagementRouter);

const fieldManagementModule = {
     init: (app) => {
          app.use(router);
          Logger.info({
               msg: 'fieldManagement module Loaded',
          });
     },
};

export default fieldManagementModule;
