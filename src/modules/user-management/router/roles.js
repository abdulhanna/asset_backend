import express from 'express';
import { rolesService } from '../services/roles.js';
import { isLoggedIn } from '../../auth/router/passport.js';
import mongoose from 'mongoose';
import roleDefineModel from '../models/roles.js';

const router = express.Router();

// POST route for creating a new role with permissions
router.post('/', isLoggedIn, async (req, res) => {
     try {
          const userId = req.user.data._id;
          let { roleName, description, permissions } = req.body;

          if (!roleName || roleName.trim() === '') {
               return res.status(400).json({
                    success: false,
                    errors: 'roleName is required and should not be empty.',
               });
          }
          // Convert the roleName to lowercase for case-insensitive comparison
          roleName = roleName.toLowerCase();

          // Check if the roleName already exists
          const existingRole = await roleDefineModel.findOne({ roleName });
          if (existingRole) {
               return res.status(400).json({
                    success: false,
                    error: `Role with the name '${roleName}' already exists.`,
               });
          }

          // Validate the moduleId before proceeding
          if (permissions && permissions.length > 0) {
               for (const permission of permissions) {
                    if (!mongoose.Types.ObjectId.isValid(permission.moduleId)) {
                         return res.status(400).json({
                              error: 'Invalid moduleId, it must be a valid ObjectId.',
                         });
                    }

                    // Handle automatic updates based on allAccess field
                    if (permission.allAccess) {
                         permission.read = true;
                         permission.readWrite = true;
                         permission.actions = true;
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

const isValidObjectId = (id) => {
     return mongoose.Types.ObjectId.isValid(id);
};

// PUT route for updating a role with permissions
router.put('/:roleId', isLoggedIn, async (req, res) => {
     try {
          const { roleName, description, permissions } = req.body;
          const roleId = req.params.roleId;

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

          // Custom validation for the update permission request
          if (!isValidObjectId(roleId)) {
               return res.status(400).json({
                    success: false,
                    errors: 'Invalid permission ID',
               });
          }

          const existingRoles = await roleDefineModel.findById(roleId);
          if (!existingRoles) {
               res.status(404).json({
                    success: false,
                    error: 'Roles not found',
               });
          }

          const updatedRoleData = {
               roleName:
                    roleName && typeof roleName === 'string'
                         ? roleName.toLowerCase()
                         : roleName,
               description,
               permissions,
               updatedAt: new Date(),
          };

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
