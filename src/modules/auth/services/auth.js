import StatusCodes from 'http-status-codes';
import createError from 'http-errors-lite';
import bcrypt from 'bcryptjs';
import { assert, assertEvery } from '../../../helpers/mad-assert';
import jwtService from './jwt-services';
import { secret } from '../../../../src/config/secret';
import emailtemplate from '../../../helpers/send-email';
import userModel from '../models/';

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
          is_deleted: false,
     });

     assert(!existingUser, 'Account already exists');

     const token = await jwtService.generatePair(data.email);
     const access_token = token.access_token;
     const hashedPassword = bcrypt.hashSync(data.password, 8);
     const sendEmail = await emailtemplate.accountVerificationEmail(
          data.email,
          access_token
     );
     assert(sendEmail == true, `Something went wrong, please try again!`);

     const result = await userModel.create({
          ...data,
          password: hashedPassword,
          role: role,
          verificationToken: access_token,
     });
     return result;
};

// email confirmation

authService.verifyUser = async (verificationToken) => {
     const user = await userModel.findOne({
          verificationToken,
     });
     assert(user, createError(StatusCodes.NOT_FOUND, 'Invalid token provided'));

     const usercheckVerify = await userModel.findOne({
          verificationToken,
          is_deleted: false,
          is_email_verified: true,
          is_profile_completed: true,
     });

     if (usercheckVerify) {
          const redirectURL = `${secret.frontend_baseURL}/login`;
          return redirectURL;
     }

     const userToken = await jwtService.verifyAccessToken(verificationToken);
     const companyToken = await jwtService.generatePair(user.email);
     const result = await userModel.findOneAndUpdate(
          { verificationToken },
          {
               is_email_verified: 'true',
               companyProfileToken: companyToken.access_token,
          },
          { new: true }
     );

     const redirectURL = `${secret.frontend_baseURL}/company-profile?confirmation_token=${companyToken.access_token}`;
     return redirectURL;
};

authService.completeProfille = async (token) => {
     const user = await userModel.findOne({
          token,
     });

     assert(user, createError(StatusCodes.NOT_FOUND, 'User not found'));
};

authService.createMember = async (userData) => {
     try {
          // Generate a verification token
          const verificationTokenPayload = await jwtService.generatePair(
               userData.email
          );
          const verificationToken = verificationTokenPayload.access_token;

          // Send the invitation email to the member
          await emailtemplate.sendInvitationEmail(
               userData.email,
               verificationToken
          );

          // Save the member with the verification token to the database
          const member = new userModel({
               email: userData.email,
               password: userData.password,
               parentId: userData.parentId,
               teamrole: userData.teamrole,
               userProfile: userData.userProfile,
               verificationToken: verificationToken,
          });

          const savedMember = await member.save();

          return savedMember;
     } catch (error) {
          console.log(error);
          throw new Error('Failed to create member');
     }
};

authService.getAllMembers = async (parentId) => {
     try {
          const members = await userModel
               .find({ parentId })
               .populate('teamrole');
          return members;
     } catch (error) {
          console.log(error);
          throw new Error('Failed to fetch members');
     }
};

authService.setPassword = async (verificationToken, password) => {
     try {
          // Find the member using the verification token
          const member = await userModel.findOne({ verificationToken });

          if (!member) {
               return { success: false };
          }

          // Set the new password
          member.password = password;
          member.verificationToken = null;
          await member.save();

          return { success: true };
     } catch (error) {
          console.log(error);
          throw new Error('Failed to set password');
     }
};

export default authService;
