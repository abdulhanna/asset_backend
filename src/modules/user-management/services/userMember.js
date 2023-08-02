import jwtService from '../../auth/services/jwt-services';
import emailtemplate from '../../../helpers/send-email';
import userModel from '../../auth/models/index.js';
import bcrypt from 'bcryptjs';

const createMember = async (userData) => {
     try {
          // Generate a verification token
          const verificationTokenPayload = await jwtService.generatePair(
               userData.email
          );
          const verificationToken = verificationTokenPayload;

          // Send the invitation email to the member
          await emailtemplate.sendInvitationEmail(
               userData.email,
               verificationToken
          );

          // Save the member with the verification token to the database
          const member = new userModel({
               email: userData.email,
               password: userData.password,
               userProfile: {
                    ...userData.userProfile,
                    organizationId: userData.organizationId,
               },
               teamRoleId: userData.teamRoleId,
               parentId: userData.parentId,

               dashboardPermission: userData.dashboardPermission,
               verificationToken: verificationToken,
          });

          if (userData.assignedLocationId) {
               member.dashboardPermission = 'admin_dashboard';
               member.assignedLocationId = userData.assignedLocationId;
          }

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
               .populate('teamRoleId', 'roleName')
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
          // member.password = password;
          member.password = bcrypt.hashSync(password, 8);
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
               .populate('teamrole', '-_id -permissions ')
               .select('-password')
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
