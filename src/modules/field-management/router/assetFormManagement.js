import express from 'express';
import {assetFormManagementService} from '../services/assetFormManagement.js';
import {isLoggedIn} from '../../auth/router/passport.js';
import {assetFormManagementModel} from '../models';

import path from 'path';
import {promises as fs} from 'fs';
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

router.get('/export-excel/:organizationId', async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const assetFormManagement = await assetFormManagementModel.findOne({organizationId});

        if (!assetFormManagement) {
            return res.status(404).send('No assetFormManagement found for the provided organizationId.');
        }

        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        assetFormManagement.assetFormManagements.forEach((group) => {
            group.fields.forEach((field) => {
                if (field.name) {
                    if (worksheet && worksheet.columns) {
                        worksheet.columns.push({header: field.name, key: field.name, width: 25});
                    }
                }
            });

            group.subgroups.forEach((subgroup) => {
                if (subgroup.fields && subgroup.fields.length > 0) {
                    subgroup.fields.forEach((field) => {
                        if (field.name) {
                            if (worksheet && worksheet.columns) {
                                worksheet.columns.push({header: field.name, key: field.name, width: 25});
                            }
                        }
                    });
                }
            });
        });

        const exportsDir = path.join(__dirname, 'exports');

        try {
            await fs.access(exportsDir);
        } catch (error) {
            await fs.mkdir(exportsDir);
        }

        const filePath = path.join(exportsDir, `export_${organizationId}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=export_${organizationId}.xlsx`);

        const fileContent = await fs.readFile(filePath);
        res.send(fileContent);

        console.log('Excel file sent successfully');
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).send('Internal Server Error');
    }
});


export default router;