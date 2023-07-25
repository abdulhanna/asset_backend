import { roleDefineModel } from '../models';

const createRole = async (roleName, description, permissions, userId) => {
     try {
          // Create the new role in the database
          const role = await roleDefineModel.create({
               roleName,
               description,
               permissions,
               addedByUserId: userId,
          });

          return role;
     } catch (error) {
          throw new Error('Unable to create role');
     }
};

const updateRole = async (roleId, roleName, description, permissions) => {
     try {
          // Create an object with the updated fields and current timestamp
          const updateData = {
               roleName,
               description,
               permissions,
               updatedAt: new Date(),
          };

          // Find the role by its ID and update the fields
          const updatedRole = await roleDefineModel.findByIdAndUpdate(
               roleId,
               updateData,
               { new: true }
          );

          return updatedRole;
     } catch (error) {
          throw new Error('Unable to update role');
     }
};
const getAllRoles = async () => {
     try {
          // Fetch all roles from the database
          const roles = await roleDefineModel
               .find()
               .populate('addedByUserId', 'email') // Only populate 'email' field from addedByUserId
               .populate('permissions', 'read readWrite actions') // Only populate the specified fields from permissions
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
