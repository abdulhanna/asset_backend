import express from 'express';
import { rolesService } from '../services/roles.js';
import { isLoggedIn } from '../../auth/router/passport.js';
import mongoose from 'mongoose';

const router = express.Router();

// Route for creating a new role with permissions
router.post('/', isLoggedIn, async (req, res) => {
     try {
          const userId = req.user.data._id;
          const { roleName, description, permissions } = req.body;

          // Validate the moduleId before proceeding
          if (permissions && permissions.length > 0) {
               for (const permission of permissions) {
                    if (!mongoose.Types.ObjectId.isValid(permission.moduleId)) {
                         return res.status(400).json({
                              error: 'Invalid moduleId, it must be a valid ObjectId.',
                         });
                    }
               }
          }

          const roleData = {
               roleName,
               description,
               permissions,
               addedByUserId: userId,
               createdAt: new Date(), // Set createdAt to the current date/time
          };

          const role = await rolesService.createRole(roleData);
          res.status(201).json(role);
     } catch (err) {
          res.status(500).json({ error: 'Unable to create role' });
     }
});

router.put('/:roleId', isLoggedIn, async (req, res) => {
     try {
          const { roleName, description, permissions } = req.body;
          const roleId = req.params.roleId;
          const updatedRoleData = {
               roleName,
               description,
               permissions,
               updatedAt: new Date(),
          };

          // Validate the moduleId before proceeding
          if (permissions && permissions.length > 0) {
               for (const permission of permissions) {
                    if (!mongoose.Types.ObjectId.isValid(permission.moduleId)) {
                         return res.status(400).json({
                              error: 'Invalid moduleId, it must be a valid ObjectId.',
                         });
                    }
               }
          }

          const updatedRole = await rolesService.updateRole(
               roleId,
               updatedRoleData
          );
          res.json(updatedRole);
     } catch (err) {
          res.status(500).json({ error: 'Unable to update role' });
     }
});

// Route to retrieve all roles
router.get('/', isLoggedIn, async (req, res) => {
     try {
          // Retrieve all roles from the database
          const roles = await rolesService.getAllRoles();
          res.status(200).json(roles);
     } catch (err) {
          res.status(500).json({ error: 'Unable to fetch roles' });
     }
});

export default router;
