import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
     {
          rolename: {
               type: String,
          },
          permissions: [
               {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Permission',
               },
          ],
          added_by_userId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'users',
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

const roleModel = mongoose.model('Role', roleSchema);

export default roleModel;
