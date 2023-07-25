import { permissionModel } from '../models';

const createPermission = async (moduleName, allAccess) => {
     try {
          const permission = new permissionModel({
               moduleName,
               createdAt: new Date(),
          });

          return await permission.save();
     } catch (error) {
          throw new Error(error.message);
     }
};

const updatePermission = async (id, updateData) => {
     try {
          const existingPermission = await permissionModel.findById(id);

          if (!existingPermission) {
               throw new Error('Permission not found');
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
