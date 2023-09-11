import assetFormManagementModel from '../models/assetFormManagement';
import fieldManagementModel from '../models/fieldManagement';
import mongoose from 'mongoose';


const pushFieldsToAssetForm = async (organizationId) => {
    try {
        // Fetch fields from fieldManagementModel
        const fields = await fieldManagementModel.find();

        // Update assetFormManagementModel with the fieldList
        const result = await assetFormManagementModel.updateOne(
            {organizationId},
            {
                $push: {
                    assetFormManagements: {
                        $each: fields
                    }
                }
            },
            {upsert: true} // This option creates a new document if none exists
        );

        return result;
    } catch (error) {
        console.error('Error:', error);
    }
};

const getAssetFormManagementList = async (organizationId) => {
    try {
        const data = await assetFormManagementModel.find({organizationId: organizationId});
        return data;

    } catch (error) {
        throw new Error('Error in getting asset form list');
    }
    return await assetFormManagementModel.find();
};


const modifyFieldsInAssetForm = async (organizationId, groupOrSubgroupId, fieldId, action, updatedField) => {
    try {
        // Find the assetFormManagement document for the specified organizationId
        let assetFormManagement = await assetFormManagementModel.findOne({organizationId});

        if (!assetFormManagement) {
            throw new Error('AssetFormManagement document not found');
        }

        // Find the field in either group or subgroup
        const findField = (field) => field._id.toString() == fieldId;

        let group, subgroup;

        for (const g of assetFormManagement.assetFormManagements) {
            if (g._id.toString() === groupOrSubgroupId) {
                group = g;
                break;
            }

            for (const s of g.subgroups) {
                if (s._id.toString() === groupOrSubgroupId) {
                    subgroup = s;
                    group = g;
                    break;
                }
            }

            if (group && subgroup) {
                break;
            }
        }

        if (group && subgroup) {
            // Field found in subgroup
            const subgroupIndex = group.subgroups.indexOf(subgroup);


            // Add organizationId to updatedField
            updatedField._id = new mongoose.Types.ObjectId(); // Generate a new ObjectId
            updatedField.organizationId = organizationId;

            if (action === 'add') {
                subgroup.fields.push(updatedField);
            } else if (action === 'remove') {
                subgroup.fields = subgroup.fields.filter(field => field._id.toString() !== fieldId);
            }

            assetFormManagement.assetFormManagements[subgroupIndex] = group;
        } else if (group) {
            // Field found in group
            const groupIndex = assetFormManagement.assetFormManagements.indexOf(group);

            // Add organizationId to updatedField
            updatedField._id = new mongoose.Types.ObjectId(); // Generate a new ObjectId
            updatedField.organizationId = organizationId;

            if (action === 'add') {
                group.fields.push(updatedField);
            } else if (action === 'remove') {
                group.fields = group.fields.filter(field => field._id.toString() !== fieldId);
            }

            assetFormManagement.assetFormManagements[groupIndex] = group;
        }

        // Update assetFormManagementModel with the modified document
        const result = await assetFormManagement.save();

        return result;
    } catch (error) {
        console.error('Error:', error);
    }
};


export const assetFormManagementService = {
    pushFieldsToAssetForm,
    getAssetFormManagementList,
    modifyFieldsInAssetForm
};