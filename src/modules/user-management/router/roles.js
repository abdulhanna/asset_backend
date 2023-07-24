import express from 'express';
import { rolesService } from '../services/roles.js';

const router = express.Router();

// Route for creating a new role with permissions
router.post('/', async (req, res) => {
     try {
          const { roleName, description, permissions, addedByUserId } =
               req.body;

          const role = await rolesService.createRole(
               roleName,
               description,
               permissions,
               addedByUserId
          );
          res.status(201).json(role);
     } catch (err) {
          res.status(500).json({ error: 'Unable to create role' });
     }
});

// Route to retrieve all roles
router.get('/', async (req, res) => {
     try {
          // Retrieve all roles from the database
          const roles = await rolesService.getAllRoles();
          res.status(200).json(roles);
     } catch (err) {
          res.status(500).json({ error: 'Unable to fetch roles' });
     }
});

export default router;
