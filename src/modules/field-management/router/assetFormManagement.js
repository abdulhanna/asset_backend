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
// router.put('/modify-fields-in-assetform', isLoggedIn, async (req, res) => {
//     try {
//         const organizationId = req.user.data.organizationId;
//         const {groupOrSubgroupId, fieldId, action, updatedField} = req.body;
//
//         const result = await assetFormManagementService.modifyFieldsInAssetForm(organizationId, groupOrSubgroupId, fieldId, action, updatedField);
//
//         res.status(200).json(result);
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Error modifying fields in assetFormManagement');
//     }
// });

router.put('/add-field-in-assetform', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;
        const {groupOrSubgroupId, updatedField} = req.body;

        const result = await assetFormManagementService.addFieldToAssetForm(organizationId, groupOrSubgroupId, updatedField);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error adding field to assetFormManagement');
    }
});


router.put('/remove-field-in-assetform', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;
        const {groupOrSubgroupId, fieldId} = req.body;

        const result = await assetFormManagementService.removeFieldFromAssetForm(organizationId, groupOrSubgroupId, fieldId);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error removing field from assetFormManagement');
    }
});


export default router;