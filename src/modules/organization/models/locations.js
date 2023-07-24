import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
     {
          locationName: {
               type: String,
               required: true,
          },
          locationId: {
               // Auto- Generate
               type: String,
               required: false,
          },
          industryType: {
               type: String,
               required: true,
          },
          assignedUser: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'users',
          },
          parent: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'locations',
               default: null,
          },
          children: [
               {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'locations',
               },
          ],
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
               },
          },
     },
     { new: true }
);

const locationModel = mongoose.model('locations', locationSchema);

export default locationModel;
