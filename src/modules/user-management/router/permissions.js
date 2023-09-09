import express from 'express';
import {permissionService} from '../services/permissions.js';
import {isLoggedIn} from '../../auth/router/passport.js';
import permissionModel from '../models/permissions.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/create', isLoggedIn, async (req, res) => {
    try {
        let {moduleName, read, readWrite, actions, dashboardType} = req.body;

        // Custom validation for the create permission request
        if (!moduleName || moduleName.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Invalid request data. moduleName is required and should not be empty.',
            });
        }

        // Normalize the moduleName (remove white spaces and convert to lowercase)
        moduleName = moduleName.trim().toLowerCase();

        // Check if the normalized moduleName already exists
        const existingModuleName = await permissionModel.findOne({
            moduleName,
            dashboardType,
            isDeactivated: false,
        });

        if (existingModuleName) {
            return res.status(400).json({
                success: false,
                error: `Module with the name '${moduleName}' and dashboardType '${dashboardType}' already exists.`,
            });
        }

        const permissionData = {
            moduleName,
            read,
            readWrite,
            actions,
            dashboardType,
            createdAt: new Date(),
        };

        const permission = await permissionService.createPermission(
            permissionData
        );

        return res.status(201).json({success: true, permission});
    } catch (error) {
        return res.status(500).json({success: false, error: error.message});
    }
});

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

router.put('/update/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const updateData = req.body;

        // Custom validation for the update permission request
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid permission ID',
            });
        }

        // Check if moduleName is provided and is empty during update
        if (
            'moduleName' in updateData &&
            typeof updateData.moduleName === 'string' &&
            updateData.moduleName.trim() === ''
        ) {
            return res.status(400).json({
                success: false,
                error: 'moduleName should not be empty.',
            });
        }

        const permission = await permissionService.updatePermission(
            id,
            updateData
        );

        if (!permission) {
            return res
                .status(404)
                .json({success: false, error: 'Permission not found'});
        }

        return res.json({success: true, permission});
    } catch (error) {
        return res.status(500).json({success: false, error: error.message});
    }
});

router.get('/all', async (req, res) => {
    try {
        const permissions = await permissionService.getAllPermissions();
        return res.status(200).json({success: true, permissions});
    } catch (error) {
        return res.status(500).json({success: false, error: error.message});
    }
});

router.delete('/v1/:id', async (req, res) => {
    try {
        const {id} = req.params;

        // Custom validation for the update permission request
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid permission ID',
            });
        }

        const existingPermission = await permissionModel.findById(id);
        if (!existingPermission) {
            res.status(404).json({
                success: false,
                error: 'moduleName not found',
            });
        }

        const deletePermissions =
            await permissionService.hardDeletePermissions(id);
        return res.status(200).json({
            success: true,
            msg: 'Deleted successfully',
            deletePermissions,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

router.delete('/v2/:id', async (req, res) => {
    try {
        const {id} = req.params;

        // Custom validation for the update permission request
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid permission ID',
            });
        }

        const existingPermission = await permissionModel.findById(id);
        if (!existingPermission) {
            res.status(404).json({
                success: false,
                error: 'moduleName not found',
            });
        }

        const deletePermissions =
            await permissionService.softDeletePermissions(id);

        return res.status(200).json({
            success: true,
            msg: 'Soft deleted successfully',
            deletePermissions,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});


// Route to get permissions based on the user's dashboardPermission
router.get('/dashboardPermission', isLoggedIn, async (req, res) => {
    try {
        const dashboardPermission = req.user.data.dashboardPermission.trim();
        const permissions = await permissionService.getPermissionsByDashboardPermission(dashboardPermission);
        res.status(200).json(permissions);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});
export default router;