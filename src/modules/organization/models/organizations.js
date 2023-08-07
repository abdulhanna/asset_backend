import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
     {
          userId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'users', // Reference to the User model
               required: true,
          },
          organizationName: {
               type: String,
               required: true,
          },
          organizationRegistrationNumber: {
               type: String,
               required: true,
          },
          pan: {
               type: String,
               default: null,
          },
          gstin: {
               type: String,
               default: null,
          },
          contactNo: {
               type: String,
               required: true,
          },
          mainAddress: {
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
               },
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

const organizationModel = mongoose.model('organizations', organizationSchema);

export default organizationModel;
