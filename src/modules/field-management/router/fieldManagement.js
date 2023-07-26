import express from 'express';
import { fieldManagementService } from '../services/fieldManagement.js';

const router = express.Router();

router.post('/add', async (req, res) => {
     try {
          const { name, fields } = req.body;
          const newFieldGroup = await fieldManagementService.createFieldGroup(
               name,
               fields
          );
          res.status(201).json(newFieldGroup);
     } catch (error) {
          res.status(500).json({ error: 'Unable to create field group' });
     }
});

router.get('/list', async (req, res) => {
     try {
          const filedGroups = await fieldManagementService.getFieldGroups();

          res.status(200).json(filedGroups);
     } catch (error) {
          res.status(500).json({ error: 'Unable to get field group' });
     }
});

export default router;
