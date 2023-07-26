import { fieldManagementModel } from '../models';

const createFieldGroup = async (name, fields) => {
     if (fields) {
          return await fieldManagementModel.findOneAndUpdate(
               { name },
               { fields },
               { upsert: true, new: true }
          );
     } else {
          return await fieldManagementModel.create({ name, fields: [] });
     }
};

const createMultipleFieldGroups = async (names) => {
     const newFieldGroups = await Promise.all(
          names.map(async (groupName) => {
               return await fieldManagementModel.create({
                    name: groupName,
                    fields: [],
               });
          })
     );
     return newFieldGroups;
};

const addFieldToGroup = async (name, fields) => {
     return await fieldManagementModel.findOneAndUpdate(
          { name },
          { $push: { fields } },
          { new: true }
     );
};

const getFieldGroups = async () => {
     try {
          const filedGroups = await fieldManagementModel.find();

          return filedGroups;
     } catch (error) {
          throw new Error('Unable to get field group');
     }
};

export const fieldManagementService = {
     createFieldGroup,
     createMultipleFieldGroups,
     addFieldToGroup,
     getFieldGroups,
};
