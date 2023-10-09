import mongoose from 'mongoose';

const dynamicTableFieldSchema = new Schema({
    fieldName: {
        type: String,
        required: true
    },
    fieldType: {
        type: String,
        enum: ['AlphaNumeric', 'TextFields', 'Numeric'],
        required: true
    },
    rateType: {
        type: String,
        enum: ['SLM', 'WDV', null],
        default: null
    }
});


const masterTableSchema = new mongoose.Schema(
    {
        tableID: {
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
        uploadDocument: {
            type: String
        }
    },
    {
        timestamps: true
    }
);


const masterTableModel = mongoose.model('mastertables', masterTableSchema);

export default masterTableModel;

