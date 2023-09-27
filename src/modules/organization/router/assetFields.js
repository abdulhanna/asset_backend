import express from 'express';
import {assetService} from '../services/assetFields';
import {isLoggedIn} from '../../auth/router/passport';
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';
import {secret} from '../../../config/secret.js';

cloudinary.config(secret.cloudinary);

const router = express.Router();

const storage = multer.diskStorage({});
const upload = multer({storage});


const uploadImagesToCloudinary = async (files) => {
    const uploadedImages = await Promise.all(files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        return result.secure_url;
    }));
    console.log('uploadedImages', uploadedImages);
    return uploadedImages;
};
router.post('/', isLoggedIn, upload.any(), async (req, res) => {
    try {
        const assetData = req.body;
        const organizationId = req.user.data.organizationId;

        // Ensure that assetIdentification.attachments is an object
        if (!assetData.assetIdentification.attachments) {
            assetData.assetIdentification.attachments = {};
        }

        const assetImages = await uploadImagesToCloudinary(req.files);
        assetData.assetIdentification.attachments.uploadAssetImages = assetImages;
        assetData.assetIdentification.attachments.uploadDocuments = assetImages;

        const newAsset = await assetService.createAsset(organizationId, assetData);
        res.status(201).json({
            success: true,
            newAsset
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


// Create a new asset
// router.post('/', isLoggedIn, upload.fields([
//     {name: 'assetIdentification[attachments][uploadAssetImages]', maxCount: 10},
//     {name: 'ownershipDetails[attachments][uploadOwnershipReceipt]', maxCount: 10},
//     // {name: 'ownershipDetails[attachments][uploadLegalDocument]', maxCount: 10},
//     // {name: 'assetAcquisition[futureAddition][attachments]', maxCount: 10}
// ]), async (req, res) => {
//     try {
//         const assetData = req.body;
//         const organizationId = req.user.data.organizationId;
//
//         const uploadImagesToCloudinary = async (files) => {
//             const uploadedImages = await Promise.all(files.map(async (file) => {
//                 const result = await cloudinary.uploader.upload(file.path);
//                 return result.secure_url;
//             }));
//             return uploadedImages;
//         };
//
//         const assetImages = await uploadImagesToCloudinary(req.files['assetIdentification[attachments][uploadAssetImages]']);
//         const ownershipReceiptImages = await uploadImagesToCloudinary(req.files['ownershipDetails[attachments][uploadOwnershipReceipt]']);
//         // const legalDocumentImages = await uploadImagesToCloudinary(req.files['ownershipDetails[attachments][uploadLegalDocument]']);
//         // const futureAdditionImages = await uploadImagesToCloudinary(req.files['assetAcquisition[futureAddition][attachments]']);
//
//         assetData.assetIdentification.attachments.uploadAssetImages = assetImages;
//         assetData.ownershipDetails.attachments.uploadOwnershipReceipt = ownershipReceiptImages;
//         // assetData.ownershipDetails.attachments.uploadLegalDocument = legalDocumentImages;
//         // assetData.assetAcquisition.futureAddition.attachments = futureAdditionImages;
//
//         const newAsset = await assetService.createAsset(organizationId, assetData);
//         res.status(201).json({
//             success: true,
//             newAsset
//         });
//     } catch (error) {
//         res.status(500).json({error: error.message});
//     }
// });


// Get assets for the organization
router.get('/list', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;
        const assets = await assetService.getAssetsByOrganization(organizationId);
        res.status(200).json(assets);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


export default router;
