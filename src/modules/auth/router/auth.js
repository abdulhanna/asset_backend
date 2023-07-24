import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import StatusCodes from 'http-status-codes';
import { isLoggedIn } from './passport.js';
import authService from '../services/auth';
import userModel from '../models/index.js';

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
          console.log(result);
          res.redirect(result);
     })
);

// profile complete

router.post(
     '/profileComplete',
     httpHandler(async (req, res) => {
          const result = await authService.completeProfille(req.body);
          res.send(result);
     })
);

export default router;
