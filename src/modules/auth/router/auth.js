import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import StatusCodes from 'http-status-codes';
import { isLoggedIn } from './passport.js';
import authService from '../services/auth';

const router = Router();

router.post(
     '/register',
     httpHandler(async (req, res) => {
          const result = await authService.doRegister(req.body);
          res.send(result);
     })
);

// Token verify on email
router.get(
     '/confirm/:token',
     httpHandler(async (req, res) => {
          const { token } = req.params;
          const result = await authService.verifyUser(token);
          res.send(result);
     })
);

// profile complete

router.get(
     '/profileComplete/:token',
     httpHandler(async (req, res) => {
          const { token } = req.params;
          const result = await authService.verifyUser(token);
          res.send(result);
     })
);

export default router;
