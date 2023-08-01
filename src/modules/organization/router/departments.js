import express from 'express';
import { departmentService } from '../services/departments';
import { isLoggedIn } from '../../auth/router/passport.js';
import departmentModel from '../models/departments.js';

const router = express.Router();

router.post('/', isLoggedIn, async (req, res) => {
     try {
          const { departmentId, name, chargingType, status } = req.body;
          const existingDepartmentId = await departmentModel.findOne({
               departmentId,
               isDeleted: false,
          });
          if (existingDepartmentId) {
               return res.status(400).json({
                    success: false,
                    error: `Department '${departmentId}' already exists.`,
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
               msg: 'Departments added successfully',
               department: addDepartment,
          });
     } catch (error) {
          console.log(error);
          res.status(500).json({
               success: false,
               error: 'Unable to add departments',
          });
     }
});

router.put('/:id', isLoggedIn, async (req, res) => {
     try {
          const id = req.params.id;
          const data = req.body;
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
