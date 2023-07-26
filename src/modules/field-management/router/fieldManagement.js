import express from 'express';
import { fieldManagementService } from '../services/fieldManagement.js';

const router = express.Router();

router.post('/add', async (req, res) => {
     try {
          const { name, fields } = req.body;
          let newFieldGroup;

          if (fields) {
               // If fields are provided, create/update with fields array
               newFieldGroup = await fieldManagementService.createFieldGroup(
                    name,
                    fields
               );
          } else {
               // If fields are not provided, create with just the name property
               newFieldGroup = await fieldManagementService.createFieldGroup(
                    name
               );
          }

          res.status(201).json(newFieldGroup);
     } catch (error) {
          console.log(error);
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
