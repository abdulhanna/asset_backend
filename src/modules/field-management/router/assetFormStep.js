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

export default router;

