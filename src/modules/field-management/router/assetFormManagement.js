import express from 'express';
import {assetFormManagementService} from '../services/assetFormManagement.js';
import {isLoggedIn} from '../../auth/router/passport.js';
import {assetFormManagementModel} from '../models';
import path from 'path';
import fs from 'fs';
import Excel from 'exceljs';


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

router.post('/sync-fields', isLoggedIn, async (req, res) => {
    try {
        const updatedFields = await assetFormManagementService.syncFields();
        res.status(200).json({message: 'Fields synced with organizations.', updatedFields});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({message: 'Internal Server Error'});
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

router.put('/update-fields-assetform', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId; // Assuming you have user authentication middleware
        const {groupOrSubgroupId, fields} = req.body;

        const updatedFields = await assetFormManagementService.updateFieldsToAssetForm(organizationId, groupOrSubgroupId, fields);

        res.json(updatedFields);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error updating fields');
    }
});


router.get('/fields/:groupOrSubgroupId', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId; // Assuming you have user authentication middleware
        const {groupOrSubgroupId} = req.params;

        const fields = await assetFormManagementService.getFields(organizationId, groupOrSubgroupId);

        res.json(fields);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error fetching fields');
    }
});

// Route to get non-mandatory fields by groupOrSubgroupId
router.get('/non-mandatory-fields/:groupOrSubgroupId', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;
        const {groupOrSubgroupId} = req.params;

        const nonMandatoryFields = await assetFormManagementService.getNonMandatoryFields(organizationId, groupOrSubgroupId);

        res.json(nonMandatoryFields);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error fetching non-mandatory fields');
    }
});


//Set asset form management - .xlsx

const getDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Note: months are zero-indexed
    const day = date.getDate();
    return [year, month, day];
};

const applyFieldValidation = (worksheet, field, startRow, endRow, headers) => {
    if (field.dataType === 'list') {
        const joinedDropdownList = field.listOptions.join(',');

        for (let i = startRow; i <= endRow; i++) {
            const cellAddress = String.fromCharCode(headers.length + 65) + i;
            worksheet.getCell(cellAddress).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`"${joinedDropdownList}"`]
            };
        }
    } else if (field.dataType === 'date') {
        const currDate = getDate();
        const formulae = [`${currDate[0]}/${currDate[1]}/${currDate[2] + 1}`];

        for (let i = startRow; i <= endRow; i++) {
            const cellAddress = String.fromCharCode(headers.length + 65) + i;
            worksheet.getCell(cellAddress).dataValidation = {
                type: 'date',
                allowBlank: true,
                operator: 'lessThanOrEqual',
                formulae,
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Date',
                error: `Please enter a date less than or equal to ${currDate[0]}/${currDate[1]}/${currDate[2] + 1}`,
            };
        }
    }
};

router.get('/export-excel', isLoggedIn, async (req, res) => {
    try {
        const organizationId = req.user.data.organizationId;
        const assetFormManagement = await assetFormManagementModel.findOne({organizationId});

        if (!assetFormManagement) {
            return res.status(404).send('No assetFormManagement found for the provided organizationId.');
        }

        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        const headers = [];
        let rowNumber = 1;
        const startRow = 1;
        const endRow = 1000;

        assetFormManagement.assetFormManagements.forEach((group) => {
            if (group.subgroups && group.subgroups.length > 0) {
                group.subgroups.forEach((subgroup) => {
                    if (subgroup.fields && subgroup.fields.length > 0) {
                        subgroup.fields.forEach((field) => {
                            if (field.name) {
                                const headerInfo = {
                                    header: field.name,
                                    key: field.name,
                                    width: 30,
                                };

                                applyFieldValidation(worksheet, field, startRow, endRow, headers);

                                rowNumber++;
                                headers.push(headerInfo);
                            }
                        });
                    }
                });
            }
        });

        worksheet.columns = headers;

        const headersRow = worksheet.getRow(1);

        for (let rowNumber = 2; rowNumber <= 1000; rowNumber++) {
            const row = worksheet.getRow(rowNumber);

            headersRow.eachCell((headerCell, colNumber) => {
                const cell = row.getCell(colNumber);
                cell.protection = {
                    locked: false
                };
            });
        }

        worksheet.protect('123');
        worksheet.sheetProtection.sheet = true;
        worksheet.sheetProtection.insertRows = false;
        worksheet.sheetProtection.formatCells = false;

        headersRow.eachCell((cell) => {
            cell.font = {
                color: {argb: 'FF000000'},
                bold: true,
            };
        });

        const exportsDir = path.join(__dirname, 'exports');

        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, {recursive: true});
        }

        const filePath = path.join(exportsDir, `export_${organizationId}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=export_${organizationId}.xlsx`);

        const fileStream = fs.createReadStream(filePath);

        fileStream.pipe(res);

        return res.status(200).json({
            success: true,
            message: 'Excel file generated successfully'
        });
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).send('Internal Server Error');
    }
});


export default router;

