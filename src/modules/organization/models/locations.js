import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
    {
        codeGenerationType: {
            type: String,
            enum: ['auto', 'manual'],
            default: 'auto',
        },
        locationCodeId: {
            // Auto- Generate
            type: String,
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'organizations',
        },
        assignedUserId: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
            },
        ],
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'locations',
            default: null,
        },
        isParent: {
            type: Boolean,
            default: false,
        },
        address: {
            type: {
                address1: {
                    type: String,
                },
                address2: {
                    type: String,
                },
                city: {
                    type: String,
                },
                state: {
                    type: String,
                },
                country: {
                    type: String,
                },
                pinCode: {
                    type: String,
                },
                emailAddress: {
                    type: String
                },
                contactNumber: {
                    type: String
                },
                latitude: {
                    type: Number,
                    required: false,
                },
                longitude: {
                    type: Number,
                    required: false,
                },
            },
        },
        departments: [
            {
                departmentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'departments',
                },
                departmentAddress: {
                    address1: {
                        type: String,
                    },
                    address2: {
                        type: String,
                    },
                    city: {
                        type: String,
                    },
                },
                contactAddress: {
                    emailAddress: {
                        type: String,
                    },
                    contactNumber: {
                        type: String,
                    },
                },
                moreInformation: {
                    departmentInchargeId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'users',
                        default: null,
                    },
                    chargingType: {
                        type: String,
                    },
                },
                createdAt: {
                    type: Date,
                    default: null,
                },
                updatedAt: {
                    type: Date,
                    default: null,
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
            },
        ],
        assetgroups: [
            {
                assetgroupId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'assetgroups',
                },
                createdAt: {
                    type: Date,
                    default: null,
                },
                updatedAt: {
                    type: Date,
                    default: null,
                },
                isDeactivated: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        createdAt: {
            type: Date,
            default: null,
        },
        updatedAt: {
            type: Date,
            default: null,
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
    },
    {new: true}
);

const locationModel = mongoose.model('locations', locationSchema);

export default locationModel;
