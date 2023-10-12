import jwtService from '../../auth/services/jwt-services';
import emailtemplate from '../../../helpers/send-email';
import userModel from '../../auth/models';
import {locationModel} from '../../organization/models';

const getMemberByEmail = async (email) => {
    try {
        const member = await userModel.findOne({email});
        return member;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to get member by email');
    }
};

const createMember = async (userData) => {
    try {
        let dashboardPermission = null;

        if (userData.role === 'superadmin') {
            if (userData.userType === 'team') {
                dashboardPermission = 'superadmin_dashboard';
            } else if (userData.userType === 'admin') {
                dashboardPermission = 'admin_dashboard';
            }
        } else if (userData.role === 'root') {
            dashboardPermission = 'root_dashboard';
        } else {
            dashboardPermission = 'admin_dashboard';
        }

        // Generate a verification token
        const verificationTokenPayload = await jwtService.generatePair(
            userData.email
        );
        const verificationToken = verificationTokenPayload;

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
            dashboardPermission: dashboardPermission,
            verificationToken: verificationToken,
            userType: userData.userType,
            is_profile_completed: true,
        });

        const savedMember = await member.save();

        // Send the invitation email to the member
        await emailtemplate.sendInvitationEmail(
            userData.email,
            verificationToken
        );

        // For assignedLocationId
        if (userData.locationId) {
            // Find the location by ID
            const location = await locationModel.findById(
                userData.locationId
            );

            if (location) {
                // Push the current member's ID into the assignedUserId array of the location
                location.assignedUserId.push(savedMember._id);
                await location.save();
            }
        }

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
            {_id: id},
            {$set: data},
            {
                new: true,
            }
        );
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAllMembers = async (parentId, userType, page, limit, sortBy) => {
    try {
        const skip = (page - 1) * limit;

        let query = {parentId, isDeleted: false};

        if (userType) {
            query.userType = userType;
        }

        const members = await userModel
            .find(query)
            .populate('teamRoleId', 'roleName')
            .select('-deletedAt')
            .sort(sortBy)
            .skip(skip)
            .limit(limit);

        const totalDocuments = await userModel.countDocuments(query);
        const totalPages = Math.ceil(totalDocuments / limit);
        const startSerialNumber = (page - 1) * limit + 1;
        const endSerialNumber = Math.min(page * limit, totalDocuments);

        return {
            data: members,
            totalDocuments,
            totalPages,
            startSerialNumber,
            endSerialNumber,
        };
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch members');
    }
};


// Function to get members by roleName and parentId
const getMembersByRole = async (teamRoleId) => {
    try {
        const query = {
            isDeleted: false,
        };

        if (teamRoleId) {
            query.teamRoleId = teamRoleId;
        }

        const members = await userModel
            .find(query)
            .populate('teamRoleId', '-permissions')
            .select('-password')
            .exec();

        return members;
    } catch (error) {
        throw new Error('Failed to get members');
    }
};

const getMemberById = async (memberId) => {
    try {
        const member = await userModel.findById(memberId);
        return member;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to get member by ID');
    }
};

const deactivateUser = async (userId) => {
    try {
        // Find the user by ID
        const user = await userModel.findById(userId);

        if (!user) {
            return null;
        }

        // Update the isDeleted field to true and set deletedAt to the current date
        // user.isDeleted = true;
        // user.deletedAt = new Date();
        user.isDeactivated = true;


        // Save the updated user
        const updatedUser = await user.save();
        return updatedUser;
    } catch (error) {
        console.log(error);
        throw new Error('Unable to delete user');
    }
};

export const memberService = {
    createMember,
    updateMember,
    getAllMembers,
    getMembersByRole,
    getMemberByEmail,
    getMemberById,
    deactivateUser,
};
