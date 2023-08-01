import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
     {
          departmentId: {
               type: String,
               required: false,
               unique: true,
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
