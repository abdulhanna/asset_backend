import { roleDefineModel } from '../models';

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
                    }
                    // Find the permission in the existing role data and update it
                    const existingPermission = await roleDefineModel.findOne({
                         _id: roleId,
                         'permissions.moduleId': permission.moduleId,
                    });

                    if (existingPermission) {
                         const permissionIndex =
                              existingPermission.permissions.findIndex(
                                   (p) =>
                                        p.moduleId.toString() ===
                                        permission.moduleId.toString()
                              );
                         if (permissionIndex !== -1) {
                              existingPermission.permissions[permissionIndex] =
                                   permission;
                              await existingPermission.save();
                         }
                    }
               }
          }

          // Find the role by roleId and update it with the new data
          const updatedRole = await roleDefineModel.findByIdAndUpdate(
               roleId,
               { $set: updatedRoleData },
               { new: true }
          );

          return updatedRole;
     } catch (error) {
          throw new Error('Unable to update role');
     }
};

const getAllRoles = async () => {
     try {
          // Fetch all roles from the database, excluding isDeleted and isDeactivated fields
          const roles = await roleDefineModel
               .find({ isDeleted: false, isDeactivated: false })
               .select('-isDeleted -isDeactivated -deletedAt')
               .populate('addedByUserId', 'email') // Only populate 'email' field from addedByUserId
               .populate('permissions', 'moduleName read readWrite actions')
               .exec();

          return roles;
     } catch (error) {
          throw new Error('Unable to fetch roles');
     }
};

export const rolesService = {
     createRole,
     updateRole,
     getAllRoles,
};
