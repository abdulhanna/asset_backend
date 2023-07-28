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
               userProfile: userData.userProfile,
               teamrole: userData.teamrole,
               parentId: userData.parentId,
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
               .find({ parentId, isDeleted: false, isDeactivated: false })
               .populate('teamrole', 'roleName')
               .select('-deletedAt');

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

// Function to get members by roleName and parentId
const getMembersByRole = async (parentId, roleName) => {
     try {
          const members = await userModel
               .find({
                    parentId,
               })
               .populate('teamrole', '-_id -permissions ') // Populate the 'teamrole' field and exclude '_id' from the results
               .select('-password') // Exclude the password field from the query results
               .exec();

          // Filter the members based on the 'roleName' if provided
          if (roleName) {
               const filteredMembers = members.filter(
                    (member) =>
                         member.teamrole &&
                         member.teamrole.roleName === roleName
               );

               return filteredMembers;
          }

          return members;
     } catch (error) {
          throw new Error('Failed to get members');
     }
};

export const memberService = {
     createMember,
     updateMember,
     getAllMembers,
     setPassword,
     getMembersByRole,
};
