import StatusCodes from 'http-status-codes';
import createError from 'http-errors-lite';
import bcrypt from 'bcryptjs';
import { assert, assertEvery } from '../../../helpers/mad-assert';
import jwtService from './jwt-services';
import { secret } from '../../../../src/config/secret';
import emailtemplate from '../../../helpers/send-email';
import userModel from '../models/';
import { organizationModel } from '../../organization/models';

const authService = {};

// user registration
authService.doRegister = async (data) => {
     const role = 'superadmin'; // on comapany onboard default role will be superadmin

     assertEvery(
          [data.email, data.password, data.confirmPassword],
          createError(
               StatusCodes.BAD_REQUEST,
               'Invalid Data: [email], [password] and [confirmPassword] fields must exist'
          )
     );

     assert(
          data.password == data.confirmPassword,
          createError(
               StatusCodes.UNAUTHORIZED,
               "Password and confirm Password don't match"
          )
     );

     assert(
          data.password == data.confirmPassword,
          createError(
               StatusCodes.UNAUTHORIZED,
               "Password and confirm Password don't match"
          )
     );

     const existingUser = await userModel.findOne({
          email: data.email,
          isDeleted: false,
     });

     assert(!existingUser, 'Account already exists');

     const token = await jwtService.generatePair(data.email);
     const hashedPassword = bcrypt.hashSync(data.password, 8);
     const sendEmail = await emailtemplate.accountVerificationEmail(
          data.email,
          token
     );
     assert(sendEmail == true, `Something went wrong, please try again!`);

     const result = await userModel.create({
          ...data,
          password: hashedPassword,
          role: role,
          verificationToken: token,
          createdAt: Date.now(),
     });
     return result;
};

//////// email confirmation ////////////
authService.verifyUser = async (verificationToken) => {
     const user = await userModel.findOne({
          verificationToken,
     });
     assert(user, createError(StatusCodes.NOT_FOUND, 'Invalid token provided'));

     const usercheckVerify = await userModel.findOne({
          verificationToken,
          isDeleted: false,
          is_email_verified: true,
          is_profile_completed: true,
     });

     if (usercheckVerify) {
          const redirectURL = `${secret.frontend_baseURL}/login`;
          return redirectURL;
     }

     const userToken = await jwtService.verifyAccessToken(verificationToken);
     const companyToken = await jwtService.generatePair(user.email);
     const updateToken = await userModel.findOneAndUpdate(
          { verificationToken },
          {
               is_email_verified: 'true',
               companyProfileToken: companyToken,
               updatedAt: Date.now(),
          },
          { new: true }
     );

     const redirectURLcompany = `${secret.frontend_baseURL}/company-profile?confirmation_token=${companyToken}`;
     return redirectURLcompany;
};

////////////// Profiel complete ///////////////
authService.completeProfille = async (data) => {
     assertEvery(
          [
               data.token,
               data.organizationName,
               data.organizationRegistrationNumber,
               data.contactNo,
          ],
          createError(
               StatusCodes.BAD_REQUEST,
               'Invalid Data: [token], [organizationName], [organizationRegistrationNumber] and [confirmPassword] fields must exist'
          )
     );

     const companyProfileToken = data.token;
     const user = await userModel.findOne({
          companyProfileToken,
     });

     assert(user, createError(StatusCodes.NOT_FOUND, 'Invalid token provided'));
     const usercheckVerify = await userModel.findOne({
          companyProfileToken,
          isDeleted: false,
          is_email_verified: true,
          is_profile_completed: true,
     });

     if (usercheckVerify) {
          const redirectURL = `${secret.frontend_baseURL}/login`;
          return redirectURL;
     }

     await jwtService.verifyAccessToken(companyProfileToken);

     const organizationName = data.organizationName;
     const existingCompanyname = await organizationModel.findOne({
          organizationName,
     });
     assert(!existingCompanyname, 'Company Name already exists');

     const getToken = await jwtService.generatePair({ _id: user._id });
     const updateToken = await userModel.findOneAndUpdate(
          { companyProfileToken },
          {
               token: getToken,
               is_profile_completed: 'true',
               updatedAt: Date.now(),
          },
          { new: true }
     );

     assert(
          updateToken,
          createError(StatusCodes.REQUEST_TIMEOUT, 'Request Timeout')
     );
     const newOrganization = new organizationModel({
          userId: user._id,
          organizationName: data.organizationName,
          organizationRegistrationNumber: data.organizationRegistrationNumber,
          pan: data.pan,
          gstin: data.gstin,
          contactNo: data.contactNo,
          mainAddress: {
               address1: data.mainAddress.address1,
               address2: data.mainAddress.address2,
               city: data.mainAddress.city,
               state: data.mainAddress.state,
               country: data.mainAddress.country,
               pinCode: data.mainAddress.pinCode,
          },
          createdAt: Date.now(),
     });
     const savedOrganization = await newOrganization.save();
     assert(
          savedOrganization,
          createError(StatusCodes.REQUEST_TIMEOUT, 'Request Timeout')
     );
     const redirectURL = `${secret.frontend_baseURL}/dashboard`;
     return {
          userId: user._id,
          access_token: getToken,
          redirectURL: redirectURL,
     };
};

///////////////// login ///////////////////////////
authService.doLogin = async ({ email, password }) => {
     const existingUser = await userModel.findOne({
          email,
          isDeleted: false,
     });
     assert(
          existingUser,
          createError(StatusCodes.UNAUTHORIZED, 'User does not exist')
     );
     const isValid = bcrypt.compareSync(password, existingUser.password);
     assert(isValid, createError(StatusCodes.UNAUTHORIZED, 'Invalid password'));

     const getUserData = await userModel
          .findOne({ email })
          .select('email role teamrole:')
          .populate({
               path: 'teamrole',
               select: 'permissions',
               populate: {
                    path: 'permissions',
                    select: 'moduleName read read_write actions',
               },
          });

     let permissions;
     if (getUserData.role === 'superadmin' || getUserData.role === 'root') {
          permissions = {}; // Empty key for superadmin and root roles
     } else if (getUserData.teamrole && getUserData.teamrole.permissions) {
          permissions = getUserData.teamrole.permissions; // Use teamrole's permissions if available
     } else {
          permissions = []; // Default to empty array if no permissions found
     }

     const userData = {
          email: getUserData.email,
          role: getUserData.role,
          permissions,
     };

     const getToken = await jwtService.generatePair({ _id: existingUser._id });

     return { userData: userData, access_token: getToken };
};

/////////// change password ////////////////
authService.changePassword = async (id, data) => {
     const pass = data.password;
     const confirmPass = data.confirmPassword;
     const oldPass = data.oldPassword;
     assert(
          pass && confirmPass && oldPass,
          createError(
               StatusCodes.NOT_FOUND,
               'New password, confirm password and old password are required'
          )
     );

     const userData = await userModel.findOne({ _id: id, isDeleted: false });
     assert(
          userData,
          createError(StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server')
     );
     const checkOldPass = bcrypt.compareSync(oldPass, userData.password);
     assert(
          checkOldPass,
          createError(
               StatusCodes.INTERNAL_SERVER_ERROR,
               'Your old password is incorrect'
          )
     );

     const isMatch = pass === oldPass;
     assert(
          !isMatch,
          createError(
               StatusCodes.METHOD_NOT_ALLOWED,
               'You used this password recently, Please choose a different one.'
          )
     );

     const check = pass === confirmPass;
     assert(
          check,
          createError(
               StatusCodes.CONFLICT,
               "password and confirm password don't match"
          )
     );

     const hashPass = bcrypt.hashSync(pass, 8);
     assert(
          hashPass,
          createError(StatusCodes.NOT_IMPLEMENTED, 'error in implementing')
     );

     const updatePass = await userModel
          .findByIdAndUpdate(
               { _id: userData._id },
               {
                    $set: {
                         password: hashPass,
                         updatedAt: Date.now(),
                    },
               },
               { new: true }
          )
          .select('email role');

     assert(
          updatePass,
          createError(StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server')
     );

     return updatePass;
};

export default authService;
