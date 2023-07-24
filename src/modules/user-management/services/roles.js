import { roleModel } from '../models';

const createRole = async (
     roleName,
     description,
     permissions,
     addedByUserId
) => {
     try {
          // Create the new role in the database
          const role = await roleModel.create({
               roleName,
               description,
               permissions,
               addedByUserId,
          });

          return role;
     } catch (error) {
          throw new Error('Unable to create role');
     }
};

const getAllRoles = async () => {
     try {
          // Fetch all roles from the database
          const roles = await roleModel
               .find()
               .populate('addedByUserId')
               .populate('permissions')
               .exec();

          return roles;
     } catch (error) {
          throw new Error('Unable to fetch roles');
     }
};

export const rolesService = {
     createRole,
     getAllRoles,
};
