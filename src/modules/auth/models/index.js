import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        default: null,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming parentId refers to the _id of another user document
      ref: 'users', // This refers to the same model
      default: null, 
    },
    role: {
      type: String,
      enum: ['root', 'superadmin'],
      default: null,
    },
    teamrole:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        default: null
    },
    token:{
        type: String,
        default: null,
    },
    verificationToken:{
      type: String,
      default: null,
    },
    companyProfileToken:{
      type: String,
      default: null,
    },
    device_or_token: {
        type : [{
            device_type: {
            type: String                  
          },
          device_name: {
            type: String                  
          },
          setTokenFCM: {
            type: String
          }
      }],
      default :null
    },
    userProfile:{
      type: {
        organizationId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
        },
        userIdentificationNo: {
          type: String                  
        },
        name: {
          type: String                  
        },
        profileImg: {
          type: String
        },
        phone: {
          type: String
        },
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
        pinCode: {
          type: String
        },
      },
      default: null
    },
    resetToken: {
        type: String,
        default: null,
    },
    is_email_verified: {
        type: Boolean,
        default: false,
    },
    is_profile_completed:{
      type: Boolean,
      default: false,
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
});

userSchema.index({ email: true });

const userModel = mongoose.model('users', userSchema);


export default userModel;



