import express from 'express';
import { organizationService } from '../services/organizations.js';
import userModel from '../../auth/models/index.js';
import organizationModel from '../models/organizations.js';
import { isLoggedIn } from '../../auth/router/passport.js';

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
     try {
          const organizations = await organizationService.getOrganizations();

          return res.status(200).json(organizations);
     } catch (error) {
          return res.status(500).json({
               error: 'Unable to get organizations',
          });
     }
});

router.get('/data/:id', isLoggedIn, async (req, res) => {
     try {
          const { id } = req.params;
          const organization = await organizationService.getOrganiztionById(id);

          return res.status(200).json({
               success: true,
               organization,
          });
     } catch (error) {
          return res.status(500).json({
               error: 'Unable to get organization by Id',
          });
     }
});



router.post('/add', isLoggedIn, async (req, res) => {
    
     try {

          const id = req.user.data._id;

          // Check if any of the required fields are missing
          if (!req.body.email || !req.body.organizationName || !req.body.password || !req.body.confirmPassword || !req.body.mainAddress.country || !req.body.organizationRegistrationNumber || !req.body.pan || !req.body.gstin) {
               return res.status(400).json({
                    success: false,
                    error: 'Required fields are missing!!! Email, Password, Organization name, Country, Registration No., PAN No.,GSTIN are mandatory fields',
               });
          }
               const existingUser = await userModel.findOne(
                   {
                        email: req.body.email,
                        isDeleted: false
                   }
               )
          if (existingUser) {
               return res.status(400).json({
                    success: false,
                    error: 'Email already exists',
               });
          }

          const existingCompanyname = await organizationModel.findOne(
              {
                   organizationName: req.body.organizationName,
                   isDeleted: false
              }
          )

          if (existingCompanyname) {
               return res.status(400).json({
                    success: false,
                    error: 'Company Name already exists',
               });
          }


          if (req.body.password !== req.body.confirmPassword) {
               return res.status(409).json({
                    success: false,
                    error: `Password and confirm Password don\'t match`,
               });
          }


          const result = await organizationService.addOrganization(id, req.body);
          return res.status(201).json({
               success: true,
               result
          })
     } catch (error) {
          return res.status(500).json({
               error: 'Unable to add organization data'
          })
     }


});



router.put('/edit/:id', isLoggedIn, async (req, res) => {
     try {
          const id = req.params.id;
          const getUserId = await organizationModel.findById(id)

          // Check if any of the required fields are missing
          if (!req.body.email || !req.body.organizationName || !req.body.password || !req.body.confirmPassword || !req.body.mainAddress.country || !req.body.organizationRegistrationNumber || !req.body.pan || !req.body.gstin) {
               return res.status(400).json({
                    success: false,
                    error: 'Required fields are missing!!! Email, Password, Organization name, Country, Registration No., PAN No.,GSTIN are mandatory fields',
               });
          }


               const existingEmail = await userModel.findOne({
                    email: req.body.email,
                    _id: { $ne: getUserId.userId },
               })

               if(existingEmail)
               {
                    return res.status(400).json({
                         success: false,
                         error: 'Email already exists',
                    });
               }

               const existingCompanyname = await organizationModel.findOne(
                   {
                        organizationName: req.body.organizationName,
                        _id: { $ne: getUserId.userId },
                   }
               )

               if (existingCompanyname) {
                    return res.status(400).json({
                         success: false,
                         error: 'Company Name already exists',
                    });
               }
               if(req.body.password !== req.body.confirmPassword)
               {
                    return res.status(409).json({
                         success: false,
                         error: `Password and confirm Password don\'t match`,
                    });
               }


               const existingRegNumber = await organizationModel.findOne({
                    organizationRegistrationNumber: req.body.organizationRegistrationNumber,
                    _id: { $ne: id },
               })
               if (existingRegNumber) {
                    return res.status(400).json({
                         success: false,
                         error: 'Registration Number already exists',
                    });
               }
               const existingPan = await organizationModel.findOne({
                    pan: req.body.pan,
                    _id: { $ne: id },
               })
               if (existingPan) {
                    return res.status(400).json({
                         success: false,
                         error: 'PAN No. already exists',
                    });
               }


               const existingGSTIN = await organizationModel.findOne({
                    gstin: req.body.gstin,
                    _id: { $ne: id },
               })
               if (existingGSTIN) {
                    return res.status(400).json({
                         success: false,
                         error: 'GSTIN already exists',
                    });
               }


          const organization = await organizationService.organizationUpdate(id, getUserId.userId, req.body);
          return res.status(200).json({
               success: true,
               organization
          })
     }
     catch (error) {
          return res.status(500).json({
               error: 'Unable to update organization data'
          })
     }
})


export default router;
