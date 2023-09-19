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

const syncFields = async () => {
    try {
        // Fetch fields from fieldManagementModel
        const fields = await fieldManagementModel.find();

        // Fetch existing assetFormManagement
        const assetFormManagement = await assetFormManagementModel.findOne();

        // Identify the fields that were added at the root level
        const addedRootFields = fields.filter(rootField => {
            return !assetFormManagement.assetFormManagements.some(field => field.organizationId && field._id.equals(rootField._id));
        });

        // Identify the fields that were added at the organization level
        const orgSpecificFields = assetFormManagement.assetFormManagements.filter(field => field.organizationId);

        // Combine rootFields with organization-specific fields inside groups
        const updatedFields = [...addedRootFields, ...orgSpecificFields];

        // Update all organization documents with the updated fieldList
        await assetFormManagementModel.updateOne(
            {},
            {
                $set: {
                    'assetFormManagements': updatedFields
                }
            },
            {upsert: true}
        );

        // Return the updated fields
        return updatedFields;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error syncing fields with organizations.');
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

        /*
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
         */

        const group = assetFormManagement.assetFormManagements.find(g => g._id.toString() === groupOrSubgroupId);

        let subgroup;
        if (!group) {
            subgroup = assetFormManagement.assetFormManagements.flatMap(g => g.subgroups).find(s => s._id.toString() === groupOrSubgroupId);
        }

        if (subgroup) {
            updatedField = {
                ...updatedField,
                _id: new mongoose.Types.ObjectId(),
                organizationId: organizationId
            };
            subgroup.fields.push(updatedField);
        } else if (group) {
            updatedField = {
                ...updatedField,
                _id: new mongoose.Types.ObjectId(),
                organizationId: organizationId
            };
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

const updateFieldsToAssetForm = async (organizationId, groupOrSubgroupId, fields) => {
    try {
        const assetFormManagement = await assetFormManagementModel.findOne({organizationId});

        if (!assetFormManagement) {
            throw new Error('AssetFormManagement document not found');
        }

        const group = assetFormManagement.assetFormManagements.find(g => g._id.toString() === groupOrSubgroupId);
        let subgroup;

        if (!group) {
            subgroup = assetFormManagement.assetFormManagements.flatMap(g => g.subgroups).find(s => s._id.toString() === groupOrSubgroupId);
        }

        if (group) {
            group.fields = fields.map(field => ({...field, organizationId, _id: new mongoose.Types.ObjectId()}));
        } else if (subgroup) {
            subgroup.fields = fields.map(field => ({...field, organizationId, _id: new mongoose.Types.ObjectId()}));
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
        throw error;
    }
};

const getFields = async (organizationId, groupOrSubgroupId) => {
    try {
        const assetFormManagement = await assetFormManagementModel.findOne({organizationId});

        if (!assetFormManagement) {
            throw new Error('AssetFormManagement document not found');
        }

        const group = assetFormManagement.assetFormManagements.find(g => g._id.toString() === groupOrSubgroupId);
        let subgroup;

        if (!group) {
            subgroup = assetFormManagement.assetFormManagements.flatMap(g => g.subgroups).find(s => s._id.toString() === groupOrSubgroupId);
        }

        if (group) {
            return {
                groupName: group.groupName,
                _id: group._id,
                fields: group.fields
            };
        } else if (subgroup) {
            return {
                subgroupName: subgroup.subgroupName,
                _id: subgroup._id,
                fields: subgroup.fields
            };
        } else {
            throw new Error('Group or subgroup not found');
        }
    } catch (error) {
        throw error;
    }
};

const getNonMandatoryFields = async (organizationId, groupOrSubgroupId) => {
    try {
        const assetFormManagement = await assetFormManagementModel.findOne({organizationId});

        if (!assetFormManagement) {
            throw new Error('AssetFormManagement document not found');
        }

        const group = assetFormManagement.assetFormManagements.find(g => g._id.toString() === groupOrSubgroupId);
        let subgroup;

        if (!group) {
            subgroup = assetFormManagement.assetFormManagements.flatMap(g => g.subgroups).find(s => s._id.toString() === groupOrSubgroupId);
        }

        if (group) {
            return {
                groupName: group.groupName,
                _id: group._id,
                fields: group.fields.filter(field => !field.isMandatory)
            };
        } else if (subgroup) {
            return {
                subgroupName: subgroup.subgroupName,
                _id: subgroup._id,
                fields: subgroup.fields.filter(field => !field.isMandatory)
            };
        } else {
            throw new Error('Group or subgroup not found');
        }
    } catch (error) {
        throw error;
    }
};


export const assetFormManagementService = {
    pushFieldsToAssetForm,
    getAssetFormManagementList,
    addFieldToAssetForm,
    updateFieldsToAssetForm,
    getFields,
    getNonMandatoryFields,
    syncFields

};