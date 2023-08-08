import { Router } from 'express';
import { memberService } from '../services/userMember.js';
import { isLoggedIn } from '../../auth/router/passport.js';
import { v2 as cloudinary } from 'cloudinary';
import { secret } from '../../../config/secret.js';
import multer from 'multer';

cloudinary.config(secret.cloudinary);

const profileImg = multer.diskStorage({
     destination: 'public/images/profileImage',
     filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() + file.originalname);
     },
});

const upload = multer({
     storage: profileImg,
     limits: { fileSize: 20 * 1024 * 1024 },
     fileFilter(req, file, cb) {
          if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
               cb(
                    new Error(
                         'Please upload an image file with .png, .jpg, or .jpeg extension.'
                    )
               );
          }
          // Only accept one file with the field name 'image'
          if (req.files && req.files.length >= 1) {
               cb(new Error('Only one file allowed.'));
          }
          cb(undefined, true);
     },
});

const router = Router();
// Create a new member
router.post(
     '/createMember',
     isLoggedIn,
     upload.single('image'),
     async (req, res) => {
          try {
               const parentId = req.user.data._id;
               const organizationId = req.user.data.organizationId;
               const dashboardPermission = req.user.data.dashboardPermission;
               const role = req.user.data.role;

               // Retrieve the uploaded file using req.file
               const profileImgFile = req.file;

               const {
                    email,
                    password,
                    userProfile,
                    teamRoleId,
                    userType,
                    assignedLocationId,
               } = req.body;

               // Check if the email already exists in the database
               const existingMember = await memberService.getMemberByEmail(
                    email
               );
               if (existingMember) {
                    return res.status(400).json({
                         success: false,
                         error: 'Email already exists',
                    });
               }
               // Upload the profile image to Cloudinary
               let profileImgUrl = null;
               let profileImgPublicId = null;
               if (profileImgFile) {
                    const result = await cloudinary.uploader.upload(
                         profileImgFile.path, // Use the file path
                         {
                              folder: 'profile-images', // Change this to your desired folder name
                         }
                    );
                    profileImgUrl = result.secure_url;
                    profileImgPublicId = result.public_id;
               }
               const locationId =
                    assignedLocationId || req.user.data.assignedLocationId;

               const userData = {
                    email,
                    password,
                    userProfile: {
                         ...userProfile,
                         organizationId,
                         profileImg: profileImgUrl,
                         profileImgPublicId: profileImgPublicId, // Store the public_id
                    },
                    teamRoleId,
                    parentId,
                    dashboardPermission,
                    organizationId,
                    locationId,
                    userType,
                    role,
               };

               const member = await memberService.createMember(userData);
               return res.status(201).json({ success: true, member });
          } catch (error) {
               return res
                    .status(500)
                    .json({ success: false, error: error.message });
          }
     }
);

// Update member
router.put('/updateMember/:id', upload.single('image'), async (req, res) => {
     try {
          const { id } = req.params;
          const data = req.body;

          // Retrieve the uploaded file using req.file
          const profileImgFile = req.file;

          // Retrieve the existing member to check if an image exists
          const existingMember = await memberService.getMemberById(id);

          if (profileImgFile) {
               // If an existing profile image exists, delete it from Cloudinary using the stored public_id
               if (
                    existingMember &&
                    existingMember.userProfile &&
                    existingMember.userProfile.profileImgPublicId
               ) {
                    await cloudinary.uploader.destroy(
                         existingMember.userProfile.profileImgPublicId
                    );
               }

               // Upload the new profile image
               const result = await cloudinary.uploader.upload(
                    profileImgFile.path,
                    {
                         folder: 'profile-images',
                    }
               );

               // Update profileImgUrl and save the new public_id in the database
               data.userProfile = {
                    ...data.userProfile,
                    profileImg: result.secure_url,
                    profileImgPublicId: result.public_id,
               };
          }

          const updateMember = await memberService.updateMember(id, data);
          return res.status(201).json({
               success: true,
               updateMember,
          });
     } catch (error) {
          return res.status(500).json({
               success: false,
               error: error.message,
          });
     }
});

// Set password for the member using verification token
router.post('/set-password', async (req, res) => {
     try {
          const { verificationToken, password } = req.body;

          // You can handle the verification token validation here

          const result = await memberService.setPassword(
               verificationToken,
               password
          );

          if (result.success) {
               return res.status(200).json({
                    success: true,
                    message: 'Password set successfully',
               });
          } else {
               return res.status(404).json({
                    success: false,
                    message: 'Invalid verification token',
               });
          }
     } catch (error) {
          return res.status(500).json({
               success: false,
               error: 'Failed to set password',
          });
     }
});

// Get all members of a superadmin
router.get('/:parentId', isLoggedIn, async (req, res) => {
     try {
          const { parentId } = req.params;
          const userType = req.query.userType;
          const members = await memberService.getAllMembers(parentId, userType);
          return res.status(200).json({ success: true, members });
     } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
     }
});

// GET /members (Get members by roleName)
router.get('/', isLoggedIn, async (req, res) => {
     try {
          const { roleName } = req.query;
          const parentId = req.user.data._id; // Get the parent user ID from the authenticated user

          const assignedUsers = await memberService.getMembersByRole(
               parentId,
               roleName
          );

          const assignedUserCounts = assignedUsers.length;
          return res.json({ success: true, assignedUserCounts, assignedUsers });
     } catch (error) {
          console.log(error);
          return res.status(500).json({ success: false, error: error.message });
     }
});

router.get('/member/:id', async (req, res) => {
     try {
          const memberId = req.params.id;
          const member = await memberService.getMemberById(memberId);

          if (!member) {
               return res
                    .status(404)
                    .json({ success: false, message: 'Member not found' });
          }

          return res.status(200).json({ success: true, member });
     } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
     }
});

router.delete('/:userId', async (req, res) => {
     try {
          const { userId } = req.params;

          // Call the service function to update the user's isDeleted field and set deletedAt to the current date
          const updatedUser = await memberService.deleteUser(userId);

          if (!updatedUser) {
               return res.status(404).json({
                    success: false,
                    error: 'User not found or not accessible.',
               });
          }

          return res.status(200).json({
               success: true,
               msg: 'User deleted successfully',
               user: updatedUser,
          });
     } catch (error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               error: 'Unable to delete user',
          });
     }
});

export default router;
