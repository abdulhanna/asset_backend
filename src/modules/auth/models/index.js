import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
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
     },
     userType: {
          // for handling user Management module
          type: String,
          enum: ['root', 'superadmin', 'admin', 'team'],
          default: 'superadmin',
     },
     teamRoleId: {
          // role for all other users except than root and superadmin
          type: mongoose.Schema.Types.ObjectId,
          ref: 'roles',
          default: null,
     },
     dashboardPermission: {
          type: String,
          enum: ['root_dashboard', 'superadmin_dashboard', 'admin_dashboard'],
          required: true,
     },
     token: {
          type: String,
          default: null,
     },
     verificationToken: {
          type: String,
          default: null,
     },
     setPasswordToken: {
          type: String,
          default: null,
     },
     device_or_token: {
          type: [
               {
                    device_type: {
                         type: String,
                    },
                    device_name: {
                         type: String,
                    },
                    setTokenFCM: {
                         type: String,
                    },
               },
          ],
          default: null,
     },
     userProfile: {
          type: {
               organizationId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'organizations',
               },
               userCodeId: {
                    type: String,
               },
               name: {
                    type: String,
               },
               profileImg: {
                    type: String,
               },
               profileImgPublicId: {
                    type: String,
               },
               phone: {
                    type: String,
               },
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
          default: null,
     },
     resetToken: {
          type: String,
          default: null,
     },
     is_email_verified: {
          type: Boolean,
          default: false,
     },
     is_phone_verified: {
         type: Boolean,
         default: false,
     },
     is_profile_completed: {
          type: Boolean,
          default: false,
     },
     acceptedTAndC:{
          type: Boolean,
          default: false
     },
     acceptedPrivacyPolicy:{
          type: Boolean,
          default: false
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
});

userSchema.index({ email: true });

const userModel = mongoose.model('users', userSchema);
export default userModel;

userModel.findOne({ role: 'root' }, (findErr, findRes) => {
     if (findErr) {
          console.log('default admin creation error');
     } else if (findRes) {
          console.log('Root user already exist');
     } else {
          let obj = {
               email: 'root@finbit.com',
               role: 'root',
               userType: 'root',
               dashboardPermission: 'root_dashboard',
               password: bcrypt.hashSync('finbit', 10),
               is_email_verified: true,
               is_profile_completed: true,
               createdAt: Date.now(),
          };
          userModel.create(obj, (error, result) => {
               if (error) {
                    console.log('default admin creation error');
               }
               console.log('default root user created', result);
          });
     }
});
