import express from 'express';
import {assetFormStepService} from '../services/assetFormStep';
import {isLoggedIn} from '../../auth/router/passport';

const router = express.Router();

router.post('/associateAssetFormStepWithGroups', isLoggedIn, async (req, res) => {
    try {
        const {stepNo, stepName, groups} = req.body;

        if (stepNo) {
            const stepExists = await assetFormStepService.checkStepNoExists(stepNo);

            if (stepExists) {
                return res.status(400).json({
                    success: false,
                    error: 'Step number already exists'
                });
            }
        }

        // Check for duplicate groupIds in the groups array
        const uniqueGroupIds = new Set(groups.map(group => group.groupId));
        if (uniqueGroupIds.size !== groups.length) {
            return res.status(400).json({
                success: false,
                error: 'Duplicate groups are not allowed. Please ensure each group is included only once.'
            });
        }


        for (const group of groups) {
            const foundGroup = await assetFormStepService.checkGroupHasAssetFormStep(group.groupId);
            console.log('foundGroup', foundGroup)

            if (foundGroup) {
                return res.status(400).json({
                    success: false,
                    error: `Group ${foundGroup.groupName} is already associated with another step`
                });
            }
        }

        await assetFormStepService.associateAssetFormStepWithGroups(stepNo, stepName, groups);

        return res.json({message: 'AssetFormStep associated with groups successfully'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: error.message});
    }
});


router.get('/groups', isLoggedIn, async (req, res) => {
    try {
        const groups = await assetFormStepService.getListOfGroups();

        return res.json(groups);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});


router.get('/listAllSteps', isLoggedIn, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 10;
        const sortBy = req.query.sort ? JSON.parse(req.query.sort) : 'createdAt';

        const formStepData = await assetFormStepService.listForms(page, limit, sortBy);

        return res.status(200).json({
            success: true,
            stepForms: formStepData.data,
            totalDocuments: formStepData.totalDocuments,
            totalPages: formStepData.totalPages,
            startSerialNumber: formStepData.startSerialNumber,
            endSerialNumber: formStepData.endSerialNumber,
            currentPage: page

        });
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

router.get('/stepDetails/:id', isLoggedIn, async (req, res) => {
    try {
        const {id} = req.params;
        const formStepDataById = await assetFormStepService.getFormStepById(id);

        return res.status(200).json({
            success: true,
            formStepDataById
        });
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

router.put('/update-form/:id', isLoggedIn, async (req, res) => {
    try {
        const {stepNo, stepName, groups} = req.body;
        const formId = req.params.id;

        // Check for duplicate groupIds in the groups array
        const uniqueGroupIds = new Set(groups.map(group => group.groupId));
        
        if (uniqueGroupIds.size !== groups.length) {
            return res.status(400).json({
                success: false,
                error: 'Duplicate groups are not allowed. Please ensure each group is included only once.',
            });
        }
        await assetFormStepService.updateForm(formId, stepNo, stepName, groups);

        return res.json({message: 'Form updated successfully'});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

router.delete('/delete-form/:id', isLoggedIn, async (req, res) => {
    try {
        const formId = req.params.id;

        await assetFormStepService.deleteForm(formId);

        return res.json({message: 'Form deleted successfully'});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});
export default router;

