import departmentModel from '../models/departments';
import locationModel from '../models/locations';

const addDepartmentToDepartmentsCollection = async (data) => {
     try {
          const addDepartment = await departmentModel.create(data);

          return addDepartment;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to add departments');
     }
};

const addDepartmentsToLocation = async (
     locationId,
     departments,
     organizationId
) => {
     try {
          // Validate if the location exists and is accessible to the admin
          const location = await locationModel.findOne({
               _id: locationId,
               organizationId,
          });

          if (!location) {
               return null; // Or you can throw an error here if you prefer.
          }

          // Fetch the departmentIds based on the department objects provided in the request body
          const departmentIds = departments.map((dept) => dept.departmentId);

          // Check if all departmentIds are valid
          const validDepartments = await isValidDepartments(departmentIds);

          if (!validDepartments) {
               return null; // Or you can throw an error here if you prefer.
          }

          // Create the array of embedded documents for departments
          const departmentsData = departments.map((dept) => ({
               departmentId: dept.departmentId,
               departmentAddress: {
                    address1: dept.departmentAddress.address1,
                    city: dept.departmentAddress.city,
               },
               contactAddress: {
                    emailAddress: dept.contactAddress.emailAddress,
                    contactNumber: dept.contactAddress.contactNumber,
               },
               moreInformation: {
                    departmentInchargeId:
                         dept.moreInformation.departmentInchargeId,
                    chargingType: dept.moreInformation.chargingType,
               },
          }));

          // Add the new departments to the existing array using $push operator
          location.departments.push(...departmentsData);

          // Save the updated location
          const updatedLocation = await location.save();
          return updatedLocation;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to assign departments to location');
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
     addDepartmentsToLocation,
     updateDepartment,
     getDepartmentById,
     getDepartments,
     deleteDepartment,
     getDepartmentsByOrganizationId,
     isValidDepartments,
};
