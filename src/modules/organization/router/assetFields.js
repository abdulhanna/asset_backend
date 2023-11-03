import express from 'express';
import {assetService} from '../services/assetFields';
import {isLoggedIn} from '../../auth/router/passport';
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';
import {secret} from '../../../config/secret.js';
import Excel from 'exceljs';
import assetFormManagementModel from '../../field-management/models/assetFormManagement';
import {validate} from '@babel/core/lib/config/validation/options';


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
const uploadTwo = multer({dest: 'public/exports/assets'});
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

function protectAndUnlockCells(worksheet) {
    worksheet.sheetProtection = {
        sheet: true,
        insertRows: false,
        formatCells: false,
    };

    // Iterate over each row up to 1000 rows
    for (let rowNumber = 2; rowNumber <= 10; rowNumber++) {
        const row = worksheet.getRow(rowNumber);

        // Iterate over each header cell
        row.eachCell((cell, colNumber) => {
            cell.protection = {
                locked: false
            };
        });
    }
}

const validateDateFormat = (dateString) => {
    // Parse the input date string
    const dateObject = new Date(dateString);

    // Check if the dateObject is valid
    if (isNaN(dateObject.getTime())) {
        return false;
    }

    // Convert the date to YYYY/MM/DD format
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');

    const formattedDate = `${year}/${month}/${day}`;

    // Regular expression to validate date format (YYYY/MM/DD)
    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;

    // Check if the formatted date matches the date format
    return dateRegex.test(formattedDate);
};


const validateAsset = (asset, mapping) => {
    const assetFieldName = mapping.assetFieldName;
    const groupName = mapping.groupName;
    const subgroupName = mapping.subgroupName;
    const fieldValue = asset[groupName][subgroupName][assetFieldName];

    if (mapping.fieldType === 'date') {
        const isValidDate = validateDateFormat(fieldValue);
        if (!isValidDate) {
            return mapping.errorMessage;
        }
    } else if (mapping.fieldType === 'string') {
        if (mapping.fieldLength && fieldValue && fieldValue.length > mapping.fieldLength) {
            return mapping.errorMessage;
        }
    } else if (mapping.fieldType === 'number') {
        if (isNaN(fieldValue)) {
            return mapping.errorMessage;
        }
    } else if (mapping.fieldType === 'list') {
        const validOptions = mapping.listOptions;
        if (fieldValue && !validOptions.includes(fieldValue)) {
            return mapping.errorMessage;
        }
    }

    return null; // Return null if there are no validation errors
};


router.post('/upload', isLoggedIn, uploadTwo.single('file'), async (req, res) => {
    try {
        const excelData = await parseExcel(req.file.path);

        const organizationId = req.user.data.organizationId;
        const assetFormManagement = await getAssetFormManagement(organizationId);
        const headersInModel = new Set();
        const headers = excelData[0]; // Assuming headers are in the first row
        const invalidHeaders = [];

        // Extract headers from assetFormManagement
        assetFormManagement.assetFormManagements.forEach(group => {
            group.subgroups.forEach(subgroup => {
                subgroup.fields.forEach(field => {
                    headersInModel.add(field.name);
                });
            });
        });

        // Check if all headers in uploaded file exist in the model
        for (const header of headers) {
            if (!headersInModel.has(header)) {
                invalidHeaders.push(header);
            }
        }

        if (invalidHeaders.length > 0) {
            return res.status(400).json({
                message: 'Invalid headers detected',
                error: `Headers '${invalidHeaders.join(', ')}' not allowed.`
            });
        }

        const fieldsMapping = assetFormManagement.assetFormManagements.flatMap(group =>
            group.subgroups.flatMap(subgroup =>
                subgroup.fields.map(field => ({
                    assetFieldName: field.name,
                    groupName: group.groupName, // Add groupName
                    subgroupName: subgroup.subgroupName,
                    fieldType: field.dataType,
                    fieldLength: field.fieldLength,
                    errorMessage: field.errorMessage,
                    listOptions: field.listOptions
                }))
            )
        );

        const assets = [];
        const validationErrors = [];

        const workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const mainSheet = workbook.getWorksheet(1);

        for (let i = 1; i < excelData.length; i++) {
            const newAsset = {};

            for (const mapping of fieldsMapping) {
                const assetFieldName = mapping.assetFieldName;
                const groupName = mapping.groupName;
                const subgroupName = mapping.subgroupName;

                const fieldValue = excelData[i][headers.indexOf(assetFieldName)];


                if (assetFieldName) {
                    if (!newAsset[groupName]) {
                        newAsset[groupName] = {};
                    }
                    if (!newAsset[groupName][subgroupName]) {
                        newAsset[groupName][subgroupName] = {};
                    }
                    newAsset[groupName][subgroupName][assetFieldName] = fieldValue;
                }

                const validationError = validateAsset(newAsset, mapping);

                if (validationError) {

                    validationErrors.push(validationError);

                    // Set cell color to red if validation fails
                    const cellAddress = `${String.fromCharCode(headers.indexOf(assetFieldName) + 65)}${i + 1}`;

                    const cellError = mainSheet.getCell(cellAddress);

                    cellError.note = {
                        texts: [{
                            'font': {
                                'bold': true,
                                'size': 12,
                                'color': {'theme': 1},
                                'name': 'Calibri',
                                'family': 2,
                                'scheme': 'minor'
                            }, 'text': `${validationError ? validationError : validationError}`
                        }],
                        style: {
                            fill: {
                                fgColor: {argb: 'FFFF0000'},
                            },
                        },
                        margins: {

                            inset: [0.25, 0.25, 0.35, 0.35]
                        }

                    };
                }

            }

            assets.push(newAsset);
        }


        if (validationErrors.length > 0) {
            await workbook.xlsx.writeFile('output.xlsx'); // Save as a new file
            return res.status(400).json({message: 'Validation errors', errors: validationErrors});
        }
        await assetService.saveAssetsToDatabase(organizationId, assets);

        // Protect and unlock cells after all processing
        protectAndUnlockCells(mainSheet);

        await workbook.xlsx.writeFile(req.file.path);

        return res.json({message: 'Upload successful'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Error uploading data', error: error.message});
    }
});

router.post('/upload-test', isLoggedIn, uploadTwo.single('file'), async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;
        const workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(req.file.path);

        const stepSheets = ['Step_1', 'Step_2', 'Step_3'];
        let mergedAssets = []; // Initialize an array to store merged assets
        const validationErrors = [];

        const assetFormManagement = await getAssetFormManagement(organizationId);
        const fieldsMapping = assetFormManagement.assetFormManagements.flatMap(group => {
            if (group.subgroups && group.subgroups.length > 0) {
                return group.subgroups.flatMap(subgroup =>
                    subgroup.fields.map(field => ({
                        assetFieldName: field.name,
                        groupName: group.groupName,
                        subgroupName: subgroup.subgroupName,
                        fieldType: field.dataType,
                        fieldLength: field.fieldLength,
                        errorMessage: field.errorMessage,
                        listOptions: field.listOptions
                    }))
                );
            } else {
                return [];
            }
        });

        for (const sheetName of stepSheets) {
            const sheet = workbook.getWorksheet(sheetName);

            if (!sheet) {
                return res.status(400).json({
                    message: 'Invalid sheet name',
                    error: `Sheet with name '${sheetName}' not found.`
                });
            }

            const headers = sheet.getRow(1).values.filter(header => header !== undefined); // Filter out empty or undefined headers

            if (!headers || headers.length === 0) {
                return res.status(400).json({
                    message: 'Invalid sheet format',
                    error: 'Headers not found in the sheet.'
                });
            }

            let rowIndex = 2; // Start from the second row

            while (sheet.getRow(rowIndex).values.length > 0) {
                const row = sheet.getRow(rowIndex);
                let rowAsset = {};

                for (const mapping of fieldsMapping) {
                    const assetFieldName = mapping.assetFieldName;
                    const groupName = mapping.groupName;
                    const subgroupName = mapping.subgroupName;

                    const colIndex = headers.indexOf(assetFieldName) + 1; // Corrected index

                    if (colIndex <= 0) {
                        continue; // Skip if column index is invalid
                    }

                    const cell = row.getCell(colIndex);
                    if (!cell) {
                        continue; // Skip if cell doesn't exist
                    }

                    const fieldValue = cell.value;

                    if (!rowAsset[groupName]) {
                        rowAsset[groupName] = {};
                    }
                    if (!rowAsset[groupName][subgroupName]) {
                        rowAsset[groupName][subgroupName] = {};
                    }

                    rowAsset[groupName][subgroupName][assetFieldName] = fieldValue;

                    const validationError = validateAsset(rowAsset, mapping);

                    if (validationError) {
                        validationErrors.push(validationError);

                        const cellAddress = `${String.fromCharCode(colIndex + 64)}${rowIndex}`;
                        const cellError = sheet.getCell(cellAddress);

                        cellError.note = {
                            texts: [{
                                'font': {
                                    'bold': true,
                                    'size': 12,
                                    'color': {'theme': 1},
                                    'name': 'Calibri',
                                    'family': 2,
                                    'scheme': 'minor'
                                }, 'text': `${validationError ? validationError : validationError}`
                            }],
                            style: {
                                fill: {
                                    fgColor: {argb: 'FFFF0000'},
                                },
                            },
                            margins: {
                                inset: [0.25, 0.25, 0.35, 0.35]
                            }
                        };
                    }
                }

                mergedAssets[rowIndex - 2] = {...mergedAssets[rowIndex - 2], ...rowAsset}; // Merge the row data into the merged assets
                rowIndex++;
            }

            protectAndUnlockCells(sheet);
        }

        if (validationErrors.length === 0) {
            // No validation errors, save merged assets to the database
            await assetService.saveAssetsToDatabase(organizationId, mergedAssets);
        }

        await workbook.xlsx.writeFile(req.file.path);

        return res.json({message: 'Upload successful'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Error uploading data', error: error.message});
    }
});


export default router;
