import express from 'express';
import { departmentService } from '../services/departments';
import { isLoggedIn } from '../../auth/router/passport.js';
import departmentModel from '../models/departments.js';

const router = express.Router();

router.post('/', isLoggedIn, async (req, res) => {
     try {
          let { departmentId, name, chargingType, status } = req.body;

          // Trim leading and trailing spaces from departmentId and name
          departmentId = departmentId.trim();
          name = name.trim();

          if (!name) {
               return res.status(400).json({
                    success: false,
                    error: 'Department name cannot be empty. Please provide a valid name.',
               });
          }

          const existingDepartmentId = await departmentModel.findOne({
               departmentId: { $regex: new RegExp(`^${departmentId}$`, 'i') }, // Case-insensitive match
               isDeleted: false,
          });

          if (existingDepartmentId) {
               return res.status(400).json({
                    success: false,
                    error: `Department '${departmentId}' already exists.`,
               });
          }

          // Check if name is duplicate (case-insensitive match)
          const existingName = await departmentModel.findOne({
               name: { $regex: new RegExp(`^${name}$`, 'i') },
               isDeleted: false,
          });

          if (existingName) {
               return res.status(400).json({
                    success: false,
                    error: `Department with name '${name}' already exists.`,
               });
          }

          const departmentData = {
               departmentId,
               name,
               chargingType,
               status,
               createdAt: new Date(),
          };

          const addDepartment = await departmentService.addDepartment(
               departmentData
          );

          res.status(201).json({
               success: true,
               msg: 'Department added successfully',
               department: addDepartment,
          });
     } catch (error) {
          console.log(error);
          res.status(500).json({
               success: false,
               error: 'Unable to add department',
          });
     }
});

router.put('/:id', isLoggedIn, async (req, res) => {
     try {
          const id = req.params.id;
          const data = req.body;

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

          res.status(200).json({
               success: true,
               msg: 'Department updated successfully',
               department: updatedDepartment,
          });
     } catch (error) {
          console.log(error);
          res.status(500).json({
               success: false,
               error: 'Unable to update department',
          });
     }
});

router.get('/:id', isLoggedIn, async (req, res) => {
     try {
          const id = req.params.id;
          const department = await departmentService.getDepartmentById(id);
          res.status(200).json({
               success: true,
               department,
          });
     } catch (error) {
          res.status(500).json({
               success: false,
               error: 'Unable to fetch department',
          });
     }
});

router.get('/', isLoggedIn, async (req, res) => {
     try {
          const departments = await departmentService.getDepartments();

          res.status(200).json({
               success: true,
               departments,
          });
     } catch (error) {
          res.status(500).json({
               success: false,
               error: 'Unable to fetch departments',
          });
     }
});

router.delete('/:id', isLoggedIn, async (req, res) => {
     try {
          const id = req.params.id;
          await departmentService.deleteDepartment(id);
          res.status(200).json({
               success: true,
               msg: 'Department deleted successfully',
          });
     } catch (error) {
          res.status(500).json({
               success: false,
               error: 'Unable to delete department',
          });
     }
});

export default router;
