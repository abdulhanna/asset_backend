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

// authService.createMember = async (req, res) => {
//      try {
//           const { email, password, parentId, permissions, teamrole } = req.body;

//           // Perform validation checks here
//           // ...

//           // Check if the parentId belongs to an existing superadmin
//           const parentUser = await userModel.findById(parentId);
//           if (!parentUser || parentUser.role !== 'superadmin') {
//                return res
//                     .status(400)
//                     .json({ error: 'Invalid parentId or not a superadmin' });
//           }

//           // Check if the specified teamrole exists in the roleDefineModel
//           // You can add more validation checks for permissions and roles if needed

//           // Create the new user in the database
//           const newUser = await userModel.create({
//                email,
//                password,
//                parentId,
//                permissions,
//                teamrole,
//                role: 'team', // Set the role as 'team' for members
//           });

//           res.status(201).json(newUser);
//      } catch (err) {
//           res.status(500).json({ error: 'Unable to create user' });
//      }
// };

authService.createMember = async (userData) => {
     try {
          const member = new userModel({
               email: userData.email,
               password: userData.password,
               parentId: userData.parentId,
               //role: 'member',
               userProfile: userData.userProfile,
          });

          const savedMember = await member.save();
          return savedMember;
     } catch (error) {
          throw new Error('Failed to create member');
     }
};

authService.getAllMembers = async (parentId) => {
     try {
          const members = await userModel.find({ parentId });
          return members;
     } catch (error) {
          throw new Error('Failed to fetch members');
     }
};

export default authService;
