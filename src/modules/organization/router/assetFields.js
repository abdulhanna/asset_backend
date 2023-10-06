import express from 'express';
import {assetService} from '../services/assetFields';
import {isLoggedIn} from '../../auth/router/passport';
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';
import {secret} from '../../../config/secret.js';
import Excel from 'exceljs';
import assetFormManagementModel from '../../field-management/models/assetFormManagement';


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


//------------------------------
const uploadTwo = multer({dest: 'uploads/'});
const parseExcel = (filePath) => {
    const workbook = new Excel.Workbook();
    return workbook.xlsx.readFile(filePath).then(() => {
        const worksheet = workbook.getWorksheet(1);
        const data = [];

        worksheet.eachRow((row) => {
            const rowData = [];
            row.eachCell({includeEmpty: true}, (cell) => {
                rowData.push(cell.value);
            });
            data.push(rowData);
        });

        return data;
    });
};


const getAssetFormManagement = async (organizationId) => {
    try {
        const assetFormManagement = await assetFormManagementModel.findOne({organizationId});
        return assetFormManagement;
    } catch (error) {
        throw new Error('Error retrieving assetFormManagement');
    }
};


router.post('/upload', isLoggedIn, uploadTwo.single('file'), async (req, res) => {
    try {
        const excelData = await parseExcel(req.file.path);
        const organizationId = req.user.data.organizationId;
        const assetFormManagement = await getAssetFormManagement(organizationId);

        const headers = excelData[0]; // Assuming headers are in the first row

        const fieldsMapping = assetFormManagement.assetFormManagements.flatMap(group =>
            group.subgroups.flatMap(subgroup =>
                subgroup.fields.map(field => ({
                    excelHeader: field.name,  // Assuming field.name is the field name in your assetFormManagementModel
                    assetFieldName: field.name
                }))
            )
        );

        const assets = [];

        for (let i = 1; i < excelData.length; i++) {
            const asset = {
                assetIdentification: {},
                ownershipDetails: {},
            };

            for (const mapping of fieldsMapping) {
                const excelHeader = mapping.excelHeader;
                const assetFieldName = mapping.assetFieldName;
                const fieldValue = excelData[i][headers.indexOf(excelHeader)];

                if (assetFieldName) {
                    const [groupName, subgroupName, fieldName] = assetFieldName.split('.');
                    if (!asset.assetIdentification[groupName]) {
                        asset.assetIdentification[groupName] = {};
                    }
                    if (!asset.assetIdentification[groupName][subgroupName]) {
                        asset.assetIdentification[groupName][subgroupName] = {};
                    }
                    asset.assetIdentification[groupName][subgroupName][fieldName] = fieldValue;
                }
            }

            assets.push(asset);
        }

        await assetService.saveAssetsToDatabase(organizationId, assets);

        return res.json({message: 'Upload successful'});
    } catch (error) {
        return res.status(500).json({message: 'Error uploading data', error: error.message});
    }
});


export default router;
