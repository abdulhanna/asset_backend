import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import StatusCodes from 'http-status-codes';
import { isLoggedIn } from './passport.js';
import authService from "../services/auth";
import { attachCookie, revokeCookie } from "../../../helpers/cookie-manager.js";


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


// set Password

router.post(
  "/setPassword",
  httpHandler(async (req, res) => {
   const data = req.body;
   const result = await authService.setPassword(data);
   res.send(result)
  })
)


// profile complete

router.post(
  "/company-profile",
  isLoggedIn,
  httpHandler(async (req, res) => {
    const id = req.user.data._id;
    const data = req.body;
    const result = await authService.completeProfille(id,data);
    if(result.access_token)
    { 
      attachCookie(res,  {access_token: result.access_token});
      res.setHeader("access_token", result.access_token);
    }
    res.redirect(result.redirectUrl);
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
    if(result.access_token)
    {
      attachCookie(res,  {access_token: result.access_token});
      res.setHeader("access_token", result.access_token);
    }
    res.send(result);
  })
);

// Router for getting the current user
router.get(
  '/who-am-i',
  isLoggedIn,
  httpHandler(async(req, res) => {
      res.json(req.user);
  })
);

// change password
router.post(
  '/change-password',
  isLoggedIn,
  httpHandler(async (req, res) => {
    const id = req.user.data._id;
    const data = req.body;
    const result = await authService.changePassword(id, data);
    res.send(result);
  })
);


// Password Forgot
router.post(
  '/request-forgot-password',
  httpHandler(async (req, res) => {
    const result = await authService.forgetPass(req.body);
    if(result.status == '1')
    {
      res.redirect(result.redirectUrl); 
    }

    res.send(result);
  })
)

// Reset pass

router.post(
  "/reset-password",
  httpHandler(async (req, res) => {
    const result = await authService.resetPass(req.body);
    res.send(result);
  })
);

// Resend verification email

router.post(
  "/resen-verification-email",
  httpHandler(async (req, res) => {
    const result = await authService.resendVerificationemail({
      email: req.body.email,
    });
    res.send(result);
  })
);

// logout

router.get('/logout', isLoggedIn, async (req, res) => {
  await revokeCookie(req, res);
  res.removeHeader("access_token");
  res.sendStatus(StatusCodes.OK);
});




export default router;