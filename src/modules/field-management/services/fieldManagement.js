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
     return  fieldManagementModel.findByIdAndUpdate(
          groupId,
          { subgroups: subgroups || [] },
          { new: true }
     );
};

const updateSubgroupFields = async (subgroupId, fields) => {
     const updatedSubgroup = await fieldManagementModel.findOneAndUpdate(
          { 'subgroups._id': subgroupId },
          { $push: { 'subgroups.$.fields': { $each: fields } } },
          { new: true }
     );
     return updatedSubgroup;
};
const updateGroupFields = async (groupId, fields) => {
     return  fieldManagementModel.findByIdAndUpdate(
         groupId,
         { $push: { fields: { $each: fields } } },
         { new: true }
     );
};
const updateFields = async (id, fields) => {

     try{
          const group = await fieldManagementModel.findById(id);

          if (!group) {
               // If group not found, try updating subgroup
               const updatedSubgroup = await fieldManagementModel.findOneAndUpdate(
                   { 'subgroups._id': id },
                   { $push: { 'subgroups.$.fields': { $each: fields } } },
                   { new: true }
               );
               return updatedSubgroup;
          }

          // Update group fields
          const updatedGroup = await fieldManagementModel.findByIdAndUpdate(
              id,
              { $push: { fields: { $each: fields } } },
              { new: true }
          );
          return updatedGroup;
     }catch (error){
        throw error;
     }

};

const getFieldGroups = async () => {
     try {
          const fieldGroups = await fieldManagementModel.find()

          // Loop through the fieldGroups, subgroups, and fields to populate dependentFieldId
          // for (const group of fieldGroups) {
          //      for (const subgroup of group.subgroups) {
          //           for (const field of subgroup.fields) {
          //                await fieldManagementModel.populate(field, {
          //                     path: 'dependentFieldId',
          //                     model: 'fieldmanagements',
          //                });
          //           }
          //      }
          // }

          return fieldGroups;
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
const getFieldsBySubgroupId = async (subgroupId) => {

     try {
          const subgroup = await fieldManagementModel.findOne({ 'subgroups._id': subgroupId });
          console.log(subgroup)

          if (!subgroup) {
               throw new Error('Subgroup not found');
          }

          const matchingSubgroup = subgroup.subgroups.find(sub => sub._id.toString() === subgroupId);

          if (!matchingSubgroup) {
               throw new Error('Subgroup not found');
          }
          return matchingSubgroup.fields;
     }
     catch(error){
          throw  error
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
     updateGroupFields,
     updateFields,
     getFieldsBySubgroupId
};
