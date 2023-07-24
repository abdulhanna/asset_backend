import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
     {
          roleName: {
               type: String,
          },
          description: {
               type: String,
               default: null, // Set the default value to null
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

const roleModel = mongoose.model('roles', roleSchema);

export default roleModel;
