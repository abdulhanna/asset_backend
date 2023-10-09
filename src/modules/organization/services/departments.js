import { departmentModel, locationModel } from '../models';

const addDepartmentToDepartmentsCollection = async (data) => {
     try {
          const addDepartment = await departmentModel.create(data);

          return addDepartment;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to add departments');
     }
};

const checkDepartmentCodeExists = async (trimmedDepartmentCodeId) => {
     const existingDepartment = await departmentModel.findOne({
          trimmedDepartmentCodeId,
     });
     return !!existingDepartment; // Return true if a location with the given codeId exists, otherwise false
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

// const updateDepartment = async (id, data) => {
//      try {
//           const updatedDepartment = await departmentModel.findByIdAndUpdate(
//                id,
//                data,
//                { new: true } // This option returns the updated document
//           );
//           return updatedDepartment;
//      } catch (error) {
//           throw new Error('Unable to update department');
//      }
// };

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

const getDepartmentsByLocationAndOrganization = async (
     locationId,
     organizationId
) => {
     try {
          const location = await locationModel
               .findOne({ _id: locationId, organizationId })
               .populate({
                    path: 'departments.departmentId',
                    model: 'departments',
               })
               .populate({
                    path: 'departments.moreInformation.departmentInchargeId',
                    model: 'users',
               })
               .lean();

          if (!location) {
               return null;
          }

          return location;
     } catch (error) {
          console.log(error);
          throw new Error(
               'Unable to get departments by location and organization'
          );
     }
};

const updateDepartment = async (id, name, chargingType, isDeactivated) => {
     try {
          const updatedDepartment = await departmentModel.findByIdAndUpdate(
               id,
               {
                    name,
                    chargingType,
                    isDeactivated,
               },
               { new: true }
          );

          return updatedDepartment;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to update department');
     }
};

const updateLocationWithDepartments = async (
     departmentId,
     locationId,
     departments,
     organizationId
) => {
     try {
          const location = await locationModel.findOneAndUpdate(
               {
                    _id: locationId,
                    organizationId,
                    'departments.departmentId': departmentId,
               },
               {
                    $set: {
                         'departments.$.departmentAddress':
                              departments[0].departmentAddress,
                         'departments.$.contactAddress':
                              departments[0].contactAddress,
                         'departments.$.moreInformation':
                              departments[0].moreInformation,
                    },
               },
               { new: true }
          );

          return location;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to update location with departments');
     }
};

export const departmentService = {
     addDepartmentToDepartmentsCollection,
     addDepartmentsToLocation,
     updateDepartment,
     updateLocationWithDepartments,
     getDepartmentById,
     getDepartments,
     deleteDepartment,
     getDepartmentsByOrganizationId,
     getDepartmentsByLocationAndOrganization,
     isValidDepartments,
     checkDepartmentCodeExists,
};
