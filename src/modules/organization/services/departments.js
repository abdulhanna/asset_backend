import departmentModel from '../models/departments';

const addDepartment = async (data) => {
     try {
          return await departmentModel.create(data);
     } catch (error) {
          throw new Error('Unable to add departments');
     }
};

const getDepartments = async () => {
     try {
          const data = await departmentModel.find();
          return data;
     } catch (error) {
          throw new Error('Unable to fetch departments');
     }
};

export const departmentService = {
     addDepartment,
     getDepartments,
};
