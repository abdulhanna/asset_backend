import express from 'express';
import { rolesService } from '../services/roles.js';

const router = express.Router();

// Route for creating a new role with permissions
router.post('/', async (req, res) => {
     try {
          const { rolename, description, permissions, added_by_userId } =
               req.body;

          const role = await rolesService.createRole(
               rolename,
               description,
               permissions,
               added_by_userId
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
