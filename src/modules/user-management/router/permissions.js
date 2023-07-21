import express from 'express';
import { permissionService } from '../services/permissions.js';

const router = express.Router();

router.post('/create', async (req, res) => {
     try {
          const { moduleName, allAccess } = req.body;

          // Custom validation for the create permission request
          if (!moduleName || typeof allAccess !== 'boolean') {
               return res.status(400).json({
                    success: false,
                    errors: [
                         'Invalid request data. moduleName is required and allAccess should be a boolean.',
                    ],
               });
          }

          const permission = await permissionService.createPermission(
               moduleName,
               allAccess
          );

          res.status(201).json({ success: true, permission });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

router.put('/update/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const { read, read_write, actions } = req.body;

          // Custom validation for the update permission request
          if (!id.match(/^[0-9a-fA-F]{24}$/)) {
               return res.status(400).json({
                    success: false,
                    errors: ['Invalid permission ID'],
               });
          }

          if (
               (read !== undefined && typeof read !== 'boolean') ||
               (read_write !== undefined && typeof read_write !== 'boolean') ||
               (actions !== undefined && typeof actions !== 'boolean')
          ) {
               return res.status(400).json({
                    success: false,
                    errors: [
                         'Invalid request data. read, read_write, and actions should be booleans.',
                    ],
               });
          }

          const permission = await permissionService.updatePermission(
               id,
               read,
               read_write,
               actions
          );

          if (!permission) {
               return res
                    .status(404)
                    .json({ success: false, error: 'Permission not found' });
          }

          res.json({ success: true, permission });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

router.get('/all', async (req, res) => {
     try {
          const permissions = await permissionService.getAllPermissions();
          res.json({ success: true, permissions });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

export default router;
