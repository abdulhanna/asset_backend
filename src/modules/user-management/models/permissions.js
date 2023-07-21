import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
     {
          moduleName: {
               type: String,
          },
          read: {
               type: Boolean,
               default: false,
          },
          read_write: {
               type: Boolean,
               default: false,
          },
          actions: {
               type: Boolean,
               default: false,
          },
          is_deleted: {
               type: Boolean,
               default: false,
          },
          is_deactivated: {
               type: Boolean,
               default: false,
          },
          deleted_at: {
               type: Date,
               default: null,
          },
          created_at: {
               type: Date,
               default: null,
          },
          updated_at: {
               type: Date,
               default: null,
          },
     },
     { new: true }
);

const permissionModel = mongoose.model('Permission', permissionSchema);

export default permissionModel;
