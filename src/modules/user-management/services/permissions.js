import { permissionModel } from '../models';

const createPermission = async (moduleName, allAccess) => {
     try {
          const permission = new permissionModel({
               moduleName,
               read: allAccess,
               read_write: allAccess,
               actions: allAccess,
               created_at: new Date(),
          });

          return await permission.save();
     } catch (error) {
          throw new Error(error.message);
     }
};

const updatePermission = async (id, read, read_write, actions) => {
     try {
          return await permissionModel.findByIdAndUpdate(
               id,
               {
                    read,
                    read_write,
                    actions,
                    updated_at: new Date(),
               },
               { new: true }
          );
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
