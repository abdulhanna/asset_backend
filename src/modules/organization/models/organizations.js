import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
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
              type: String
            },
            address2: {
              type: String
            },
            city: {
              type: String
            },
            state: {
              type: String
            },
            country:{
                type: String
              },
            pinCode: {
              type: String
            },
          },
    },
    otherLocations: {
        type: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'locations', // Reference to the Locations model
        }],
        default: null,
      },
    is_deleted: {
        type: Boolean,
        default: false,
      },
      is_deactivated: {
        type: Boolean,
        default: false,
      },
      deleted_at: {
          type : Date,
          default : null,
      },
      created_at: { 
          type: Date,
          default: null,
      },
      updated_at: {
          type: Date,
          default: null,
      }
  },{new:true});


  export default mongoose.model('organizations', organizationSchema);