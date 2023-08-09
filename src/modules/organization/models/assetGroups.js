import mongoose from 'mongoose';

const assetGroupSchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: true,
          },
          assetCodeId: {
               // Auto-Generate or input text
               type: String,
               required: false,
          },
          organizationId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'organizations',
          },
          description: {
               type: String,
               required: false,
          },
          parentId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'assetgroups',
               default: null,
          },
          isParent: {
               type: Boolean,
               default: false,
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
     { new: true }
);

const assetGroupModel = mongoose.model('assetgroups', assetGroupSchema);

export default assetGroupModel;
