import express from 'express';
import { fieldManagementService } from '../services/fieldManagement.js';
import { isLoggedIn } from '../../auth/router/passport.js';

const router = express.Router();

// Create multiple groups with only group names
router.post('/add-groups', isLoggedIn, async (req, res) => {
     try {
          const { groupNames } = req.body;

          if (Array.isArray(groupNames)) {
               const newFieldGroups =
                    await fieldManagementService.createMultipleFieldGroups(
                         groupNames
                    );
               return res.status(201).json(newFieldGroups);
          }
     } catch (error) {
          console.error(error);
          return res
               .status(500)
               .json({ error: 'Unable to create field groups' });
     }
});

// Update subgroups within a group
router.put('/:groupId/add-subgroups', isLoggedIn, async (req, res) => {
     try {
          const { groupId } = req.params;
          const { subgroups } = req.body;

          const updatedFieldGroup =
               await fieldManagementService.updateSubgroups(groupId, subgroups);
          return res.status(200).json(updatedFieldGroup);
     } catch (error) {
          console.log(error);
          return res.status(500).json({ error: 'Unable to update subgroups' });
     }
});

// Update fields within a subgroup by subgroup ID
router.put('/subgroups/:subgroupId', isLoggedIn, async (req, res) => {
     try {
          const { subgroupId } = req.params;
          const { fields } = req.body;

          const updatedFieldGroup =
               await fieldManagementService.updateSubgroupFields(
                    subgroupId,
                    fields
               );
          return res.status(200).json(updatedFieldGroup);
     } catch (error) {
          console.log(error);
          return res
               .status(500)
               .json({ error: 'Unable to update subgroup fields' });
     }
});
// Update fields within a group by group ID
router.put('/groups/:groupId', isLoggedIn, async (req, res) => {
     try {
          const { groupId } = req.params;
          const { fields } = req.body;

          const updatedFieldGroup = await fieldManagementService.updateGroupFields(groupId, fields);
          return res.status(200).json(updatedFieldGroup);
     } catch (error) {
          console.log(error);
          return res.status(500).json({ error: 'Unable to update group fields' });
     }
});
router.get('/list', isLoggedIn, async (req, res) => {
     try {
          const fieldGroups = await fieldManagementService.getFieldGroups();

          return res.status(200).json(fieldGroups);
     } catch (error) {
          console.log(error);
          return res.status(500).json({ error: 'Unable to get field groups' });
     }
});

router.get('/:groupId', isLoggedIn, async (req, res) => {
     try {
          const { groupId } = req.params;
          const fieldGroup = await fieldManagementService.getFieldGroupsById(
               groupId
          );

          return res.status(200).json(fieldGroup);
     } catch (error) {
          return res
               .status(500)
               .json({ error: 'Unable to get field group by Id' });
     }
});

router.put('/:groupId/update-fields', isLoggedIn, async (req, res) => {
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

router.delete('/fields/:fieldId', isLoggedIn, async (req, res) => {
     const { fieldId } = req.params;

     try {
          const result = await fieldManagementService.deleteFieldById(fieldId);
          if (result) {
               return res.status(200).json({
                    success: true,
                    message: 'Field deleted successfully',
               });
          } else {
               return res.status(404).json({ message: 'Field not found' });
          }
     } catch (error) {
          return res.status(500).json({ message: 'Internal server error' });
     }
});

router.delete('/groups/:groupId', isLoggedIn, async (req, res) => {
     const { groupId } = req.params;
     try {
          const result = await fieldManagementService.deleteGroupAndFieldsById(
               groupId
          );
          if (result) {
               return res.status(200).json({
                    success: true,
                    message: 'Group and related fields deleted successfully',
               });
          } else {
               return res.status(404).json({ message: 'Group not found' });
          }
     } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Internal server error' });
     }
});

export default router;
