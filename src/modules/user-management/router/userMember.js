import {Router} from 'express';
import {memberService} from '../services/userMember.js';
import {isLoggedIn} from '../../auth/router/passport.js';
import {v2 as cloudinary} from 'cloudinary';
import {secret} from '../../../config/secret.js';
import multer from 'multer';
import ExcelJS from 'exceljs';
import {stringify} from 'csv-stringify';
import puppeteer from 'puppeteer';

cloudinary.config(secret.cloudinary);

const profileImg = multer.diskStorage({
    destination: 'public/exports/profileImage',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + file.originalname);
    },
});

const upload = multer({
    storage: profileImg,
    limits: {fileSize: 20 * 1024 * 1024},
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
            return res.status(201).json({success: true, member});
        } catch (error) {
            return res
                .status(500)
                .json({success: false, error: error.message});
        }
    }
);

// Update member
router.put('/updateMember/:id', isLoggedIn, upload.single('image'), async (req, res) => {
    try {
        const {id} = req.params;
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
        } else if (existingMember && existingMember.userProfile) {
            // If no new image is provided, keep the existing image data
            data.userProfile = {
                ...data.userProfile,
                profileImg: existingMember.userProfile.profileImg,
                profileImgPublicId: existingMember.userProfile.profileImgPublicId,
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

// Get all members of a superadmin
router.get('/', isLoggedIn, async (req, res) => {
    try {
        // const { parentId } = req.params;
        const parentId = req.user.data._id;
        const userType = req.query.userType;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 10;
        const sortBy = req.query.sort ? JSON.parse(req.query.sort) : 'createdAt';

        const membersData = await memberService.getAllMembers(parentId, userType, page, limit, sortBy);

        return res.status(200).json({
            success: true,
            members: membersData.data,
            totalDocuments: membersData.totalDocuments,
            totalPages: membersData.totalPages,
            startSerialNumber: membersData.startSerialNumber,
            endSerialNumber: membersData.endSerialNumber,
            currentPage: page
        });

    } catch (error) {
        return res.status(500).json({success: false, error: error.message});
    }
});

// GET /members (Get members by roleName)
router.get('/roles', isLoggedIn, async (req, res) => {
    try {
        const {teamRoleId} = req.query;

        const assignedUsers = await memberService.getMembersByRole(
            teamRoleId
        );

        const assignedUserCounts = assignedUsers.length;
        return res.json({success: true, assignedUserCounts, assignedUsers});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, error: error.message});
    }
});

router.get('/member/:id', isLoggedIn, async (req, res) => {
    try {
        const memberId = req.params.id;
        const member = await memberService.getMemberById(memberId);

        if (!member) {
            return res
                .status(404)
                .json({success: false, message: 'Member not found'});
        }

        return res.status(200).json({success: true, member});
    } catch (error) {
        return res.status(500).json({success: false, error: error.message});
    }
});

router.delete('/delete/:userId', isLoggedIn, async (req, res) => {
    try {
        const {userId} = req.params;

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

//------------------------
// router.get('/:parentId/download', async (req, res) => {
//      try {
//           const { parentId } = req.params;
//           const members = await memberService.getAllMembers(parentId);

//           // Get the desired format from query parameter (pdf, csv, xlsx)
//           const format = req.query.format;

//           if (format === 'pdf') {
//                // Generate and send PDF
//                const pdfBuffer = await generatePDF(members);
//                res.setHeader(
//                     'Content-Disposition',
//                     'attachment; filename=members.pdf'
//                );
//                res.setHeader('Content-Type', 'application/pdf');
//                res.send(pdfBuffer);
//           } else if (format === 'csv') {
//                // Generate and send CSV
//                const csvBuffer = await generateCSV(members);

//                res.setHeader(
//                     'Content-Disposition',
//                     'attachment; filename=members.csv'
//                );
//                res.setHeader('Content-Type', 'text/csv');
//                res.send(csvBuffer);
//           } else if (format === 'xlsx') {
//                // Generate and send XLSX
//                const xlsxBuffer = await generateXLSX(members);
//                res.setHeader(
//                     'Content-Disposition',
//                     'attachment; filename=members.xlsx'
//                );
//                res.setHeader(
//                     'Content-Type',
//                     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//                );
//                res.send(xlsxBuffer);
//           } else {
//                throw new Error('Invalid format specified.');
//           }
//      } catch (error) {
//           res.status(500).json({ success: false, error: error.message });
//      }
// });

const extractMembersData = (members) => {
    return members.map((member, index) => ({
        index: index + 1,
        roleName: member.teamRoleId
            ? member.teamRoleId.roleName || 'N/A'
            : 'N/A',
        name: member.userProfile ? member.userProfile.name || 'N/A' : 'N/A',
        email: member.email || 'N/A',
        phone: member.userProfile ? member.userProfile.phone || 'N/A' : 'N/A',
        createdAt: member.createdAt || 'N/A',
    }));
};

// const generatePDF = async (members) => {
//      const membersData = extractMembersData(members);
//      return new Promise((resolve, reject) => {
//           const doc = new PDFDocument();
//           const chunks = [];

//           doc.on('data', (chunk) => {
//                chunks.push(chunk);
//           });

//           doc.on('end', () => {
//                resolve(Buffer.concat(chunks));
//           });

//           doc.on('error', (error) => {
//                reject(error);
//           });

//           doc.fontSize(14).text('List of Members', { align: 'center' });
//           doc.fontSize(12).text('Parent ID: ' + members[0].parentId, {
//                align: 'center',
//           });
//           doc.moveDown();

//           membersData.forEach((member) => {
//                doc.text(`${member.index}. ${member.name}`);
//                doc.text(`${member.index}. ${member.roleName}`);
//                doc.text(`${member.index}. ${member.email}`);
//                doc.text(`${member.index}. ${member.phone}`);
//           });

//           doc.end();
//      });
// };

const generateCSV = async (members) => {
    const membersData = extractMembersData(members);

    return new Promise((resolve, reject) => {
        const chunks = [];
        const csvStringifier = stringify({header: true});

        csvStringifier.on('readable', () => {
            let chunk;
            while ((chunk = csvStringifier.read())) {
                chunks.push(chunk);
            }
        });

        csvStringifier.on('error', (error) => {
            reject(error);
        });

        csvStringifier.on('end', () => {
            // Concatenate chunks into a single Buffer
            const csvBuffer = Buffer.concat(chunks);
            resolve(csvBuffer);
        });

        membersData.forEach((member) => {
            csvStringifier.write(member);
        });

        csvStringifier.end();
    });
};

const generateXLSX = async (members) => {
    const membersData = extractMembersData(members);
    return new Promise((resolve) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Members');

        worksheet.columns = [
            {header: 'Name', key: 'name', width: 20},
            {header: 'RoleName', key: 'roleName', width: 20},
            {header: 'Email', key: 'email', width: 20},
            {header: 'PhoneNumber', key: 'phone', width: 20},
        ];

        // membersData.forEach((member) => {
        //      worksheet.addRow({ name: member.name });
        //      worksheet.addRow({ name: member.roleName });
        //      worksheet.addRow({ name: member.email });
        //      worksheet.addRow({ name: member.phone });
        // });

        membersData.forEach((member) => {
            // Add the entire member object as a single row
            worksheet.addRow(member);
        });

        workbook.xlsx.writeBuffer().then((buffer) => {
            resolve(buffer);
        });
    });
};

// const generateDynamicTable = (membersData) => {
//      let tableRows = '';

//      membersData.forEach((member) => {
//           tableRows += `
//          <tr>
//            <td>${member.index}</td>
//            <td>${member.roleName}</td>
//            <td>${member.name}</td>
//            <td>${member.email}</td>
//            <td>${member.phone}</td>
//            <!-- Add more table data cells if needed -->
//          </tr>
//        `;
//      });

//      return tableRows;
// };

const generatePDFWithDynamicTable = async (members) => {
    const membersData = extractMembersData(members);

    const htmlContent = `
     <html>
          <head>
                     
     </head>
          
     <body>
                   
          <h1 class="head" style="text-align: center">List of Members</h1>
                   
          <table
               style="
                    width: 100%;
                    border-collapse: collapse;
                    border: 2px solid #ddd;
                    font-family: Arial, Helvetica, sans-serif;
               "
          >
                            
               <thead>
                                     
                    <tr>
                                              
                         <th
                              style="
                                   border: 2px solid #ddd;
                                   font-size: 24px;
                                   font-weight: 600;
                                   padding: 15px;
                              "
                         >
                              Index
                         </th>
                                              
                         <th
                              style="
                                   border: 2px solid #ddd;
                                   font-size: 24px;
                                   font-weight: 600;
                                   padding: 15px;
                              "
                         >
                              Role Name
                         </th>
                                              
                         <th
                              style="
                                   border: 2px solid #ddd;
                                   font-size: 24px;
                                   font-weight: 600;
                                   padding: 15px;
                              "
                         >
                              Name
                         </th>
                                              
                         <th
                              style="
                                   border: 2px solid #ddd;
                                   font-size: 24px;
                                   font-weight: 600;
                                   padding: 15px;
                              "
                         >
                              Email
                         </th>
                                              
                         <th
                              style="
                                   border: 2px solid #ddd;
                                   font-size: 24px;
                                   font-weight: 600;
                                   padding: 15px;
                              "
                         >
                              Phone
                         </th>
                                              <!-- Add more table headers if needed -->
                                          
                    </tr>
                                 
               </thead>
                            
               <tbody>
                                     ${membersData
        .map(
            (member) => `          
                                   
                    <tr>
                                                      
                         <td style="border: 2px solid #ddd; padding: 15px">
                              ${member.index}
                         </td>
                                                      
                         <td style="border: 2px solid #ddd; padding: 15px">
                              ${member.roleName}
                         </td>
                                                      
                         <td style="border: 2px solid #ddd; padding: 15px">
                              ${member.name}
                         </td>
                                                      
                         <td style="border: 2px solid #ddd; padding: 15px">
                              ${member.email}
                         </td>
                                                      
                         <td style="border: 2px solid #ddd; padding: 15px">
                              ${member.phone}
                         </td>
                                                      <!-- Add more table data cells if needed -->
                                                  
                    </tr>
                                         `
        )
        .join('')}              
               </tbody>
                        
          </table>
               
     </body>
          
</html>


     `;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);

        // Set the PDF options (e.g., format, margin, etc.)
        // const pdfOptions = {
        //      format: 'A4',
        //      margin: {
        //           top: '20px',
        //           right: '20px',
        //           bottom: '20px',
        //           left: '20px',
        //      },
        // };

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            scale: 0.75, // Adjust the scale factor to fit more content onto a single page
        });

        await browser.close();

        return pdfBuffer;
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF.');
    }
};

router.get('/v2/:parentId/download', async (req, res) => {
    try {
        const {parentId} = req.params;
        const members = await memberService.getAllMembers(parentId);

        // Get the desired format from query parameter (pdf, csv, xlsx)
        const format = req.query.format;

        if (format === 'pdf') {
            // Generate and send PDF
            const pdfBuffer = await generatePDFWithDynamicTable(members);
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=members.pdf'
            );
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfBuffer);
        } else if (format === 'csv') {
            // Generate and send CSV
            const csvBuffer = await generateCSV(members);

            res.setHeader(
                'Content-Disposition',
                'attachment; filename=members.csv'
            );
            res.setHeader('Content-Type', 'text/csv');
            res.send(csvBuffer);
        } else if (format === 'xlsx') {
            // Generate and send XLSX
            const xlsxBuffer = await generateXLSX(members);
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=members.xlsx'
            );
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.send(xlsxBuffer);
        } else {
            throw new Error('Invalid format specified.');
        }
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
});

export default router;
