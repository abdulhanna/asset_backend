import express from 'express';
import {fieldManagementService} from '../services/fieldManagement.js';
import {isLoggedIn} from '../../auth/router/passport.js';

const router = express.Router();

// Create multiple groups with only group names
router.post('/add-groups', isLoggedIn, async (req, res) => {
    try {
        const {groupNames} = req.body;

        if (Array.isArray(groupNames)) {
            const newFieldGroups =
                await fieldManagementService.createMultipleFieldGroups(
                    groupNames
                );
            return res.status(201).json({success: true, message: 'Field groups added successfully', newFieldGroups});
        }
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({error: 'Unable to create field groups'});
    }
});

// Update subgroups within a group
router.put('/:groupId/add-subgroups', isLoggedIn, async (req, res) => {
    try {
        const {groupId} = req.params;
        const {subgroups} = req.body;

        const updatedFieldGroup =
            await fieldManagementService.updateSubgroups(groupId, subgroups);
        return res.status(200).json(updatedFieldGroup);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to update subgroups'});
    }
});

router.put('/fields/:id', isLoggedIn, async (req, res) => {
    try {
        // const organizationId = req.user.data.organizationId;
        const {id} = req.params;
        const {fields} = req.body;

        const updatedFieldGroup = await fieldManagementService.updateFields(id, fields);
        return res.status(200).json(updatedFieldGroup);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to update fields'});
    }
});


router.put('/v2/field/:id', isLoggedIn, async (req, res) => {
    try {
        // const organizationId = req.user.data.organizationId;
        const {id} = req.params;
        const {fields} = req.body;
    
        const updatedFieldGroup = await fieldManagementService.addFieldAndUpdateAssetForm(id, fields);
        return res.status(200).json(updatedFieldGroup);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to update fields'});
    }
});


router.put('/addfieldSub/:id', isLoggedIn, async (req, res) => {
    try {
        const {id} = req.params;
        const updatesub = await fieldManagementService.addfieldSub(id);
        return res.status(200).json(updatesub)
    } catch (error){
        console.log(error);
        return  res.status(500).json({error: 'Unable to update fields'})
    }
})

router.put('/edit-field/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const updatedData = req.body;

        const result = await fieldManagementService.editFieldById(id, updatedData);

        if (result.matchedCount === 0) {
            return res.status(404).json({error: 'Field not found'});
        }

        res.json({result, message: 'Field updated successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


router.put('/update/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const updatedData = req.body;

        const result = await fieldManagementService.updateFieldData(id, updatedData);

        if (result.nModified === 0) {
            return res.status(404).json({error: 'Group not found'});
        }

        return res.json({message: 'Data updated successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.get('/listWithoutOrganizationId', isLoggedIn, async (req, res) => {
    try {
        const fieldGroups = await fieldManagementService.getFieldGroupsByOrganizationIdNull();

        return res.status(200).json({success: true, fieldGroups});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to get field groups'});
    }
});

router.get('/listWithOrganizationId', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;

        const fieldGroups = await fieldManagementService.getFieldGroupsByOrganizationId(organizationId);

        return res.status(200).json({success: true, fieldGroups});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to get field groups'});
    }
});

router.get('/:groupId', isLoggedIn, async (req, res) => {
    try {
        const {groupId} = req.params;
        const fieldGroup = await fieldManagementService.getFieldGroupsById(
            groupId
        );

        return res.status(200).json(fieldGroup);
    } catch (error) {
        return res
            .status(500)
            .json({error: 'Unable to get field group by Id'});
    }
});


router.delete('/fields/:fieldId', isLoggedIn, async (req, res) => {
    try {
        const {fieldId} = req.params;

        const updatedFieldGroup = await fieldManagementService.deleteFieldById(fieldId);
        return res.status(200).json(updatedFieldGroup);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to delete field'});
    }
});


router.put('/fields/:fieldId/mark-deleted', isLoggedIn, async (req, res) => {
    try {
        const {fieldId} = req.params;

        const updatedFieldGroup = await fieldManagementService.markFieldAsDeleted(fieldId);
        return res.status(200).json(updatedFieldGroup);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to mark field as deleted'});
    }
});


router.delete('/groups/:groupId', isLoggedIn, async (req, res) => {
    const {groupId} = req.params;
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
            return res.status(404).json({message: 'Group not found'});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});


//Organization level form-management


//--------------Not in use

// Update fields within a subgroup by subgroup ID
router.put('/subgroups/:subgroupId', isLoggedIn, async (req, res) => {
    try {
        const {subgroupId} = req.params;
        const {fields} = req.body;

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
            .json({error: 'Unable to update subgroup fields'});
    }
});
// Update fields within a group by group ID
router.put('/groups/:groupId', isLoggedIn, async (req, res) => {
    try {
        const {groupId} = req.params;
        const {fields} = req.body;

        const updatedFieldGroup = await fieldManagementService.updateGroupFields(groupId, fields);
        return res.status(200).json(updatedFieldGroup);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to update group fields'});
    }
});


router.get('/subgroups/:subgroupId', isLoggedIn, async (req, res) => {
    try {
        const {subgroupId} = req.params;
        const fields = await fieldManagementService.getFieldsBySubgroupId(subgroupId);
        return res.status(200).json({
            success: true,
            fields
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to fetch subgroup fields'});
    }
});

router.put('/:groupId/update-fields', isLoggedIn, async (req, res) => {
    try {
        const {groupId} = req.params;
        const {fields, groupName} = req.body;

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
            .json({error: 'Unable to update field group'});
    }
});
export default router;
