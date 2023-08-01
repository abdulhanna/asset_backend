import express from 'express';
import { departmentService } from '../services/departments';

const router = express.Router();

router.post('/', async (req, res) => {
     try {
          const data = req.body;
          const addedDepartment = await departmentService.addDepartment(data);
          res.status(201).json({
               success: true,
               msg: 'Departments added successfully',
               department: addedDepartment,
          });
     } catch (error) {
          console.log(error);
          res.status(500).json({
               success: false,
               error: 'Unable to add departments',
          });
     }
});

router.put('/:id', async (req, res) => {
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

router.get('/:id', async (req, res) => {
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
     }g
});

router.get('/', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
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
