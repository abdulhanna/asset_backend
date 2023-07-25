import express from 'express';
import { rolesService } from '../services/roles.js';
import { isLoggedIn } from '../../auth/router/passport.js';

const router = express.Router();

// Route for creating a new role with permissions
router.post('/', isLoggedIn, async (req, res) => {
     try {
          const userId = req.user.data._id;

          const { roleName, description, permissions } = req.body;

          const role = await rolesService.createRole(
               roleName,
               description,
               permissions,
               userId
          );
          res.status(201).json(role);
     } catch (err) {
          res.status(500).json({ error: 'Unable to create role' });
     }
});

// Route for updating an existing role by role ID
router.put('/:roleId', isLoggedIn, async (req, res) => {
     try {
          const { roleId } = req.params;
          const { roleName, description, permissions } = req.body;

          const role = await rolesService.updateRole(
               roleId,
               roleName,
               description,
               permissions
          );

          if (!role) {
               return res.status(404).json({ message: 'Role not found' });
          }

          res.status(200).json(role);
     } catch (error) {
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
