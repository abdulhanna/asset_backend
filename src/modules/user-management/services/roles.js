import {roleDefineModel, permissionModel} from '../models';
import userModel from '../../auth/models/index';

const createRole = async (roleData) => {
    try {
        // Create the new role in the database
        const role = await roleDefineModel.create(roleData);

        return role;
    } catch (error) {
        throw new Error('Unable to create role');
    }
};

const updateRole = async (roleId, updatedRoleData) => {
    try {
        const {roleName, description} = updatedRoleData;

        // Handle automatic updates based on allAccess and removeAccess fields
        if (
            updatedRoleData.permissions &&
            updatedRoleData.permissions.length > 0
        ) {
            for (const permission of updatedRoleData.permissions) {
                if (permission.allAccess) {
                    permission.read = true;
                    permission.readWrite = true;
                    permission.actions = true;
                    permission.removeAccess = false; // In case allAccess is true, removeAccess should be false
                } else if (permission.removeAccess) {
                    permission.read = false;
                    permission.readWrite = false;
                    permission.actions = false;
                    permission.allAccess = false; // In case removeAccess is true, allAccess should be false
                } else {
                    // If allAccess is false, retrieve the default values from the permission collection
                    const defaultPermission =
                        await permissionModel.findById(
                            permission.moduleId
                        );

                    if (defaultPermission) {
                        permission.read = defaultPermission.read;
                        permission.readWrite =
                            defaultPermission.readWrite;
                        permission.actions = defaultPermission.actions;
                        permission.allAccess = false; // Ensure allAccess is false when using default values
                    }
                }

                // Check if permission with the given moduleId already exists in the role
                const existingPermission = await roleDefineModel.findOne({
                    _id: roleId,
                    'permissions.moduleId': permission.moduleId,
                });

                if (existingPermission) {
                    // Update the specific permission using moduleId
                    await roleDefineModel.updateOne(
                        {
                            _id: roleId,
                            'permissions.moduleId': permission.moduleId,
                        },
                        {
                            $set: {
                                'permissions.$.moduleName':
                                permission.moduleName,
                                'permissions.$.read': permission.read,
                                'permissions.$.readWrite':
                                permission.readWrite,
                                'permissions.$.actions':
                                permission.actions,
                                'permissions.$.allAccess':
                                permission.allAccess,
                                'permissions.$.removeAccess':
                                permission.removeAccess,
                                roleName:
                                    roleName ||
                                    existingPermission.roleName,
                                description:
                                    description ||
                                    existingPermission.description,
                            },
                        }
                    );
                } else {
                    // If permission with the moduleId doesn't exist, add the new permission to the array
                    await roleDefineModel.findByIdAndUpdate(roleId, {
                        $push: {permissions: permission},
                    });
                }
            }
        }

        // Find the role by roleId and return the updated role
        const updatedRole = await roleDefineModel.findById(roleId);
        return updatedRole;
    } catch (error) {
        throw new Error('Unable to update role');
    }
};

// Function to restore default permissions for a role
const restoreDefaultPermissions = async (roleId) => {
    try {
        const existingRole = await roleDefineModel.findById(roleId);
        if (!existingRole) {
            throw new Error('Role not found');
        }

        // Restore default permissions for each permission in the role
        const updatedPermissions = await Promise.all(
            existingRole.permissions.map(async (permission) => {
                // Retrieve the default permission from the permissionModel
                const defaultPermission = await permissionModel.findById(
                    permission.moduleId
                );
                if (defaultPermission) {
                    return {
                        ...permission,
                        read: defaultPermission.read,
                        readWrite: defaultPermission.readWrite,
                        actions: defaultPermission.actions,
                        allAccess: false,
                        removeAccess: false,
                    };
                }
                return permission; // Keep the existing permission if the default is not found
            })
        );

        const updatedRoleData = {
            permissions: updatedPermissions,
            updatedAt: new Date(),
        };

        // Update the role with the restored default permissions
        const updatedRole = await roleDefineModel.findByIdAndUpdate(
            roleId,
            updatedRoleData,
            {new: true}
        );
        return updatedRole;
    } catch (error) {
        throw new Error('Unable to update role');
    }
};

const getAllRoles = async (loggedInUserId) => {
    try {

        const roles = await roleDefineModel
            .find({
                addedByUserId: loggedInUserId,
                isDeleted: false,
                isDeactivated: false

            })
            .select('-isDeactivated -deletedAt')
            .populate('addedByUserId', 'email')
            .populate('permissions', 'moduleName read readWrite actions')
            .exec();

        const rolesWithUserCount = await Promise.all(roles.map(async (role) => {
            const userCount = await userModel.countDocuments({
                teamRoleId: role._id
            });
            role = role.toObject();
            role.userCount = userCount;
            return role;
        }));

        // Filter out permissions with removeAccess set to true
        rolesWithUserCount.forEach((role) => {
            role.permissions = role.permissions.filter(
                (permission) => !permission.removeAccess
            );
        });

        return rolesWithUserCount;
    } catch (error) {
        throw new Error('Unable to fetch roles');
    }
};

const getRoleById = async (id) => {
    try {
        const role = await roleDefineModel.findById(id);
        const firstModuleId = role.permissions[0].moduleId;

        if (firstModuleId) {
            const firstModule = await permissionModel.findById(firstModuleId);

            if (firstModule && ['user', 'root'].includes(firstModule.dashboardType)) {
                const dashboardTypeToMatch = firstModule.dashboardType;

                const matchedModuleIds = await permissionModel.find({dashboardType: dashboardTypeToMatch}, '_id');

                matchedModuleIds.forEach(idObj => {
                    const moduleId = idObj._id.toString();

                    if (!role.permissions.some(permission => permission.moduleId.toString() === moduleId)) {
                        role.permissions.push({
                            moduleId: moduleId,
                        });
                    }
                });
            }
        }

        return role.toObject();
    } catch (error) {
        throw new Error('Unable to fetch role by ID');
    }
};


const deleteRoles = async (id) => {
    try {
        const deleteRoleResult = await roleDefineModel.updateOne(
            {
                _id: id,
            },
            {
                isDeleted: true,
                deletedAt: new Date(),
            }
        );
        return deleteRoleResult;
    } catch (error) {
        throw new Error('Error in deleting resource');
    }
};

const getAllRolesV2 = async (query) => {
    try {
        const roles = await roleDefineModel
            .find({
                ...query,
                isDeleted: false,
                isDeactivated: false,
            })
            .select('-isDeactivated -deletedAt')
            .populate('addedByUserId', 'email') // Only populate 'email' field from addedByUserId
            .populate('permissions', 'moduleName read readWrite actions')
            .exec();

        // Filter out permissions with removeAccess set to true
        roles.forEach((role) => {
            role.permissions = role.permissions.filter(
                (permission) => !permission.removeAccess
            );
        });

        return roles;
    } catch (error) {
        throw new Error('Unable to fetch roles');
    }
};

export const rolesService = {
    createRole,
    updateRole,
    getAllRoles,
    restoreDefaultPermissions,
    deleteRoles,
    getAllRolesV2,
    getRoleById
};
