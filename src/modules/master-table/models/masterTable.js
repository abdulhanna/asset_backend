import mongoose from 'mongoose';

const masterTableSchema = new mongoose.Schema(
    {
    tableId: {
            type: String,
            ref: 'mastertablecolumns',
            required: true,
    },
    masterTableData: [],
        addedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
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
)


const masterTableModel = mongoose.model('mastertables', masterTableSchema);

export default masterTableModel;