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
        const {roleName, description, permissions, isDeactivated} = updatedRoleData;

        // Find the role by ID and update it with the new data
        const updatedRole = await roleDefineModel.findByIdAndUpdate(
            roleId,
            {
                roleName,
                description,
                permissions,
                isDeactivated
            },
            {new: true} // This ensures that the function returns the updated document
        );

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

const getAllRoles = async (loggedInUserId, page, limit, sortBy) => {
    try {
        const skip = (page - 1) * limit;

        const filter = {
            addedByUserId: loggedInUserId,
            isDeleted: false
        };

        const data = await roleDefineModel
            .find(filter)
            .select('-deletedAt')
            .populate('addedByUserId', 'email')
            .populate('permissions', 'moduleName read readWrite actions')
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .exec();

        const rolesWithUserCount = await Promise.all(data.map(async (role) => {
            const userCount = await userModel.countDocuments({
                teamRoleId: role._id,
                isDeleted: false
            });
            role = role.toObject();
            role.userCount = userCount;
            return role;
        }));

        rolesWithUserCount.forEach((role) => {
            role.permissions = role.permissions.filter(
                (permission) => !permission.removeAccess
            );
        });

        const totalDocuments = await roleDefineModel.countDocuments(filter);
        const totalPages = Math.ceil(totalDocuments / limit);
        const startSerialNumber = (page - 1) * limit + 1;
        const endSerialNumber = Math.min(page * limit, totalDocuments);

        return {
            data: rolesWithUserCount,
            totalDocuments,
            totalPages,
            startSerialNumber,
            endSerialNumber,
        };
    } catch (error) {
        throw new Error('Unable to fetch roles');
    }
};

const getAllRolesForMembersAdd = async (loggedInUserId) => {
    try {

        const roles = await roleDefineModel
            .find({
                addedByUserId: loggedInUserId,
                isDeleted: false,
                isDeactivated: false

            })
            .select('-deletedAt')
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

        // Assuming teamRoleId is the field linking roles and users
        const assignedUsers = await userModel.find({
                teamRoleId: role._id,
                isDeleted: false
            }).populate('teamRoleId', 'roleName')
        ;
        const assignedUserCount = assignedUsers.length;

        return {role: role.toObject(), assignedUsers, assignedUserCount};
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
    getAllRolesForMembersAdd,
    restoreDefaultPermissions,
    deleteRoles,
    getAllRolesV2,
    getRoleById
};
