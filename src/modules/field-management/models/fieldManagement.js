const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: true,
          },
          dataType: {
               type: String,
               enum: ['number', 'string', 'list', 'date'],
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
          errorTitle: {
               type: String,
               required: true,
          },
          fieldType: {
               type: String,
               enum: ['Input text', 'Select'],
               required: true,
          },
          fieldRelation: {
               type: String,
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
});

const fieldManagementModel = mongoose.model('fieldmanagements', groupSchema);

export default fieldManagementModel;
