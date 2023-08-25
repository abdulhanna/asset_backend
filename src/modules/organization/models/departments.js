import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
     {
          codeGenerationType: {
               type: String,
               enum: ['auto', 'manual'],
               default: 'auto',
          },
          departmentCodeId: {
               type: String,
               required: false,
          },
          name: {
               type: String,
               required: true,
          },
          chargingType: {
               type: String, //Direct
               required: true,
          },
          organizationId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'organizations',
               default: null,
          },
          isDeactivated: {
               type: Boolean,
               default: false,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          deletedAt: {
               type: Date,
               default: null,
          },
          createdAt: {
               type: Date,
               default: null,
          },
          updatedAt: {
               type: Date,
               default: null,
          },
     },
     { timestamps: true }
);

const departmentModel = mongoose.model('departments', departmentSchema);

export default departmentModel;
