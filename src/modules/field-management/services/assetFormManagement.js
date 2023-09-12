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


const addFieldToAssetForm = async (organizationId, groupOrSubgroupId, updatedField) => {
    try {
        const assetFormManagement = await assetFormManagementModel.findOne({organizationId});

        if (!assetFormManagement) {
            throw new Error('AssetFormManagement document not found');
        }

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

        if (subgroup) {
            subgroup.fields.push(updatedField);
        } else if (group) {
            group.fields.push(updatedField);
        } else {
            throw new Error('Group or subgroup not found');
        }

        const result = await assetFormManagementModel.findOneAndUpdate(
            {organizationId},
            assetFormManagement,
            {new: true} // This option ensures that the updated document is returned
        );

        return result;
    } catch (error) {
        console.error('Error:', error);
    }
};


const removeFieldFromAssetForm = async (organizationId, groupOrSubgroupId, fieldId) => {
    try {
        let assetFormManagement = await assetFormManagementModel.findOne({organizationId});

        if (!assetFormManagement) {
            throw new Error('AssetFormManagement document not found');
        }

        const findField = (field) => field._id.toString() == groupOrSubgroupId;

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
            const subgroupIndex = group.subgroups.indexOf(subgroup);

            subgroup.fields = subgroup.fields.filter(field => field._id.toString() !== fieldId);

            assetFormManagement.assetFormManagements[subgroupIndex] = group;
        } else if (group) {
            const groupIndex = assetFormManagement.assetFormManagements.indexOf(group);

            group.fields = group.fields.filter(field => field._id.toString() !== fieldId);

            assetFormManagement.assetFormManagements[groupIndex] = group;
        }

        const result = await assetFormManagement.save();

        return result;
    } catch (error) {
        console.error('Error:', error);
    }
};


export const assetFormManagementService = {
    pushFieldsToAssetForm,
    getAssetFormManagementList,
    addFieldToAssetForm

};