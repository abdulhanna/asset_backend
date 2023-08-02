import { fieldManagementModel } from '../models';
import mongoose from 'mongoose';

const createMultipleFieldGroups = async (names) => {
     const newFieldGroups = await Promise.all(
          names.map(async (groupName) => {
               return await fieldManagementModel.create({
                    name: groupName,
                    fields: [],
               });
          })
     );
     return newFieldGroups;
};

const addFieldToGroup = async (groupId, fields) => {
     return await fieldManagementModel.findOneAndUpdate(
          { _id: groupId },
          { $push: { fields } },
          { new: true }
     );
};

const getFieldGroups = async () => {
     try {
          const filedGroups = await fieldManagementModel.find();

          return filedGroups;
     } catch (error) {
          throw new Error('Unable to get field group');
     }
};

const addFieldToGroupV2 = async (groupId, fields) => {
     const bulkOps = [];

     // Separate the operations: add, update, and delete
     const newFields = fields.filter((f) => !f._id); // Fields to be added
     console.log(newFields);
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
                                   'fields.$.fieldLength': field.fieldLength,
                                   'fields.$.listOptions': field.listOptions,
                                   'fields.$.errorTitle': field.errorTitle,
                                   'fields.$.isMandatory': field.isMandatory,
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
                         $pull: { fields: { _id: { $in: deletedFieldIds } } },
                    },
               },
          });
     }

     return await fieldManagementModel.bulkWrite(bulkOps);
};

export const fieldManagementService = {
     createMultipleFieldGroups,
     addFieldToGroup,
     getFieldGroups,
     addFieldToGroupV2,
};
