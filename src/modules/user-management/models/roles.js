import mongoose from 'mongoose';

const roleDefineSchema = new mongoose.Schema(
     {
          roleName: {
               type: String,
          },
          description: {
               type: String,
          },
          permissions: [
               {
                    moduleId: {
                         type: mongoose.Schema.Types.ObjectId,
                         ref: 'permissions',
                    },
                    moduleName: {
                         type: String,
                         default: null,
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
               },
          ],
          addedByUserId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'users',
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

const roleDefineModel = mongoose.model('roles', roleDefineSchema);

export default roleDefineModel;
