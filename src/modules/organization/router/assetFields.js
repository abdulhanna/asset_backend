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

        const assetImagesForCloudinary = [];
        const documentImagesForCloudinary = [];

        console.log('files', req.files);
        // Separate images for assetImages and uploadDocuments based on field names
        req.files.forEach(file => {
            if (file.fieldname.startsWith('assetIdentification[attachments][uploadAssetImages]')) {
                assetImagesForCloudinary.push(file);
            } else if (file.fieldname.startsWith('assetIdentification[attachments][uploadDocuments]')) {
                documentImagesForCloudinary.push(file);
            }
        });

        const assetUrls = await uploadImagesToCloudinary(assetImagesForCloudinary);
        const documentUrls = await uploadImagesToCloudinary(documentImagesForCloudinary);

        console.log(assetUrls, 'assetUrls');
        console.log(documentUrls, 'documentUrls');

        assetData.assetIdentification.attachments.uploadAssetImages = assetUrls;
        assetData.assetIdentification.attachments.uploadDocuments = documentUrls;

        const newAsset = await assetService.createAsset(organizationId, assetData);
        res.status(201).json({
            success: true,
            newAsset
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


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
