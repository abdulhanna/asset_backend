import { fieldManagementModel } from '../models';

const createFieldGroup = async (name, fields) => {
     try {
          const newFieldGroup = await fieldManagementModel.create({
               name,
               fields,
          });
          return newFieldGroup;
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
