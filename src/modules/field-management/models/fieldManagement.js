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
            enum: ['string', 'number', 'list', 'date'],
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
            enum: ['Input text', 'Input number', 'Textarea', 'Dropdown', 'Radio button', 'Uploads', 'Date'],
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
        },
        orderNo: {
            type: Number,
            default: null
        },
    },
    {_id: true}
);

const subgroupSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations',
        default: null
    },
    subgroupName: {
        type: String,
        required: true,
    },
    isMandatory: {
        type: Boolean,
        default: false
    },
    fields: {
        type: [fieldSchema],
    },
});

const groupSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations',
        default: null
    },
    groupName: {
        type: String,
        required: true,
        unique: true,
    },
    orderNo: {
        type: Number,
        default: null
    },
    assetFormStepId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assetformsteps',
        default: null
    },
    isMandatory: {
        type: Boolean,
        default: false
    },
    subgroups: {
        type: [subgroupSchema],
    },
    fields: {
        type: [fieldSchema],
    },
});

const fieldManagementModel = mongoose.model('fieldmanagements', groupSchema);

export default fieldManagementModel;

