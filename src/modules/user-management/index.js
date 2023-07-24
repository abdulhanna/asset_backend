import { Router } from 'express';
import userManagementRouter from './router/permissions.js';
import userRoleRouter from './router/roles.js';
import membersRouter from './router/userMember.js';

const router = Router();
router.use('/user-management/permissions', userManagementRouter);
router.use('/user-management/roles', userRoleRouter);
router.use('/user-management/members', membersRouter);

const userManagementModule = {
     init: (app) => {
          app.use(router);
          Logger.info({
               msg: 'userManagement module Loaded',
          });
     },
};

export default userManagementModule;
