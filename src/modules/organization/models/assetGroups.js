import mongoose from 'mongoose';

const assetGroupSchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: true,
          },
          assetGroupId: {
               // Auto-Generate or input text
               type: String,
               required: false,
          },
          groupNestingId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'assetgroups',
               default: null,
          },
          isGroupNesting: {
               type: Boolean,
               default: false,
          },
          description: {
               type: String,
               required: false,
          },
     },
     { new: true }
);

const assetGroupModel = mongoose.model('assetgroups', assetGroupSchema);

export default assetGroupModel;
