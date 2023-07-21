import { roleModel } from '../models';

const createRole = async (
     rolename,
     description,
     permissions,
     added_by_userId
) => {
     try {
          // Create the new role in the database
          const role = await roleModel.create({
               rolename,
               description,
               permissions,
               added_by_userId,
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
               .populate('added_by_userId')
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
