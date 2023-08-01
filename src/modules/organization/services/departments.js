import departmentModel from '../models/departments';

const addDepartment = async (data) => {
     try {
          const addDepartment = await departmentModel.create(data);

          return addDepartment;
     } catch (error) {
          throw new Error('Unable to add departments');
     }
};

const updateDepartment = async (id, data) => {
     try {
          const updatedDepartment = await departmentModel.findByIdAndUpdate(
               id,
               data,
               { new: true } // This option returns the updated document
          );
          return updatedDepartment;
     } catch (error) {
          throw new Error('Unable to update department');
     }
};

const getDepartmentById = async (id) => {
     try {
          const department = await departmentModel.findById(id);
          if (!department) {
               throw new Error('Department not found');
          }
          return department;
     } catch (error) {
          throw new Error('Unable to fetch department');
     }
};

const getDepartments = async () => {
     try {
          const data = await departmentModel.find().select('-__v');
          return data;
     } catch (error) {
          throw new Error('Unable to fetch departments');
     }
};

const deleteDepartment = async (id) => {
     try {
          await departmentModel.findByIdAndDelete(id);
     } catch (error) {
          throw new Error('Unable to delete department');
     }
};

export const departmentService = {
     addDepartment,
     updateDepartment,
     getDepartmentById,
     getDepartments,
     deleteDepartment,
};
