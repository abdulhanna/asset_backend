import { Router } from 'express';
import { memberService } from '../services/userMember.js';
import { isLoggedIn } from '../../auth/router/passport.js';

const router = Router();
// Create a new member
router.post('/createMember', isLoggedIn, async (req, res) => {
     try {
          const parentId = req.user.data._id;
          const organizationId = req.user.data.organizationId;
          const dashboardPermission = req.user.data.dashboardPermission;

          const { email, password, userProfile, teamRoleId } = req.body;

          const userData = {
               email,
               password,
               userProfile,
               teamRoleId,
               parentId,
               dashboardPermission,
               organizationId,
          };

          const member = await memberService.createMember(userData);
          return res.status(201).json({ success: true, member });
     } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
     }
});

// Update member
router.put('/updateMember/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const data = req.body;

          const updateMember = await memberService.updateMember(id, data);
          return res.status(201).json({
               success: true,
               updateMember,
          });
     } catch (error) {
          return res.status(500).json({
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
               return res.status(200).json({
                    success: true,
                    message: 'Password set successfully',
               });
          } else {
               return res.status(404).json({
                    success: false,
                    message: 'Invalid verification token',
               });
          }
     } catch (error) {
          return res.status(500).json({
               success: false,
               error: 'Failed to set password',
          });
     }
});

// Get all members of a superadmin
router.get('/:parentId', isLoggedIn, async (req, res) => {
     try {
          const { parentId } = req.params;
          const members = await memberService.getAllMembers(parentId);
          return res.status(200).json({ success: true, members });
     } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
     }
});

// GET /members (Get members by roleName)
router.get('/', isLoggedIn, async (req, res) => {
     try {
          const { roleName } = req.query;
          const parentId = req.user.data._id; // Get the parent user ID from the authenticated user

          const assignedUsers = await memberService.getMembersByRole(
               parentId,
               roleName
          );

          const assignedUserCounts = assignedUsers.length;
          return res.json({ success: true, assignedUserCounts, assignedUsers });
     } catch (error) {
          console.log(error);
          return res.status(500).json({ success: false, error: error.message });
     }
});

export default router;
