import departmentModel from '../models/departments';

const addDepartmentToDepartmentsCollection = async (data) => {
     try {
          const addDepartment = await departmentModel.create(data);

          return addDepartment;
     } catch (error) {
          console.log(error);
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
          const data = await departmentModel
               .find({ isDeleted: false })
               .select('-__v');
          return data;
     } catch (error) {
          throw new Error('Unable to fetch departments');
     }
};

const deleteDepartment = async (id) => {
     try {
          const deleteDepartment = await departmentModel.updateOne(
               {
                    _id: id,
               },
               {
                    isDeleted: true,
                    deletedAt: new Date(),
               }
          );
          return deleteDepartment;
     } catch (error) {
          throw new Error('Unable to delete department');
     }
};

const getDepartmentsByOrganizationId = async (organizationId) => {
     try {
          const departments = await departmentModel.find({
               organizationId,
               isDeleted: false,
          });

          return departments;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to fetch departments');
     }
};

const isValidDepartments = async (departmentIds) => {
     try {
          // Check if all departmentIds are valid (exists in the departments collection)
          const validDepartments = await departmentModel.find({
               _id: { $in: departmentIds },
          });
          return validDepartments.length === departmentIds.length;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to check validity of departments');
     }
};

export const departmentService = {
     addDepartmentToDepartmentsCollection,
     updateDepartment,
     getDepartmentById,
     getDepartments,
     deleteDepartment,
     getDepartmentsByOrganizationId,
     isValidDepartments,
};
