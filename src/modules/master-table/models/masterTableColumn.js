import mongoose from 'mongoose';

const dynamicTableFieldSchema = new mongoose.Schema({
    fieldName: {
        type: String,
        required: true
    },
    dataType: {
        type: String,
        enum: ['Alphanumeric', 'Number'],
        default: null
    },
    rateType: {
        type: String,
        enum: ['SLM', 'WDV', null],
        default: null
    }
});


const masterTableColumnSchema = new mongoose.Schema(
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
        tableId: {
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
        fields: [dynamicTableFieldSchema]
    }
);


const masterTableColumnModel = mongoose.model('mastertablecolumns', masterTableColumnSchema);

export default masterTableColumnModel;

