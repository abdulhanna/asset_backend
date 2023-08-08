import { Router } from 'express';
import { memberService } from '../services/userMember.js';
import { isLoggedIn } from '../../auth/router/passport.js';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify';
import puppeteer from 'puppeteer';

const router = Router();

// Create a new member
router.post('/createMember', isLoggedIn, async (req, res) => {
     try {
          const parentId = req.user.data._id;
          const organizationId = req.user.data.organizationId;
          const dashboardPermission = req.user.data.dashboardPermission;
          const role = req.user.data.role;

          const {
               email,
               password,
               userProfile,
               teamRoleId,
               userType,
               assignedLocationId,
          } = req.body;

          // Check if the email already exists in the database
          const existingMember = await memberService.getMemberByEmail(email);
          if (existingMember) {
               return res
                    .status(400)
                    .json({ success: false, error: 'Email already exists' });
          }

          const locationId =
               assignedLocationId || req.user.data.assignedLocationId;

          const userData = {
               email,
               password,
               userProfile,
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
          return res.status(500).json({ success: false, error: error.message });
     }
});

// Update member
router.put('/updateMember/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const data = req.body;

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
          roleName: member.teamrole.roleName || 'N/A',
          name: member.userProfile.name || 'N/A',
          email: member.email || 'N/A',
          phone: member.userProfile.phone || 'N/A',
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
          const csvStringifier = stringify({ header: true });

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
               { header: 'Name', key: 'name', width: 20 },
               { header: 'RoleName', key: 'roleName', width: 20 },
               { header: 'Email', key: 'email', width: 20 },
               { header: 'PhoneNumber', key: 'phone', width: 20 },
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

const generateDynamicTable = (membersData) => {
     let tableRows = '';

     membersData.forEach((member) => {
          tableRows += `
         <tr>
           <td>${member.index}</td>
           <td>${member.roleName}</td>
           <td>${member.name}</td>
           <td>${member.email}</td>
           <td>${member.phone}</td>
           <!-- Add more table data cells if needed -->
         </tr>
       `;
     });

     return tableRows;
};

const generatePDFWithDynamicTable = async (members) => {
     const membersData = extractMembersData(members);
     const dynamicTable = generateDynamicTable(membersData);

     const htmlContent = `
       <!DOCTYPE html>
       <html>
       <head>
         <style>
           /* Add your CSS styling for the table here */
           /* ... */
         </style>
       </head>
       <body>
         <h1>List of Members</h1>
         <table>
           <thead>
             <tr>
               <th>Index</th>
               <th>Role Name</th>
               <th>Name</th>
               <th>Email</th>
               <th>Phone</th>
               <!-- Add more table headers if needed -->
             </tr>
           </thead>
           <tbody>
             ${dynamicTable}
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
          const pdfOptions = {
               format: 'A4',
               margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px',
               },
          };

          const pdfBuffer = await page.pdf(pdfOptions);

          await browser.close();

          return pdfBuffer;
     } catch (error) {
          console.error('PDF generation error:', error);
          throw new Error('Failed to generate PDF.');
     }
};

router.get('/v2/:parentId/download', async (req, res) => {
     try {
          const { parentId } = req.params;
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
          res.status(500).json({ success: false, error: error.message });
     }
});

export default router;
