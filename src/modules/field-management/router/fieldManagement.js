import express from 'express';
import { fieldManagementService } from '../services/fieldManagement.js';

const router = express.Router();

router.post('/add-groups', async (req, res) => {
     try {
          const { name } = req.body;

          if (Array.isArray(name)) {
               const newFieldGroups =
                    await fieldManagementService.createMultipleFieldGroups(
                         name
                    );
               res.status(201).json(newFieldGroups);
          }
     } catch (error) {
          console.log(error);
          res.status(500).json({ error: 'Unable to create field group' });
     }
});

router.put('/:groupId/add-fields', async (req, res) => {
     try {
          const { groupId } = req.params;
          const { fields } = req.body;

          const updatedFieldGroup =
               await fieldManagementService.addFieldToGroup(groupId, fields);
          res.status(200).json(updatedFieldGroup);
     } catch (error) {
          console.log(error);
          res.status(500).json({ error: 'Unable to update field group' });
     }
});

router.get('/list', async (req, res) => {
     const fieldGroups = await fieldManagementService.getFieldGroups();

     res.status(200).json(fieldGroups);
});

router.put('/:groupId', async (req, res) => {
     const { groupId } = req.params;
     const data = req.body;

     const updatedFieldGroup = await fieldManagementService.updateFieldGroup(
          groupId,
          data
     );

     res.status(200).json(updatedFieldGroup);
});

export default router;
