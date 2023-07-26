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
                                   },
                              }
                         );
                    } else {
                         // If permission with the moduleId doesn't exist, add the new permission to the array
                         await roleDefineModel.findByIdAndUpdate(roleId, {
                              $push: { permissions: permission },
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

const getAllRoles = async () => {
     try {
          // Fetch all roles from the database, excluding isDeleted and isDeactivated fields
          const roles = await roleDefineModel
               .find({ isDeleted: false, isDeactivated: false })
               .select('-isDeleted -isDeactivated -deletedAt')
               .populate('addedByUserId', 'email') // Only populate 'email' field from addedByUserId
               .populate('permissions', 'moduleName read readWrite actions')
               .exec();

          // Filter out permissions with removeAccess set to true
          roles.forEach((role) => {
               role.permissions = role.permissions.filter(
                    (permission) => !permission.removeAccess
               );
          });

          // roles.forEach((role) => {
          //      role.permissions = role.permissions.filter((permission) => {
          //           return permission.removeAccess === false;
          //      });
          // });g

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
