import { Router } from 'express';
import { memberService } from '../services/userMember.js';
import { isLoggedIn } from '../../auth/router/passport.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify';

const router = Router();

// Create a new member
router.post('/createMember', isLoggedIn, async (req, res) => {
     try {
          const parentId = req.user.data._id;

          const { email, password, userProfile, teamrole } = req.body;

          const userData = {
               email,
               password,
               userProfile,
               teamrole,
               parentId,
          };

          const member = await memberService.createMember(userData);
          res.status(201).json({ success: true, member });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

// Update member
router.put('/updateMember/:id', async (req, res) => {
     try {
          const { id } = req.params;
          const data = req.body;

          const updateMember = await memberService.updateMember(id, data);
          res.status(201).json({
               success: true,
               updateMember,
          });
     } catch (error) {
          res.status(500).json({
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
               res.status(200).json({
                    success: true,
                    message: 'Password set successfully',
               });
          } else {
               res.status(404).json({
                    success: false,
                    message: 'Invalid verification token',
               });
          }
     } catch (error) {
          res.status(500).json({
               success: false,
               error: 'Failed to set password',
          });
     }
});

// Get all members of a superadmin
router.get('/:parentId', async (req, res) => {
     try {
          const { parentId } = req.params;
          const members = await memberService.getAllMembers(parentId);
          res.status(200).json({ success: true, members });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message });
     }
});

//------------------------
router.get('/:parentId/download', async (req, res) => {
     try {
          const { parentId } = req.params;
          const members = await memberService.getAllMembers(parentId);

          // Get the desired format from query parameter (pdf, csv, xlsx)
          const format = req.query.format;

          if (format === 'pdf') {
               // Generate and send PDF
               const pdfBuffer = await generatePDF(members);
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

const generatePDF = async (members) => {
     const membersData = extractMembersData(members);
     return new Promise((resolve, reject) => {
          const doc = new PDFDocument();
          const chunks = [];

          doc.on('data', (chunk) => {
               chunks.push(chunk);
          });

          doc.on('end', () => {
               resolve(Buffer.concat(chunks));
          });

          doc.on('error', (error) => {
               reject(error);
          });

          doc.fontSize(14).text('List of Members', { align: 'center' });
          doc.fontSize(12).text('Parent ID: ' + members[0].parentId, {
               align: 'center',
          });
          doc.moveDown();

          membersData.forEach((member) => {
               doc.text(`${member.index}. ${member.name}`);
               doc.text(`${member.index}. ${member.roleName}`);
               doc.text(`${member.index}. ${member.email}`);
               doc.text(`${member.index}. ${member.phone}`);
          });

          doc.end();
     });
};

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

          worksheet.columns = [{ header: 'Name', key: 'name', width: 20 }];

          membersData.forEach((member) => {
               worksheet.addRow({ name: member.name });
          });

          workbook.xlsx.writeBuffer().then((buffer) => {
               resolve(buffer);
          });
     });
};

export default router;
