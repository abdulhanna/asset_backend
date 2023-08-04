import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
     {
          departmentId: {
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
          status: {
               type: String,
               enum: ['active', 'inactive'],
               default: 'active',
          },
          organizationId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'organizations',
               default: null,
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

//list of departemnets by organizationId
// add departemnt by location
