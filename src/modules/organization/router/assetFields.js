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
    try {
        const uploadedImages = await Promise.all(files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path);
            return result.secure_url;
        }));
        return uploadedImages;
    } catch (error) {
        throw new Error('Error uploading images to Cloudinary');
    }
};

router.post('/', isLoggedIn, upload.any(), async (req, res) => {
    try {
        const assetData = req.body;
        const organizationId = req.user.data.organizationId;

        // Ensure that assetIdentification.attachments is an object
        if (!assetData.assetIdentification.attachments) {
            assetData.assetIdentification.attachments = {};
        }

        if (!assetData.ownershipDetails.attachments) {
            assetData.ownershipDetails.attachments = {};
        }

        if (!assetData.assetAcquisition.attachments) {
            assetData.assetAcquisition.attachments = {};
        }

        if (!assetData.maintenanceRepair.attachments) {
            assetData.maintenanceRepair.attachments = {};
        }

        //const assetImages = await uploadImagesToCloudinary(req.files);

        const assetImagesForCloudinary = [];
        const documentImagesForCloudinary = [];
        const uploadOwnershipReceiptImagesForCloudinary = [];
        const uploadLegalDocumentImagesForCloudinary = [];
        const uploadInvoiceImagesForCloudinary = [];
        const maintenanceRepairUploadInvoiceImagesForCloudinary = [];

        // Separate images for assetImages and uploadDocuments based on field names
        req.files.forEach(file => {
            if (file.fieldname.startsWith('assetIdentification[attachments][uploadAssetImages]')) {
                assetImagesForCloudinary.push(file);
            } else if (file.fieldname.startsWith('assetIdentification[attachments][uploadDocuments]')) {
                documentImagesForCloudinary.push(file);
            } else if (file.fieldname.startsWith('ownershipDetails[attachments][uploadOwnershipReceipt]')) {
                uploadOwnershipReceiptImagesForCloudinary.push((file));
            } else if (file.fieldname.startsWith('ownershipDetails[attachments][uploadLegalDocument]')) {
                uploadLegalDocumentImagesForCloudinary.push(file);
            } else if (file.fieldname.startsWith('assetAcquisition[attachments][uploadInvoice]')) {
                uploadInvoiceImagesForCloudinary.push(file);
            } else if (file.fieldname.startsWith('maintenanceRepair[attachments][uploadInvoice]')) {
                maintenanceRepairUploadInvoiceImagesForCloudinary.push(file);
            }
        });

        const assetUrls = await uploadImagesToCloudinary(assetImagesForCloudinary);
        const documentUrls = await uploadImagesToCloudinary(documentImagesForCloudinary);
        const ownershipReceiptUrls = await uploadImagesToCloudinary(uploadOwnershipReceiptImagesForCloudinary);
        const uploadLegalDocumentUrls = await uploadImagesToCloudinary(uploadLegalDocumentImagesForCloudinary);
        const uploadInvoiceUrls = await uploadImagesToCloudinary(uploadInvoiceImagesForCloudinary);
        const maintenanceRepairUploadInvoiceUrls = await uploadImagesToCloudinary(maintenanceRepairUploadInvoiceImagesForCloudinary);

        assetData.assetIdentification.attachments.uploadAssetImages = assetUrls;
        assetData.assetIdentification.attachments.uploadDocuments = documentUrls;
        assetData.ownershipDetails.attachments.uploadOwnershipReceipts = ownershipReceiptUrls;
        assetData.ownershipDetails.attachments.uploadLegalDocuments = uploadLegalDocumentUrls;
        assetData.assetAcquisition.attachments.uploadInvoiceDocuments = uploadInvoiceUrls;
        assetData.maintenanceRepair.attachments.maintenanceRepairUploadInvoice = maintenanceRepairUploadInvoiceUrls;

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
