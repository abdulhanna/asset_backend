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
