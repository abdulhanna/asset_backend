import { permissionModel } from '../models';

const createPermission = async (permissionData) => {
     try {
          const permission = await permissionModel.create(permissionData);

          return permission;
     } catch (error) {
          throw new Error(error.message);
     }
};

const updatePermission = async (id, updateData) => {
     try {
          const existingPermission = await permissionModel.findById(id);

          if (!existingPermission) {
               // Throw an error with 404 status when permission is not found
               const error = new Error('Permission not found');
               error.statusCode = 404;
          }

          const updatedData = {
               updatedAt: new Date(),
               ...updateData,
          };

          // Handle access flags
          if (updateData.allAccess) {
               updatedData.allAccess = true;
               updatedData.removeAccess = false;
               updatedData.restoreDefaults = false;
               updatedData.read = true;
               updatedData.readWrite = true;
               updatedData.actions = true;
          } else if (updateData.removeAccess) {
               updatedData.allAccess = false;
               updatedData.removeAccess = true;
               updatedData.restoreDefaults = false;
               updatedData.read = false;
               updatedData.readWrite = false;
               updatedData.actions = false;
          } else if (updateData.restoreDefaults) {
               updatedData.allAccess = false;
               updatedData.removeAccess = false;
               updatedData.restoreDefaults = true;
          }

          return await permissionModel.findByIdAndUpdate(id, updatedData, {
               new: true,
          });
     } catch (error) {
          throw new Error(error.message);
     }
};

const getAllPermissions = async () => {
     try {
          const permissions = await permissionModel
               .find({ isDeleted: false, isDeactivated: false })
               .select('moduleName read readWrite actions allAccess _id');
          return permissions;
     } catch (error) {
          throw new Error(error.message);
     }
};

export const permissionService = {
     createPermission,
     updatePermission,
     getAllPermissions,
};
