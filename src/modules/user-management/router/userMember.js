import { Router } from 'express';
import { memberService } from '../services/userMember.js';

const router = Router();
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

          const member = await memberService.createMember(userData);
          res.status(201).json({ success: true, member });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

// Set password for the member using verification token
router.post('/members/set-password', async (req, res) => {
     try {
          const { verificationToken, password } = req.body;

          // You can handle the verification token validation here

          const result = await memberService.setPassword(
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

// Get all members of a superadmin
router.get('/members/:parentId', async (req, res) => {
     try {
          const { parentId } = req.params;
          const members = await memberService.getAllMembers(parentId);
          res.status(200).json({ success: true, members });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

export default router;
