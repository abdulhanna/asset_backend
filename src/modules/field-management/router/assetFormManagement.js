import express from 'express';
import {assetFormManagementService} from '../services/assetFormManagement.js';
import {isLoggedIn} from '../../auth/router/passport.js';

const router = express.Router();

router.post('/push-fields-to-assetform', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;
        const assetFormManagement = await assetFormManagementService.pushFieldsToAssetForm(organizationId);
        res.status(201).json(assetFormManagement);
    } catch (error) {
        res.status(500).send('Error pushing fields to assetFormManagements');
    }
});

router.get('/assetform', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;
        const assetFormManagementList = await assetFormManagementService.getAssetFormManagementList(organizationId);
        return res.status(200).json(assetFormManagementList);

    } catch (error) {
        res.status(500).send('Error in list  assetFormManagements');
    }

});


// Define a route for updating fields in assetFormManagementSchema
router.post('/modify-fields-in-assetform', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;
        const {subgroupIndex, fieldId, action, updatedField} = req.body;

        const result = await assetFormManagementService.modifyFieldsInAssetForm(organizationId, subgroupIndex, fieldId, action, updatedField);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error modifying fields in assetFormManagement');
    }
});


export default router;