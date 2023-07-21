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

// Create a new member
router.post('/createMember', async (req, res) => {
     try {
          const { email, password, parentId, userProfile } = req.body;

          const userData = {
               email,
               password,
               parentId,
               userProfile,
          };

          const member = await authService.createMember(userData);
          res.status(201).json({ success: true, member });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

// Get all members of a superadmin
router.get('/members/:parentId', async (req, res) => {
     try {
          const { parentId } = req.params;
          const members = await authService.getAllMembers(parentId);
          res.status(200).json({ success: true, members });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

export default router;
