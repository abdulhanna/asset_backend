import mongoose from 'mongoose';

const dynamicTableFieldSchema = new mongoose.Schema({
    fieldName: {
        type: String,
        required: true
    },
    fieldKey:{
      type: String,
      required: true,
    },
    dataType: {
        type: String,
        enum: ['string', 'number'],
        default: null
    },
    depreciationType: {
        type: String,
        enum: ['SLM', 'WDV', 'Usage', null],
        default: null
    }
});


const masterTableSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'organizations',
            default: null
        },
        codeGenerationType: {
            type: String,
            enum: ['auto', 'manual'],
            default: 'auto',
        },
        tableCodeId: {
            type: String,
            required: true,
            unique: true,
        },
        tableName: {
            type: String,
            required: true,
        },
        applicableTo: {
            type: String,
            enum: ['All', 'Organization', 'Country'],
            required: true
        },
        applicableId: {
            type: String,
            default: null
        },
        fields: [dynamicTableFieldSchema],
        masterTableData: [],
        sampleFile:{
           type: String,
           default: null,
        },
        addedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            default: null
        },
        updatedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            default: null
        },
        publishStatus:{
            type: String,
            enum: ['published', 'unpublished'],
            default: 'unpublished'
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

const masterTableModel = mongoose.model('mastertables', masterTableSchema);

export default masterTableModel;