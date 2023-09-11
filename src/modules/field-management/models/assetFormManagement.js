import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'organizations',
            default: null
        },
        name: {
            type: String,
            required: true,
        },
        dataType: {
            type: String,
            enum: ['Number', 'String', 'List', 'Date'],
            required: true,
        },
        fieldLength: {
            type: Number,
            required: function () {
                return this.fieldType === 'string';
            },
        },
        listOptions: {
            type: [String],
        },
        errorMessage: {
            type: String,
            required: true,
        },
        fieldType: {
            type: String,
            enum: ['Input text', 'Select', 'Radio Button'],
            required: true,
        },
        fieldRelation: {
            type: String,
            enum: ['Dependent', 'Independent'],
        },
        dependentFieldId: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'fieldmanagements',
            },
        ],
        dependentOn: {
            type: String,
            required: false,
        },
        isMandatory: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        fieldInfo: {
            type: String,
            default: 'Default field info'
        }
    },
    {_id: true}
);

const assetFormManagementSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'organizations',
            required: true,
        },
        assetFormManagements: [],
    },
    {
        timestamps: true
    }
);

const assetFormManagementModel = mongoose.model('assetformmanagements', assetFormManagementSchema);

export default assetFormManagementModel;
