const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: true,
          },
          dataType: {
               type: String,
               enum: ['Number', 'String', 'List', 'Date'],
               required: true,
          },
          fieldLength: {
               type: Number,
               required: function () {
                    return this.fieldType === 'string';
               },
          },
          listOptions: {
               type: [String],
          },
          errorMessage: {
               type: String,
               required: true,
          },
          fieldType: {
               type: String,
               enum: ['Input text', 'Select', 'Radio Button'],
               required: true,
          },
          fieldRelation: {
               type: String,
               enum: ['Dependent', 'Independent'],
          },
          dependentFieldId: [
               {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'fieldmanagements',
               },
          ],
          dependentOn: {
               type: String,
               required: false,
          },
          isMandatory: {
               type: Boolean,
               default: false,
          },
     },
     { _id: true }
);

const subgroupSchema = new mongoose.Schema({
     subgroupName: {
          type: String,
          required: true,
     },
     fields: {
          type: [fieldSchema],
     },
});

const groupSchema = new mongoose.Schema({
     groupName: {
          type: String,
          required: true,
          unique: true,
     },
     subgroups: {
          type: [subgroupSchema],
     },
    fields: {
        type: [fieldSchema],
    },
});

const fieldManagementModel = mongoose.model('fieldmanagements', groupSchema);

export default fieldManagementModel;
