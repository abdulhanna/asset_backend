import fieldManagementModel from '../models/fieldManagement';
import mongoose from 'mongoose';

const createMultipleFieldGroups = async (groupNames) => {
     const newFieldGroups = await Promise.all(
          groupNames.map(async (groupName) => {
               return await fieldManagementModel.create({
                    groupName: groupName,
                    subgroups: [], // Initialize with an empty array of subgroups
               });
          })
     );
     return newFieldGroups;
};

const updateSubgroups = async (groupId, subgroups) => {
     return await fieldManagementModel.findByIdAndUpdate(
          groupId,
          { subgroups: subgroups || [] },
          { new: true }
     );
};

const updateSubgroupFields = async (groupId, subgroupId, fields) => {
     const updatedSubgroup = await fieldManagementModel.findOneAndUpdate(
          { _id: groupId, 'subgroups._id': subgroupId },
          { $set: { 'subgroups.$.fields': fields } },
          { new: true }
     );
     return updatedSubgroup;
};

const getFieldGroups = async () => {
     try {
          const filedGroups = await fieldManagementModel.find();

          return filedGroups;
     } catch (error) {
          throw new Error('Unable to get field group');
     }
};

const getFieldGroupsById = async (groupId) => {
     try {
          const filedGroups = await fieldManagementModel.findById({
               _id: groupId,
          });

          return filedGroups;
     } catch (error) {
          throw new Error('Unable to get field group by Id');
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
                         filter: { _id: groupId },
                         update: { $push: { fields: { $each: newFields } } },
                    },
               });
          }

          if (updatedFields.length > 0) {
               for (const field of updatedFields) {
                    const fieldId = mongoose.Types.ObjectId(field._id);
                    bulkOps.push({
                         updateOne: {
                              filter: { _id: groupId, 'fields._id': fieldId },
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
                         filter: { _id: groupId },
                         update: {
                              $pull: {
                                   fields: { _id: { $in: deletedFieldIds } },
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
                    filter: { _id: groupId },
                    update: { $set: { groupName } },
               },
          });
     }

     if (bulkOps.length > 0) {
          return await fieldManagementModel.bulkWrite(bulkOps);
     }
};
const deleteFieldById = async (fieldId) => {
     try {
          const result = await fieldManagementModel.updateOne(
               { 'fields._id': fieldId },
               { $pull: { fields: { _id: fieldId } } }
          );
          return result;
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

          // Collect all field IDs in the group
          const fieldIds = group.fields.map((field) => field._id);

          // Delete the group and all associated fields
          await Promise.all([
               fieldManagementModel.deleteMany({ _id: { $in: fieldIds } }),
               fieldManagementModel.deleteOne({ _id: groupId }),
          ]);

          return true;
     } catch (error) {
          throw error;
     }
};

export const fieldManagementService = {
     createMultipleFieldGroups,
     getFieldGroupsById,
     getFieldGroups,
     addFieldToGroupV2,
     deleteFieldById,
     deleteGroupAndFieldsById,
     updateSubgroups,
     updateSubgroupFields,
};
