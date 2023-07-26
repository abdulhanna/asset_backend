import { fieldManagementModel } from '../models';

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

const addFieldToGroup = async (groupId, fields) => {
     return await fieldManagementModel.findOneAndUpdate(
          { _id: groupId },
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
     createMultipleFieldGroups,
     addFieldToGroup,
     getFieldGroups,
};
