import express from 'express';
import {rolesService} from '../services/roles.js';
import {isLoggedIn} from '../../auth/router/passport.js';
import mongoose from 'mongoose';
import roleDefineModel from '../models/roles.js';

const router = express.Router();

// POST route for creating a new role with permissions
router.post('/', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.data._id;
        const organizationId = req.user.data.organizationId;
        const locationId = req.user.data.assignedLocationId;

        let {roleName, description, permissions} = req.body;

        if (!roleName || roleName.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'roleName is required and should not be empty.',
            });
        }
        // Convert the roleName to lowercase for case-insensitive comparison
        roleName = roleName.toLowerCase();

        // Check if the roleName already exists
        const existingRole = await roleDefineModel.findOne({roleName, addedByUserId: userId});
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
            organizationId,
            locationId,
            createdAt: new Date(), // Set createdAt to the current date/time
        };

        const role = await rolesService.createRole(roleData);
        return res.status(201).json(role);
    } catch (err) {
        return res.status(500).json({error: 'Unable to create role'});
    }
});

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// PUT route for updating a role with permissions
router.put('/:roleId', isLoggedIn, async (req, res) => {
    try {
        const {roleName, description, permissions} = req.body;
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

        // Custom validation for the update role request
        if (!isValidObjectId(roleId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role ID',
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
        return res.json(updatedRole);
    } catch (err) {
        return res.status(500).json({error: 'Unable to update role'});
    }
});

router.put('/:roleId/restoreDefaults', isLoggedIn, async (req, res) => {
    try {
        const roleId = req.params.roleId;

        if (!mongoose.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role ID',
            });
        }

        const updatedRole = await rolesService.restoreDefaultPermissions(
            roleId
        );
        return res.json(updatedRole);
    } catch (err) {
        return res.status(500).json({error: 'Unable to update role'});
    }
});


router.get('/members-addition', isLoggedIn, async (req, res) => {
    try {
        const loggedInUserId = req.user.data._id;

        // Retrieve all roles from the database
        const roles = await rolesService.getAllRolesForMembersAdd(loggedInUserId);
        return res.status(200).json(roles);
    } catch (err) {
        return res.status(500).json({error: 'Unable to fetch roles'});
    }
});


// Route to retrieve all roles
router.get('/', isLoggedIn, async (req, res) => {
    try {

        const loggedInUserId = req.user.data._id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 10;
        const sortBy = req.query.sort ? JSON.parse(req.query.sort) : 'createdAt';

        // Retrieve all roles from the database
        const rolesData = await rolesService.getAllRoles(loggedInUserId, page, limit, sortBy);

        return res.status(200).json({
            success: true,
            roles: rolesData.data,
            totalDocuments: rolesData.totalDocuments,
            totalPages: rolesData.totalPages,
            startSerialNumber: rolesData.startSerialNumber,
            endSerialNumber: rolesData.endSerialNumber
        });
    } catch (err) {
        return res.status(500).json({error: 'Unable to fetch roles'});
    }
});

router.get('/:id', isLoggedIn, async (req, res) => {
    try {
        const roleId = req.params.id;
        const role = await rolesService.getRoleById(roleId);

        if (!role) {
            return res.status(404).json({
                success: false,
                error: 'Role not found',
            });
        }

        return res.status(200).json({
            success: true,
            role,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Unable to fetch role by ID',
        });
    }
});

router.get('/v2', isLoggedIn, async (req, res) => {
    try {
        // Get filter parameters from query
        const {organizationId, locationId} = req.query;

        // Create the query based on provided filter parameters
        const query = {};

        if (organizationId) {
            query.organizationId = organizationId;
        }

        // Handle locationId filter

        if (locationId === 'null') {
            query.locationId = null;
        } else if (locationId) {
            query.locationId = locationId;
        }

        // Get all roles based on the provided filter query
        const roles = await rolesService.getAllRolesV2(query);
        return res.status(200).json(roles);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to fetch roles'});
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params;

        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                error: 'Invalid roles ID',
            });
        }

        const existingRole = await roleDefineModel.findById(id);
        if (!existingRole) {
            res.status(404).json({
                success: false,
                error: 'roleName not found',
            });
        }

        const deleteRoles = await rolesService.deleteRoles(id);

        return res.status(200).json({
            success: true,
            msg: 'Roles deleted successfully',
            deleteRoles,
        });
    } catch (error) {
        return res.status(500).json({error: 'Unable to delete roles'});
    }
});

export default router;

