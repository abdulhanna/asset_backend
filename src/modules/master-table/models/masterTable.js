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
    label: String,
    inputValue: String  // This field will be used for Input text value
});


const masterTableSchema = new mongoose.Schema(
    {
        tableID: {
            type: String,
            required: true,
            unique: true,

        },
        applicableTo: {
            type: String,
            enum: ['All', 'Organization'],
            required: true
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