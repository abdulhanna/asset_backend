import { permissionModel } from '../models';

const createPermission = async (moduleName, allAccess) => {
     try {
          const permission = new permissionModel({
               moduleName,
               read: allAccess,
               readWrite: allAccess,
               actions: allAccess,
               createdAt: new Date(),
          });

          return await permission.save();
     } catch (error) {
          throw new Error(error.message);
     }
};

const updatePermission = async (
     id,
     read,
     readWrite,
     actions,
     allAccess,
     removeAccess,
     restoreDefaults
) => {
     try {
          const existingPermission = await permissionModel.findById(id);

          if (!existingPermission) {
               throw new Error('Permission not found');
          }

          const updateData = {
               updatedAt: new Date(),
          };

          if (allAccess) {
               updateData.allAccess = true;
               updateData.removeAccess = false;
               updateData.restoreDefaults = false;
               updateData.read = true;
               updateData.readWrite = true;
               updateData.actions = true;
          } else if (removeAccess) {
               updateData.allAccess = false;
               updateData.removeAccess = true;
               updateData.restoreDefaults = false;
               updateData.read = false;
               updateData.readWrite = false;
               updateData.actions = false;
          } else if (restoreDefaults) {
               updateData.allAccess = false;
               updateData.removeAccess = false;
               updateData.restoreDefaults = true;
          } else {
               // Update individual fields if not using allAccess, removeAccess, or restoreDefaults
               if (typeof read === 'boolean') {
                    updateData.read = read;
               }
               if (typeof readWrite === 'boolean') {
                    updateData.readWrite = readWrite;
               }
               if (typeof actions === 'boolean') {
                    updateData.actions = actions;
               }
          }

          return await permissionModel.findByIdAndUpdate(id, updateData, {
               new: true,
          });
     } catch (error) {
          throw new Error(error.message);
     }
};

const getAllPermissions = async () => {
     try {
          return await permissionModel.find();
     } catch (error) {
          throw new Error(error.message);
     }
};

export const permissionService = {
     createPermission,
     updatePermission,
     getAllPermissions,
};
