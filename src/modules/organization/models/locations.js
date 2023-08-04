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
               },
          ],
     },
     { new: true }
);

const locationModel = mongoose.model('locations', locationSchema);

export default locationModel;
