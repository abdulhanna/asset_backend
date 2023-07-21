import { Router } from 'express';
import userManagementRouter from './router/permission.js';
import userRoleRouter from './router/roles.js';

const router = Router();
router.use('/user-management', userManagementRouter);
router.use('/user-management/roles', userRoleRouter);

const userManagementModule = {
     init: (app) => {
          app.use(router);
          Logger.info({
               msg: 'userManagement module Loaded',
          });
     },
};

export default userManagementModule;
