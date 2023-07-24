import jwtService from '../../auth/services/jwt-services';
import emailtemplate from '../../../helpers/send-email';
import userModel from '../../auth/models/index.js';

const createMember = async (userData) => {
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

const updateMember = async (id, data) => {
     try {
          const existingMember = await userModel.findById(id);

          if (!existingMember) {
               throw new Error('Member not found');
          }

          return await userModel.findByIdAndUpdate(
               { _id: id },
               { $set: data },
               {
                    new: true,
               }
          );
     } catch (error) {
          throw new Error(error.message);
     }
};

const getAllMembers = async (parentId) => {
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

const setPassword = async (verificationToken, password) => {
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

export const memberService = {
     createMember,
     updateMember,
     getAllMembers,
     setPassword,
};
