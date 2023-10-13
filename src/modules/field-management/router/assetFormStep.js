import express from 'express';
import {assetFormStepService} from '../services/assetFormStep';
import {isLoggedIn} from '../../auth/router/passport';

const router = express.Router();

router.post('/associateAssetFormStepWithGroups', isLoggedIn, async (req, res) => {
    try {
        const {stepNo, stepName, groups} = req.body;

        console.log(req.body);
        await assetFormStepService.associateAssetFormStepWithGroups(stepNo, stepName, groups);

        res.json({message: 'AssetFormStep associated with groups successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.get('/list-forms', isLoggedIn, async (req, res) => {
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

router.get('/list-form/:id', isLoggedIn, async (req, res) => {
    const {id} = req.params;
    const formStepDataById = await assetFormStepService.getFormStepById(id);

    return res.status(200).json({
        success: true,
        formStepDataById
    });
});

router.put('/update-form/:id', isLoggedIn, async (req, res) => {
    try {
        const {stepNo, stepName, groups} = req.body;
        const formId = req.params.id;

        await assetFormStepService.updateForm(formId, stepNo, stepName, groups);

        res.json({message: 'Form updated successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.delete('/delete-form/:id', isLoggedIn, async (req, res) => {
    try {
        const formId = req.params.id;

        await assetFormStepService.deleteForm(formId);

        res.json({message: 'Form deleted successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});
export default router;

