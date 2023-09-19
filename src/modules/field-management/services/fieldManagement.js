import fieldManagementModel from '../models/fieldManagement';
import assetFormManagementModel from '../models/assetFormManagement';
import mongoose from 'mongoose';

const createMultipleFieldGroups = async (groupNames) => {
    const newFieldGroups = await Promise.all(
        groupNames.map(async (groupName) => {
            return await fieldManagementModel.create({
                groupName: groupName,
                // subgroups: [], // Initialize with an empty array of subgroups
            });
        })
    );
    return newFieldGroups;
};

const updateSubgroups = async (groupId, subgroups) => {
    return fieldManagementModel.findByIdAndUpdate(
        groupId,
        {subgroups: subgroups || []},
        {new: true}
    );
};

// const updateSubgroupFields = async (subgroupId, fields) => {
//     const updatedSubgroup = await fieldManagementModel.findOneAndUpdate(
//         {'subgroups._id': subgroupId},
//         {$push: {'subgroups.$.fields': {$each: fields}}},
//         {new: true}
//     );
//     return updatedSubgroup;
// };


// const updateGroupFields = async (groupId, fields) => {
//     return fieldManagementModel.findByIdAndUpdate(
//         groupId,
//         {$push: {fields: {$each: fields}}},
//         {new: true}
//     );
// };

const updateFields = async (id, fields) => {
    try {
        const group = await fieldManagementModel.findById(id);

        if (!group) {
            // If group not found, try updating subgroup
            const updatedSubgroup = await fieldManagementModel.findOneAndUpdate(
                {'subgroups._id': id},
                {
                    $push: {
                        'subgroups.$.fields': {
                            $each: fields.map(field => ({...field})),
                        },
                    },
                },
                {new: true}
            );
            return updatedSubgroup;
        }

        // Update group fields
        const updatedGroup = await fieldManagementModel.findByIdAndUpdate(
            id,
            {
                $push: {
                    fields: {
                        $each: fields.map(field => ({...field})),
                    },
                },
            },
            {new: true}
        );
        return updatedGroup;
    } catch (error) {
        throw error;
    }
};


const addFieldAndUpdateAssetForm = async (id, fields) => {
    try {
        // Step 1: Add fields to fieldManagementModel
        let updatedSubgroups = [];
        let updatedGroups = [];
        let updatedGroup;

        const group = await fieldManagementModel.findById(id);

        if (!group) {
            updatedGroup = await fieldManagementModel.findOneAndUpdate(
                {'subgroups._id': id},
                {
                    $push: {
                        'subgroups.$.fields': {
                            $each: fields.map(field => ({...field})),
                        },
                    },
                },
                {new: true}
            );
        } else {
            updatedGroup = await fieldManagementModel.findByIdAndUpdate(
                id,
                {
                    $push: {
                        fields: {
                            $each: fields.map(field => ({...field})),
                        },
                    },
                },
                {new: true}
            );
        }

        // Retrieve the pushed fields from updatedGroup
        const pushedFields = updatedGroup.fields;

        // Step 2: Update assetFormManagementModel
        const assetFormManagement = await assetFormManagementModel.find();

        if (!assetFormManagement || assetFormManagement.length === 0) {
            throw new Error('AssetFormManagement document not found');
        }

        const updatePromises = assetFormManagement.map(async (doc) => {
            for (const subgroup of doc.assetFormManagements.flatMap(g => g.subgroups)) {
                if (subgroup._id.toString() === id) {
                    for (const field of pushedFields) {
                        const newField = {
                            ...field.toObject(), // Convert Mongoose document to plain object
                            organizationId: null
                        };
                        subgroup.fields.push(newField);
                    }

                    try {
                        await doc.save();
                        updatedSubgroups.push(subgroup);
                        return;
                    } catch (error) {
                        console.error('Error saving document:', error);
                        throw error;
                    }
                }
            }

            const group = doc.assetFormManagements.find(g => g._id.toString() === id);

            if (group) {
                await assetFormManagementModel.updateOne(
                    {_id: doc._id, 'assetFormManagements._id': mongoose.Types.ObjectId(id)},
                    {$push: {'assetFormManagements.$.fields': {$each: pushedFields}}}
                );

                updatedGroups.push(group);
            } else {
                console.error('Group or subgroup not found');
            }
        });

        await Promise.all(updatePromises);

        return {
            updatedSubgroups,
            updatedGroups,
        };

    } catch (error) {
        throw error;
    }
};


const getFieldGroupsByOrganizationIdNull = async () => {
    try {
        const fieldGroups = await fieldManagementModel.find();

        // Remove fields with isDeleted: true from each subgroup
        fieldGroups.forEach(group => {
            group.subgroups.forEach(subgroup => {
                subgroup.fields = subgroup.fields.filter(field => !field.isDeleted && (field.organizationId == null));
            });

            // Remove fields with isDeleted: true from the top-level fields array
            group.fields = group.fields.filter(field => !field.isDeleted && (field.organizationId == null));
        });

        return fieldGroups;
    } catch (error) {
        throw new Error('Unable to get field groups');
    }
};
const getFieldGroupsByOrganizationId = async (organizationId) => {
    try {
        const fieldGroups = await fieldManagementModel.find().lean();

        // Remove fields with isDeleted: true from each subgroup
        fieldGroups.forEach(group => {
            group.subgroups.forEach(subgroup => {
                subgroup.fields = subgroup.fields.filter(field => !field.isDeleted);
            });

            group.fields = group.fields.filter(field => !field.isDeleted);
        });

        return fieldGroups.map(group => {
            const matchingOrganizationFields = group.fields.filter(field => field.organizationId == organizationId);
            const nullOrganizationFields = group.fields.filter(field => field.organizationId == null);
            console.log('matchingOrganizationFields', matchingOrganizationFields);

            return {
                ...group,
                fields: matchingOrganizationFields.concat(nullOrganizationFields),
                subgroups: group.subgroups.map(subgroup => {
                    const matchingOrganizationSubgroupFields = subgroup.fields.filter(field => field.organizationId == organizationId);
                    const nullOrganizationSubgroupFields = subgroup.fields.filter(field => field.organizationId === null);

                    return {
                        ...subgroup,
                        fields: matchingOrganizationSubgroupFields.concat(nullOrganizationSubgroupFields)
                    };
                })
            };
        });
    } catch (error) {
        console.log(error);
        throw new Error('Unable to get field groups');
    }
};


const getFieldGroupsById = async (groupId) => {
    try {
        const fieldGroup = await fieldManagementModel.findById(groupId);

        if (!fieldGroup) {
            throw new Error('Field group not found');
        }

        // Remove fields with isDeleted: true from the top-level fields array
        fieldGroup.fields = fieldGroup.fields.filter(field => !field.isDeleted);

        // Optionally, you can also remove fields with isDeleted: true from subgroups
        fieldGroup.subgroups.forEach(subgroup => {
            subgroup.fields = subgroup.fields.filter(field => !field.isDeleted);
        });

        return fieldGroup;
    } catch (error) {
        console.log(error);
        throw new Error('Unable to get field group by ID');
    }
};
const getFieldsBySubgroupId = async (subgroupId) => {

    try {
        const subgroup = await fieldManagementModel.findOne({'subgroups._id': subgroupId});

        if (!subgroup) {
            throw new Error('Subgroup not found');
        }

        const matchingSubgroup = subgroup.subgroups.find(sub => sub._id.toString() === subgroupId);

        if (!matchingSubgroup) {
            throw new Error('Unable to fetch subgroup fields');
        }
        return matchingSubgroup.fields;
    } catch (error) {
        throw error;
    }

};

const addFieldToGroupV2 = async (groupId, fields, groupName) => {
    const bulkOps = [];

    if (fields) {
        // Separate the operations: add, update, and delete
        const newFields = fields.filter((f) => !f._id); // Fields to be added
        const updatedFields = fields.filter((f) => f._id && !f.deleted); // Fields to be updated
        const deletedFieldIds = fields
            .filter((f) => f._id && f.deleted)
            .map((f) => f._id); // Fields to be deleted

        if (newFields.length > 0) {
            bulkOps.push({
                updateOne: {
                    filter: {_id: groupId},
                    update: {$push: {fields: {$each: newFields}}},
                },
            });
        }

        if (updatedFields.length > 0) {
            for (const field of updatedFields) {
                const fieldId = mongoose.Types.ObjectId(field._id);
                bulkOps.push({
                    updateOne: {
                        filter: {_id: groupId, 'fields._id': fieldId},
                        update: {
                            $set: {
                                'fields.$.name': field.name,
                                'fields.$.dataType': field.dataType,
                                'fields.$.fieldLength':
                                field.fieldLength,
                                'fields.$.listOptions':
                                field.listOptions,
                                'fields.$.errorTitle': field.errorTitle,
                                'fields.$.isMandatory':
                                field.isMandatory,
                            },
                        },
                    },
                });
            }
        }

        if (deletedFieldIds.length > 0) {
            bulkOps.push({
                updateOne: {
                    filter: {_id: groupId},
                    update: {
                        $pull: {
                            fields: {_id: {$in: deletedFieldIds}},
                        },
                    },
                },
            });
        }
    }

    // Check if groupName is provided and update the groupName field of fieldManagementSchema
    if (groupName) {
        bulkOps.push({
            updateOne: {
                filter: {_id: groupId},
                update: {$set: {groupName}},
            },
        });
    }

    if (bulkOps.length > 0) {
        return await fieldManagementModel.bulkWrite(bulkOps);
    }
};

const deleteFieldById = async (fieldId) => {
    const query = {};
    const update = {};

    query['fields._id'] = fieldId;
    update.$pull = {fields: {_id: fieldId}};

    const updatedGroup = await fieldManagementModel.findOneAndUpdate(
        query,
        update,
        {new: true}
    );

    if (!updatedGroup) {
        const updatedSubgroup = await fieldManagementModel.findOneAndUpdate(
            {'subgroups.fields._id': fieldId},
            {$pull: {'subgroups.$.fields': {_id: fieldId}}},
            {new: true}
        );


        if (!updatedSubgroup) {
            throw new Error('Field not found');
        }

        return updatedSubgroup;
    }

    return updatedGroup;
};
const deleteGroupAndFieldsById = async (groupId) => {
    try {
        const group = await fieldManagementModel.findById(groupId);
        if (!group) {
            return false;
        }

        // Collect all field IDs in the group
        const fieldIds = group.fields.map((field) => field._id);

        // Delete the group and all associated fields
        await Promise.all([
            fieldManagementModel.deleteMany({_id: {$in: fieldIds}}),
            fieldManagementModel.deleteOne({_id: groupId}),
        ]);

        return true;
    } catch (error) {
        throw error;
    }
};

const editFieldById = async (fieldId, updatedData) => {
    try {
        const document = await fieldManagementModel.findOne({
            $or: [
                {'subgroups.fields._id': fieldId},
                {'fields._id': fieldId}
            ]
        });

        if (!document) {
            console.error('Field not found');
            return {nModified: 0, updatedData: null};
        }

        let updatedFields = [];

        for (const subgroup of document.subgroups) {
            for (const field of subgroup.fields) {
                if (field._id.toString() === fieldId) {
                    Object.assign(field, updatedData);
                    updatedFields.push(field);
                }
            }
        }

        if (updatedFields.length === 0) {
            for (const field of document.fields) {
                if (field._id.toString() === fieldId) {
                    Object.assign(field, updatedData);
                    updatedFields.push(field);
                }
            }
        }

        await document.save();

        return {nModified: 1, updatedData: updatedFields};
    } catch (error) {
        console.error('Error while updating field:', error);
        throw error;
    }
};


const updateFieldData = async (groupId, updatedData) => {
    try {
        const result = await fieldManagementModel.updateOne(
            {_id: groupId},
            {$set: updatedData}
        );

        return result;
    } catch (error) {
        throw error;
    }
};


const markFieldAsDeleted = async (fieldId) => {
    const query = {'fields._id': fieldId};
    const update = {$set: {'fields.$.isDeleted': true}};

    const updatedGroup = await fieldManagementModel.findOneAndUpdate(
        query,
        update,
        {new: true}
    );

    if (!updatedGroup) {
        const updatedSubgroup = await fieldManagementModel.findOneAndUpdate(
            {'subgroups.fields._id': fieldId},
            //{$set: {'subgroups.$[subgroup].fields.$[field].isDeleted': true}},
            {$set: {'subgroups.$.fields.$.isDeleted': true}},
            {
                new: true,
                // arrayFilters: [
                //     {'subgroup.fields._id': fieldId},
                //     // {'field._id': fieldId}
                // ]
            }
        );

        if (!updatedSubgroup) {
            throw new Error('Field not found');
        }

        return updatedSubgroup;
    }

    return updatedGroup;
};

export const fieldManagementService = {
    createMultipleFieldGroups,
    getFieldGroupsById,
    getFieldGroupsByOrganizationIdNull,
    addFieldToGroupV2,
    deleteFieldById,
    deleteGroupAndFieldsById,
    updateSubgroups,
    updateFields,
    getFieldsBySubgroupId,
    editFieldById,
    updateFieldData,
    markFieldAsDeleted,
    getFieldGroupsByOrganizationId,
    addFieldAndUpdateAssetForm
};


