import { roleModel } from '../models';

const createRole = async (rolename, permissions, added_by_userId) => {
     try {
          // Create the new role in the database
          const role = await roleModel.create({
               rolename,
               permissions,
               added_by_userId,
          });

          return role;
     } catch (err) {
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
     } catch (err) {
          throw new Error('Unable to fetch roles');
     }
};

export const rolesService = {
     createRole,
     getAllRoles,
};
