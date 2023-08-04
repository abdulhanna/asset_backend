import express from 'express';
import { departmentService } from '../services/departments';
import { isLoggedIn } from '../../auth/router/passport.js';
import departmentModel from '../models/departments.js';
import locationModel from '../models/locations';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/', isLoggedIn, async (req, res) => {
     try {
          const organizationId = req.user.data.organizationId;
          const {
               departmentId,
               name,
               chargingType,
               status,
               locationId,
               departments,
          } = req.body;

          // Declare these variables outside the if block
          let trimmedDepartmentId;
          let trimmedName;

          if (!locationId && !departments) {
               // If both locationId and departments are missing, it means we are creating a master department
               // Trim leading and trailing spaces from departmentId and name
               trimmedDepartmentId = departmentId.trim();
               trimmedName = name.trim();

               if (!trimmedName) {
                    return res.status(400).json({
                         success: false,
                         error: 'Department name cannot be empty. Please provide a valid name.',
                    });
               }

               const existingDepartmentId = await departmentModel.findOne({
                    departmentId: {
                         $regex: new RegExp(`^${trimmedDepartmentId}$`, 'i'),
                    },
                    isDeleted: false,
               });

               if (existingDepartmentId) {
                    return res.status(400).json({
                         success: false,
                         error: `Department '${trimmedDepartmentId}' already exists.`,
                    });
               }

               // Check if name is duplicate (case-insensitive match)
               const existingName = await departmentModel.findOne({
                    name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
                    isDeleted: false,
               });

               if (existingName) {
                    return res.status(400).json({
                         success: false,
                         error: `Department with name '${trimmedName}' already exists.`,
                    });
               }

               const departmentData = {
                    organizationId,
                    departmentId: trimmedDepartmentId,
                    name: trimmedName,
                    chargingType,
                    status,
                    createdAt: new Date(),
               };

               const addDepartment =
                    await departmentService.addDepartmentToDepartmentsCollection(
                         departmentData
                    );

               return res.status(201).json({
                    success: true,
                    msg: 'Department added successfully',
                    department: addDepartment,
               });
          } else if (locationId && departments) {
               // If both locationId and departments are present, it means we are assigning departments to a location

               // Validate if the location exists and is accessible to the admin
               const location = await locationModel.findOne({
                    _id: locationId,
                    organizationId,
               });

               if (!location) {
                    return res.status(404).json({
                         success: false,
                         error: 'Location not found or not accessible.',
                    });
               }

               // Fetch the departmentIds based on the department objects provided in the request body
               const departmentIds = departments.map(
                    (dept) => dept.departmentId
               );

               // Check if all departmentIds are valid
               const validDepartments =
                    await departmentService.isValidDepartments(departmentIds);

               if (!validDepartments) {
                    return res.status(400).json({
                         success: false,
                         error: 'Invalid departmentIds provided.',
                    });
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
                         departmentIncharge:
                              dept.moreInformation.departmentIncharge,
                         chargingType: dept.moreInformation.chargingType,
                    },
               }));

               // Add the new departments to the existing array using $push operator
               location.departments.push(...departmentsData);

               // Save the updated location
               const updatedLocation = await location.save();

               return res.status(200).json({
                    success: true,
                    msg: 'Departments assigned to location successfully',
                    location: updatedLocation,
               });
          } else {
               // Handle the case where either locationId or departments is missing
               return res.status(400).json({
                    success: false,
                    error: 'Invalid request. Either provide both locationId and departments or none.',
               });
          }
     } catch (error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               error: 'Unable to add department or assign departments to location',
          });
     }
});

const isValidObjectId = (id) => {
     return mongoose.Types.ObjectId.isValid(id);
};

router.put('/:id', isLoggedIn, async (req, res) => {
     try {
          const id = req.params.id;
          const data = req.body;

          // Custom validation for the update permission request
          if (!isValidObjectId(id)) {
               return res.status(400).json({
                    success: false,
                    error: 'Invalid Department ID',
               });
          }

          const existingDepartmentId = await departmentModel.findById(id);
          if (!existingDepartmentId) {
               res.status(404).json({
                    success: false,
                    error: 'existingDepartmentId not found',
               });
          }

          // Check if the departmentName is provided and is empty during update
          if (
               'name' in data &&
               typeof data.name === 'string' &&
               data.name.trim() === ''
          ) {
               return res.status(400).json({
                    success: false,
                    error: 'departmentName should not be empty.',
               });
          }

          // Trim leading and trailing spaces from the name if it exists
          if (data.name) {
               data.name = data.name.trim();
          }

          // Check if the updated name is duplicate (case-insensitive match)
          if (data.name) {
               const existingName = await departmentModel.findOne({
                    _id: { $ne: id }, // Exclude the current department from the check
                    name: { $regex: new RegExp(`^${data.name}$`, 'i') },
                    isDeleted: false,
               });

               if (existingName) {
                    return res.status(400).json({
                         success: false,
                         error: `Department with name '${data.name}' already exists.`,
                    });
               }
          } else {
               // If the name field is empty or contains only spaces, prevent the update
               delete data.name;
          }

          const updatedDepartment = await departmentService.updateDepartment(
               id,
               data
          );

          return res.status(200).json({
               success: true,
               msg: 'Department updated successfully',
               department: updatedDepartment,
          });
     } catch (error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               error: 'Unable to update department',
          });
     }
});

router.get('/:id', isLoggedIn, async (req, res) => {
     try {
          const id = req.params.id;

          // Custom validation for the update permission request
          if (!isValidObjectId(id)) {
               return res.status(400).json({
                    success: false,
                    error: 'Invalid Department ID',
               });
          }

          const existingDepartmentId = await departmentModel.findById(id);
          if (!existingDepartmentId) {
               return res.status(404).json({
                    success: false,
                    error: 'Department not found',
               });
          }

          const department = await departmentService.getDepartmentById(id);
          return res.status(200).json({
               success: true,
               department,
          });
     } catch (error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               error: 'Unable to fetch department',
          });
     }
});

router.get('/', isLoggedIn, async (req, res) => {
     try {
          const departments = await departmentService.getDepartments();

          return res.status(200).json({
               success: true,
               departments,
          });
     } catch (error) {
          return res.status(500).json({
               success: false,
               error: 'Unable to fetch departments',
          });
     }
});

router.delete('/:id', isLoggedIn, async (req, res) => {
     try {
          const id = req.params.id;

          // Custom validation for the update permission request
          if (!isValidObjectId(id)) {
               return res.status(400).json({
                    success: false,
                    error: 'Invalid department ID',
               });
          }

          const existingDepartmentId = await departmentModel.findById(id);
          if (!existingDepartmentId) {
               return res.status(404).json({
                    success: false,
                    error: 'Department not found',
               });
          }

          await departmentService.deleteDepartment(id);
          return res.status(200).json({
               success: true,
               msg: 'Department deleted successfully',
          });
     } catch (error) {
          return res.status(500).json({
               success: false,
               error: 'Unable to delete department',
          });
     }
});

router.get('/departments', isLoggedIn, async (req, res) => {
     try {
          const organizationId = req.user.data.organizationId;

          const departments =
               await departmentService.getDepartmentsByOrganizationId(
                    organizationId
               );

          return res.status(200).json({ success: true, departments });
     } catch (error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               error: 'Unable to fetch departments',
          });
     }
});

// API to assign departments to a location
// router.post('/assign-departments/:locationId', isLoggedIn, async (req, res) => {
//      try {
//           const locationId = req.params.locationId;
//           const departments = req.body.departments;

//           // Validate if the location exists and is accessible to the admin
//           const location = await locationModel.findOne({
//                _id: locationId,
//                organizationId: req.user.data.organizationId,
//           });

//           if (!location) {
//                return res.status(404).json({
//                     success: false,
//                     error: 'Location not found or not accessible.',
//                });
//           }

//           // Fetch the departmentIds based on the department objects provided in the request body
//           const departmentIds = departments.map((dept) => dept.departmentId);

//           // Check if all departmentIds are valid
//           const validDepartments = await departmentService.isValidDepartments(
//                departmentIds
//           );

//           if (!validDepartments) {
//                return res.status(400).json({
//                     success: false,
//                     error: 'Invalid departmentIds provided.',
//                });
//           }

//           // Create the array of embedded documents for departments
//           const departmentsData = departments.map((dept) => ({
//                departmentId: dept.departmentId,
//                departmentAddress: {
//                     address1: dept.departmentAddress.address1,
//                     city: dept.departmentAddress.city,
//                },
//                contactAddress: {
//                     emailAddress: dept.contactAddress.emailAddress,
//                     contactNumber: dept.contactAddress.contactNumber,
//                },
//                moreInformation: {
//                     departmentIncharge: dept.moreInformation.departmentIncharge,
//                     chargingType: dept.moreInformation.chargingType,
//                },
//           }));

//           // Update the location with the chosen departments and their details
//           location.departments = departmentsData;

//           // Save the updated location
//           const updatedLocation = await location.save();

//           return res.status(200).json({
//                success: true,
//                msg: 'Departments assigned to location successfully',
//                location: updatedLocation,
//           });
//      } catch (error) {
//           console.log(error);
//           return res.status(500).json({
//                success: false,
//                error: 'Unable to assign departments to location',
//           });
//      }
// });

// router.post('/', isLoggedIn, async (req, res) => {
//      try {
//           const organizationId = req.user.data.organizationId;
//           let { departmentId, name, chargingType, status } = req.body;

//           // Trim leading and trailing spaces from departmentId and name
//           departmentId = departmentId.trim();
//           name = name.trim();

//           if (!name) {
//                return res.status(400).json({
//                     success: false,
//                     error: 'Department name cannot be empty. Please provide a valid name.',
//                });
//           }

//           const existingDepartmentId = await departmentModel.findOne({
//                departmentId: { $regex: new RegExp(`^${departmentId}$`, 'i') }, // Case-insensitive match
//                isDeleted: false,
//           });

//           if (existingDepartmentId) {
//                return res.status(400).json({
//                     success: false,
//                     error: `Department '${departmentId}' already exists.`,
//                });
//           }

//           // Check if name is duplicate (case-insensitive match)
//           const existingName = await departmentModel.findOne({
//                name: { $regex: new RegExp(`^${name}$`, 'i') },
//                isDeleted: false,
//           });

//           if (existingName) {
//                return res.status(400).json({
//                     success: false,
//                     error: `Department with name '${name}' already exists.`,
//                });
//           }

//           const departmentData = {
//                organizationId,
//                departmentId,
//                name,
//                chargingType,
//                status,
//                createdAt: new Date(),
//           };

//           const addDepartment = await departmentService.addDepartment(
//                departmentData
//           );

//           return res.status(201).json({
//                success: true,
//                msg: 'Department added successfully',
//                department: addDepartment,
//           });
//      } catch (error) {
//           console.log(error);
//           return res.status(500).json({
//                success: false,
//                error: 'Unable to add department',
//           });
//      }
// });

export default router;
