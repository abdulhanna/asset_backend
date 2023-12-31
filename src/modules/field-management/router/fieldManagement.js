import express from 'express';
import {fieldManagementService} from '../services/fieldManagement.js';
import {isLoggedIn} from '../../auth/router/passport.js';

const router = express.Router();

// Create multiple groups with only group names
router.post('/add-groups', isLoggedIn, async (req, res) => {
    try {
        const {groupDetails} = req.body;
        const organizationId = req.user.data.organizationId;

        if (Array.isArray(groupDetails)) {
            const existingGroups = await fieldManagementService.checkExistingGroups(groupDetails.map(group => group.groupName));

            if (existingGroups.length > 0) {
                return res.status(400).json({
                    message: 'Group names already exist',
                });
            }

            const newFieldGroups = await fieldManagementService.createMultipleFieldGroups(groupDetails, organizationId);
            return res.status(201).json({success: true, message: 'Field groups added successfully', newFieldGroups});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Unable to create field groups'});
    }
});


// Update subgroups within a group
router.put('/:groupId/add-subgroups', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;
        const {groupId} = req.params;
        const {subgroups} = req.body;

        const updatedFieldGroup =
            await fieldManagementService.updateSubgroups(groupId, subgroups, organizationId);
        
        return res.status(200).json(updatedFieldGroup);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to update subgroups'});
    }
});


////////// filed add on root level only
router.put('/add-field/root/:id', isLoggedIn, async (req, res) => {
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


/////////// field added by root, will be updated on both root and superadmin level
router.put('/add-field/:id', isLoggedIn, async (req, res) => {
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


////// edit field details by field id //////////
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


/// update group name, subgroup name and field details by group Id
router.put('/update-group/:id', async (req, res) => {
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


// get all groups with subgroup and fields
router.get('/allGroups', isLoggedIn, async (req, res) => {
    try {

        const organizationId = req.user.data.organizationId;
        const fieldGroups = await fieldManagementService.getFieldGroupsByOrganizationIdNull(organizationId);

        return res.status(200).json(fieldGroups);
        // return res.status(200).json({success: true, fieldGroups});

    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to get field groups'});
    }
});

router.get('/allGroupsWithStepForm', isLoggedIn, async (req, res) => {
    try {

        const stepNo = parseInt(req.query.stepNo) || 1;
        const organizationId = req.user.data.organizationId;
        const fieldGroups = await fieldManagementService.getFieldGroupsForFormStep(organizationId, stepNo);


        return res.status(200).json(fieldGroups);
        // return res.status(200).json({success: true, fieldGroups});

    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to get field groups for step form'});
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

/// get fileds, subgroup and its field of a group by groupId
router.get('/group/:groupId', isLoggedIn, async (req, res) => {
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


// get subgroup details by subgroup Id
router.get('/subgroup/:subgroupId', isLoggedIn, async (req, res) => {
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


// delete filed by field id
router.delete('/delete-field/:fieldId', isLoggedIn, async (req, res) => {
    try {
        const {fieldId} = req.params;

        const updatedFieldGroup = await fieldManagementService.deleteFieldById(fieldId);
        return res.status(200).json(updatedFieldGroup);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to delete field'});
    }
});


router.put('/field/:fieldId/mark-deleted', isLoggedIn, async (req, res) => {
    try {
        const {fieldId} = req.params;

        const updatedFieldGroup = await fieldManagementService.markFieldAsDeleted(fieldId);
        return res.status(200).json(updatedFieldGroup);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Unable to mark field as deleted'});
    }
});


/// delete group whole data fields/subgroup/ subgroup fileds

router.delete('/delete-group/:groupId', isLoggedIn, async (req, res) => {
    try {
        const {groupId} = req.params;
        const organizationId = req.user.data.organizationId;

        if (!organizationId) {
            const result = await fieldManagementService.deleteGroupAndFieldsById(groupId);
            return res.status(200).json({
                success: true,
                message: result ? 'Group and related fields deleted successfully' : 'Group not found',
            });
        }

        const isMandatory = await fieldManagementService.checkIfGroupIsMandatory(groupId, organizationId);

        if (isMandatory) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a mandatory group associated with an organization',
            });
        }

        const isRemovedFromAssetForm = await fieldManagementService.removeGroupFromAssetFormManagement(groupId, organizationId);

        if (isRemovedFromAssetForm) {
            return res.status(200).json({
                success: true,
                message: 'Group removed from asset form management',
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Error removing group from asset form management',
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});


//

router.delete('/delete-subgroup/:subgroupId', isLoggedIn, async (req, res) => {
    try {
        const {subgroupId} = req.params;
        const deleteSubGroupId = await fieldManagementService.deleteSubGroupById(subgroupId);

        return res.status(200).json({
            success: true,
            message: 'Subgroup deleted successfully'
        });

    } catch (error) {
        // Handle errors here
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
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
