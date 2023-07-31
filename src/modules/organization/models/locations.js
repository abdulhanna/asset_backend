import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: true,
          },
          locationId: {
               // Auto- Generate
               type: String,
               required: false,
          },
          organizationId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'organizations',
          },
          assignedUser: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'users',
          },
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
     },
     { new: true }
);

const locationModel = mongoose.model('locations', locationSchema);

export default locationModel;
