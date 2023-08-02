import express from 'express';
import { fieldManagementService } from '../services/fieldManagement.js';
import { isLoggedIn } from '../../auth/router/passport.js';

const router = express.Router();

router.post('/add-groups', isLoggedIn, async (req, res) => {
     try {
          const { groupName } = req.body;

          if (Array.isArray(groupName)) {
               const newFieldGroups =
                    await fieldManagementService.createMultipleFieldGroups(
                         groupName
                    );
               res.status(201).json(newFieldGroups);
          }
     } catch (error) {
          console.log(error);
          res.status(500).json({ error: 'Unable to create field group' });
     }
});

router.put('/:groupId/add-fields', isLoggedIn, async (req, res) => {
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

router.get('/list', isLoggedIn, async (req, res) => {
     const fieldGroups = await fieldManagementService.getFieldGroups();

     return res.status(200).json(fieldGroups);
});

router.put('/:groupId/update-fields', async (req, res) => {
     try {
          const { groupId } = req.params;
          const { fields, groupName } = req.body;

          const updatedFieldGroup =
               await fieldManagementService.addFieldToGroupV2(
                    groupId,
                    fields,
                    groupName
               );
          return res.status(200).json(updatedFieldGroup);
     } catch (error) {
          console.log(error);
          return res
               .status(500)
               .json({ error: 'Unable to update field group' });
     }
});

export default router;
