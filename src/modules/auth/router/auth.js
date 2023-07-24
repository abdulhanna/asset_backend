import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import StatusCodes from 'http-status-codes';
import { isLoggedIn } from './passport.js';
import authService from "../services/auth";
import { attachCookie } from "../../../helpers/cookie-manager.js";


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
  "/confirm/:token",
  httpHandler(async (req, res) => {
    const { token } = req.params;
    const result = await authService.verifyUser(token);
    res.redirect(result);
  })
);

// profile complete

router.post(
  "/profileComplete",
  httpHandler(async (req, res) => {
    const result = await authService.completeProfille(req.body);
     attachCookie(res,  {access_token: result.access_token});
    res.redirect(result.redirectURL);
  })
)


//login API

router.post(
  '/login',
  httpHandler(async (req, res) => {
    const result = await authService.doLogin({
      email: req.body.email,
      password: req.body.password,
    });
    attachCookie(res, {access_token: result.access_token});
    res.send(result.userData);
  })
);


export default router;