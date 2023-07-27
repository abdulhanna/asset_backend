import express from 'express';
import { permissionService } from '../services/permissions.js';
import { isLoggedIn } from '../../auth/router/passport.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/create', isLoggedIn, async (req, res) => {
     try {
          const { moduleName, read, readWrite, actions } = req.body;

          // Custom validation for the create permission request
          if (!moduleName || moduleName.trim() === '') {
               return res.status(400).json({
                    success: false,
                    errors: [
                         'Invalid request data. moduleName is required and should not be empty.',
                    ],
               });
          }

          const permissionData = {
               moduleName,
               read,
               readWrite,
               actions,
               createdAt: new Date(),
          };

          const permission = await permissionService.createPermission(
               permissionData
          );

          res.status(201).json({ success: true, permission });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

const isValidObjectId = (id) => {
     return mongoose.Types.ObjectId.isValid(id);
};

router.put('/update/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const updateData = req.body;

          // Custom validation for the update permission request
          if (!isValidObjectId(id)) {
               return res.status(400).json({
                    success: false,
                    errors: ['Invalid permission ID'],
               });
          }

          const permission = await permissionService.updatePermission(
               id,
               updateData
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
