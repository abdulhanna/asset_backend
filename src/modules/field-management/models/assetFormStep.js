import mongoose from 'mongoose';

const assetFormStepSchema = new mongoose.Schema({
        stepNo: {
            type: Number,
            required: true,
            unique: true
        },
        stepName: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true
    });

const assetFormStepModel = mongoose.model('assetformsteps', assetFormStepSchema);

export default assetFormStepModel;

