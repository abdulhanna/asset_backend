import express from 'express';
import { departmentService } from '../services/departments';

const router = express.Router();

router.post('/', async (req, res) => {
     try {
          const data = req.body;
          const department = await departmentService.addDepartment(data);
          res.status(201).json({
               success: true,
               msg: 'Departments added successfully',
               department,
          });
     } catch (error) {
          console.log(error);
          res.status(500).json({
               success: false,
               error: 'Unable to add departments',
          });
     }
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

export default router;
