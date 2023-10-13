import express from 'express';
import {assetFormStepService} from '../services/assetFormStep';

const router = express.Router();

router.post('/associateAssetFormStepWithGroups', async (req, res) => {
    try {
        const {stepNo, stepName, groups} = req.body;

        console.log(req.body);
        await assetFormStepService.associateAssetFormStepWithGroups(stepNo, stepName, groups);

        res.json({message: 'AssetFormStep associated with groups successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.get('/list-forms', async (req, res) => {
    try {
        const forms = await assetFormStepService.listForms();
        return res.status(200).json(forms);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

router.put('/update-form/:id', async (req, res) => {
    try {
        const {stepNo, stepName, groups} = req.body;
        const formId = req.params.id;

        await assetFormStepService.updateForm(formId, stepNo, stepName, groups);

        res.json({message: 'Form updated successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.delete('/delete-form/:id', async (req, res) => {
    try {
        const formId = req.params.id;

        await assetFormStepService.deleteForm(formId);

        res.json({message: 'Form deleted successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});
export default router;

