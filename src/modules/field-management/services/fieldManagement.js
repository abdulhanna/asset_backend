import {fieldManagementModel, assetFormManagementModel, assetFormStepModel} from '../models';
import mongoose from 'mongoose';
import {errors} from 'puppeteer';


const checkExistingGroups = async (groupNames) => {
    try {
        const existingGroups = await fieldManagementModel.find({groupName: {$in: groupNames}});
        return existingGroups;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
const createMultipleFieldGroups = async (groupDetails, organizationId) => {
    const newFieldGroups = await Promise.all(
        groupDetails.map(async (group) => {
            let createdGroup;

            // If organizationId is provided, create group only in assetFormManagementModel
            if (organizationId) {
                const assetFormManagement = await assetFormManagementModel.findOne({organizationId});
                console.log(assetFormManagement);

                if (assetFormManagement) {
                    const newGroup = {
                        organizationId,
                        _id: mongoose.Types.ObjectId(),
                        groupName: group.groupName,
                        isMandatory: group.isMandatory,
                    };

                    assetFormManagement.assetFormManagements.push(newGroup);
                    await assetFormManagement.save();

                } else {
                    console.error('AssetFormManagement document not found');
                }
            } else {
                // If organizationId is null, create group in both models
                createdGroup = await fieldManagementModel.create({
                    groupName: group.groupName,
                    isMandatory: group.isMandatory,
                });

                const newGroupForAsset = {
                    _id: createdGroup._id,
                    groupName: createdGroup.groupName,
                    isMandatory: createdGroup.isMandatory,
                    fields: [], // You may need to adjust this based on your schema
                };

                // Find all organizations and push the new group
                const organizations = await assetFormManagementModel.find();
                organizations.forEach(async (org) => {
                    org.assetFormManagements.push(newGroupForAsset);
                    await org.save();
                });
            }

            return createdGroup;
        })
    );

    return newFieldGroups;
};


const updateSubgroups = async (groupId, newSubgroups, organizationId) => {
    try {
        // Step 2: Check if organizationId is provided
        if (organizationId) {
            // Step 3: Update subgroups in assetFormManagementModel for the specific organization
            const organization = await assetFormManagementModel.findOne({organizationId});
            if (organization) {
                organization.assetFormManagements.forEach(group => {
                    if (group._id.toString() === groupId) {
                        group.subgroups.push(...newSubgroups);
                    }
                });
                await organization.save();
            }
        } else {
            // Step 1: Update subgroups in fieldManagementModel
            const updatedGroup = await fieldManagementModel.findByIdAndUpdate(
                groupId,
                {$push: {subgroups: {$each: newSubgroups}}},
                {new: true}
            );

            // Step 4: Update subgroups in assetFormManagementModel for all organizations
            await assetFormManagementModel.updateMany(
                {},
                {$push: {'assetFormManagements.$[elem].subgroups': {$each: newSubgroups}}},
                {arrayFilters: [{'elem._id': groupId}]}
            );

            return updatedGroup;
        }
    } catch (error) {
        throw new Error(`Unable to update subgroups: ${error.message}`);
    }
};


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

        // Retrieve only the last pushed field from updatedGroup
        let pushedFields;
        pushedFields = updatedGroup.fields[updatedGroup.fields.length - 1];
        const lastUpdatedSubgroup = updatedGroup.subgroups.find(subgroup => subgroup._id.toString() === id);

        if (lastUpdatedSubgroup) {
            const fields = lastUpdatedSubgroup.fields;
            pushedFields = fields[fields.length - 1];
        }


        // Step 2: Update assetFormManagementModel
        const assetFormManagement = await assetFormManagementModel.find();

        if (!assetFormManagement || assetFormManagement.length === 0) {
            console.error('AssetFormManagement document not found');

        }

        assetFormManagement.map(async (doc) => {

            const group = doc.assetFormManagements.find(g => g._id.toString() === id);

            let subgroup;
            if (!group) {
                subgroup = doc.assetFormManagements.flatMap(g => g.subgroups).find(s => s._id.toString() === id);
            }

            if (group) {
                await assetFormManagementModel.updateOne(
                    {_id: doc._id, 'assetFormManagements._id': mongoose.Types.ObjectId(id)},
                    {$push: {'assetFormManagements.$.fields': {$each: [pushedFields]}}}
                );

            } else if (subgroup) {
                subgroup.fields.push(pushedFields);

                await assetFormManagementModel.updateOne(
                    {_id: doc._id},
                    doc,
                    {new: true}
                );

            } else {
                console.error('Group or subgroup not found');
            }
        });

        return {'msg': 'field updated successfully'};
    } catch (error) {
        throw error;
    }
};

const getFieldGroupsByOrganizationIdNull = async (organizationId) => {
    try {

        let fieldGroups;
        if (organizationId) {

            fieldGroups = await assetFormManagementModel.findOne(
                {organizationId: organizationId},
                {assetFormManagements: 1, _id: 0}
            );

        } else {
            fieldGroups = await fieldManagementModel.find().lean().populate({
                path: 'assetFormStepId',
                select: 'stepNo stepName'
            });

            // Remove fields with isDeleted: true from each subgroup
            fieldGroups.forEach(group => {
                group.subgroups.forEach(subgroup => {
                    subgroup.fields = subgroup.fields.filter(field => !field.isDeleted && (field.organizationId == null));
                });

                // Remove fields with isDeleted: true from the top-level fields array
                group.fields = group.fields.filter(field => !field.isDeleted && (field.organizationId == null));
            });
        }

        return fieldGroups;
    } catch (error) {
        throw new Error('Unable to get field groups');
    }
};

const getFieldGroupsForFormStep = async (organizationId, stepNo) => {
    try {
        let fieldGroups;

        if (organizationId) {
            const assetFormManagements = await assetFormManagementModel.findOne(
                {organizationId: organizationId},
                {assetFormManagements: 1, _id: 0}
            );

            if (assetFormManagements && assetFormManagements.assetFormManagements) {
                const assetFormStepIds = assetFormManagements.assetFormManagements.map(management => management.assetFormStepId).filter(Boolean);

                const assetFormStepDetails = await assetFormStepModel.find({
                    _id: {$in: assetFormStepIds}
                });

                fieldGroups = assetFormManagements.assetFormManagements.map(management => {
                    const assetFormStepDetail = assetFormStepDetails.find(detail => detail._id && management.assetFormStepId && detail._id.toString() === management.assetFormStepId.toString());
                    return {
                        ...management,
                        assetFormStepId: assetFormStepDetail || null
                    };
                }).filter(group => {
                    if (group.assetFormStepId) {
                        return group.assetFormStepId.stepNo === stepNo;
                    }
                    return false;
                });
                
            } else {
                fieldGroups = [];
            }
        } else {
            fieldGroups = await fieldManagementModel.find().lean().populate({
                path: 'assetFormStepId',
                match: {stepNo: stepNo}, // Filter based on stepNo
                select: 'stepNo stepName'
            });

            // Remove fields with isDeleted: true from each subgroup
            fieldGroups.forEach(group => {
                group.subgroups.forEach(subgroup => {
                    subgroup.fields = subgroup.fields.filter(field => !field.isDeleted && (field.organizationId == null));
                });

                // Remove fields with isDeleted: true from the top-level fields array
                group.fields = group.fields.filter(field => !field.isDeleted && (field.organizationId == null));
            });

            // Filter out groups where assetFormStepId is null
            fieldGroups = fieldGroups.filter(group => group.assetFormStepId !== null);
        }

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

const checkIfGroupIsMandatory = async (groupId, organizationId) => {
    if (organizationId !== null) {
        const groupInAssetForm = await assetFormManagementModel.findOne({
            organizationId
        });

        if (groupInAssetForm) {
            const matchingGroup = groupInAssetForm.assetFormManagements.find(group => group._id.toString() === groupId);

            if (matchingGroup && matchingGroup.isMandatory) {
                return true; // The group is mandatory
            }
        }
    }

    return false; // The group is not mandatory or organizationId is null
};


const removeGroupFromAssetFormManagement = async (groupId, organizationId) => {
    try {
        if (organizationId !== null) {
            const groupInAssetFormManagement = await assetFormManagementModel.findOne({
                organizationId
            });

            if (groupInAssetFormManagement) {
                const matchingGroup = groupInAssetFormManagement.assetFormManagements.find(group => {
                    // console.log('groupId:', groupId);
                    // console.log('group._id.toString():', group._id.toString());
                    return group._id.toString() === groupId;
                });

                if (matchingGroup) {
                    await assetFormManagementModel.findOneAndUpdate(
                        {organizationId},
                        {$pull: {assetFormManagements: matchingGroup}}
                    );

                    console.log('Group removed successfully');

                    return {success: true, message: 'Group removed successfully'};
                } else {
                    return {success: false, message: 'Matching group not found'};
                }
            }
        }

        return {success: false, message: 'Organization ID is null'};
    } catch (error) {
        throw error;
    }
};


const deleteGroupAndFieldsById = async (groupId) => {
    try {
        const group = await fieldManagementModel.findById(groupId);
        if (!group) {
            return false;
        }

        // Delete the group and all associated fields
        await fieldManagementModel.deleteOne({_id: groupId});

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

const deleteSubGroupById = async (subgroupId) => {
    try {
        const deleteSubGroup = await fieldManagementModel.updateOne(
            {'subgroups._id': subgroupId},
            {$pull: {subgroups: {_id: subgroupId}}}
        );
        return deleteSubGroup;
    } catch (error) {
        throw error;
    }
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
    addFieldAndUpdateAssetForm,
    checkExistingGroups,
    getFieldGroupsForFormStep,
    deleteSubGroupById,
    checkIfGroupIsMandatory,
    removeGroupFromAssetFormManagement
};


