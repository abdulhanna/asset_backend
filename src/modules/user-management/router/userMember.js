import { Router } from 'express';
import { memberService } from '../services/userMember.js';
import { isLoggedIn } from '../../auth/router/passport.js';

const router = Router();
// Create a new member
router.post('/createMember', isLoggedIn, async (req, res) => {
     try {
          const parentId = req.user.data._id;

          const { email, password, userProfile, teamrole } = req.body;

          const userData = {
               email,
               password,
               userProfile,
               teamrole,
               parentId,
          };

          const member = await memberService.createMember(userData);
          res.status(201).json({ success: true, member });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

// Update member
router.put('/updateMember/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const data = req.body;

          const updateMember = await memberService.updateMember(id, data);
          res.status(201).json({
               success: true,
               updateMember,
          });
     } catch (error) {
          res.status(500).json({
               success: false,
               error: error.message,
          });
     }
});

// Set password for the member using verification token
router.post('/set-password', async (req, res) => {
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
router.get('/:parentId', async (req, res) => {
     try {
          const { parentId } = req.params;
          const members = await memberService.getAllMembers(parentId);
          res.status(200).json({ success: true, members });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

export default router;
