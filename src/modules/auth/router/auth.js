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

// Create a new member
router.post('/createMember', async (req, res) => {
     try {
          const { email, password, parentId, userProfile, teamrole } = req.body;

          const userData = {
               email,
               password,
               parentId,
               userProfile,
               teamrole,
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

// Set password for the member using verification token
router.post('/members/set-password', async (req, res) => {
     try {
          const { verificationToken, password } = req.body;

          // You can handle the verification token validation here

          const result = await authService.setPassword(
               verificationToken,
               password
          );

          if (result.success) {
               res.status(200).json({
                    success: true,
                    message: 'Password set successfully',
               });
          } else {
               res.status(404).json({
                    success: false,
                    message: 'Invalid verification token',
               });
          }
     } catch (error) {
          res.status(500).json({
               success: false,
               error: 'Failed to set password',
          });
     }
});

export default router;
