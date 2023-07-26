import { fieldManagementModel } from '../models';

const createFieldGroup = async (name, fields) => {
     try {
          if (fields) {
               // If fields are provided, create/update with fields array
               return await fieldManagementModel.findOneAndUpdate(
                    { name },
                    { fields },
                    { upsert: true, new: true } // Use "upsert" to update if the document exists or create a new one if it doesn't
               );
          } else {
               // If fields are not provided, create with just the name property
               return await fieldManagementModel.create({ name });
          }
     } catch (error) {
          throw new Error('Unable to create field group');
     }
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
     getFieldGroups,
};
