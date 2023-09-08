import mongoose from 'mongoose';

const assetFormManagementSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations',
        required: true,
    },
    assetFormManagements: [{}],
});

const assetFormManagementModel = mongoose.model('assetformmanagements', assetFormManagementSchema);

export default assetFormManagementModel;
