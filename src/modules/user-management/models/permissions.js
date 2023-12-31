import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
     {
          moduleName: {
               type: String,
          },
         dashboardType: {
              type: String,
              enum: ['root', 'user'],
              required: true
         },
          read: {
               type: Boolean,
               default: false,
          },
          readWrite: {
               type: Boolean,
               default: false,
          },
          actions: {
               type: Boolean,
               default: false,
          },
          allAccess: {
               type: Boolean,
               default: false,
          },
          removeAccess: {
               type: Boolean,
               default: false,
          },
          restoreDefaults: {
               type: Boolean,
               default: false,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          isDeactivated: {
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
     { new: true }
);

const permissionModel = mongoose.model('permissions', permissionSchema);

export default permissionModel;
