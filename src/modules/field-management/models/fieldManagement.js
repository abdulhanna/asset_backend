const mongoose = require('mongoose');

// Define the dynamic field schema
const fieldSchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: true,
          },
          dataType: {
               type: String,
               //enum: ['number', 'string', 'list', 'date'],
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
          isMandatory: {
               type: Boolean,
               default: false,
          },
     },
     { _id: true }
);

const fieldManagementSchema = new mongoose.Schema({
     name: {
          type: String,
          required: true,
          unique: true,
     },
     fields: {
          type: [fieldSchema],
          // required: true,
          // validate: {
          //      validator: function (fields) {
          //           return fields.length > 0; // Ensure there is at least one field defined
          //      },
          //      message: 'At least one field must be defined for the groupName.',
          // },
     },
});

const fieldManagementModel = mongoose.model(
     'field_management',
     fieldManagementSchema
);

export default fieldManagementModel;
