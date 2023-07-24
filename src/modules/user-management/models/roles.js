import mongoose from 'mongoose';

const roleDefineSchema = new mongoose.Schema(
     {
          roleName: {
               type: String,
          },
          permissions: [
               {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'permissions',
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
