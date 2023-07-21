import { Router } from 'express';
import authRouter from './router/auth';

const router = Router();
router.use('/auth', authRouter);

const authModule = {
     init: (app) => {
          app.use(router);
          Logger.info({
               msg: 'Auth module Loaded',
          });
     },
};

export default authModule;
