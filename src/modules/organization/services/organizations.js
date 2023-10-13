import userModel from '../../auth/models/index.js';
import organizationModel from '../models/organizations.js';
import jwtService from '../../auth/services/jwt-services.js';
import bcrypt from "bcryptjs";
import {assetGroupModel} from "../models";

const getOrganizations = async (currentPage, limit, sortBy) => {
     try {

         const totalDocuments = await organizationModel.countDocuments();
         const totalPages = Math.ceil(totalDocuments / limit);

         let startSerialNumber = (currentPage - 1) * limit + 1;
         let endSerialNumber = Math.min(currentPage * limit, totalDocuments);
          const organizations = await organizationModel.find()
          .select(
            {
                 isDeleted: 0,
                 deletedAt: 0,
                 isDeactivated: 0,
                 __v: 0,}
          ).sort(sortBy)
             .skip((currentPage - 1) * limit)
             .limit(limit)
          .populate({
           path: 'userId',
           select: 'email password',
         })

         return {
             currentPage,
             totalPages,
             totalDocuments,
             startSerialNumber,
             endSerialNumber,
             organizations,
         };
     } catch (error) {
          console.log(error);
          throw new Error('Unable to get  organizations');
     }
};

const getOrganiztionById = async (id) => {
     try {
          const organization = await organizationModel.findById(id).select(
               {
                    isDeleted: 0,
                    deletedAt: 0,
                    isDeactivated: 0,
                    __v: 0,}
             )
             .populate({
              path: 'userId',
              select: 'email password',
            });

          return organization;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to get  organization by Id');
     }
};



const addOrganization = async (id, data) => {
   try {
     const token = await jwtService.generatePair(data.email);
     const hashedPassword = bcrypt.hashSync(data.password, 8);
     const result = await userModel.create({
          email: data.email,
          password: hashedPassword,
          role: "superadmin",
          userType: "superadmin",
          dashboardPermission: "superadmin_dashboard",
          verificationToken: token,
          acceptedTAndC: true,
          acceptedPrivacyPolicy: true,
          createdAt : Date.now()
     });



     const newOrganization = new organizationModel({
          userId:result._id,
          organizationName: data.organizationName,
          organizationRegistrationNumber:data.organizationRegistrationNumber,
          organizationType: data.organizationType,
          pan:data.pan,
          gstin:data.gstin,
          contactNo:data.contactNo,
          contactPersonName:data.contactPersonName,
          contactPersonEmail:data.contactPersonEmail,
           mainAddress:{
              address1:data.mainAddress.address1,
              address2:data.mainAddress.address2,
              city:data.mainAddress.city,
              state:data.mainAddress.state,
              country:data.mainAddress.country,
              pinCode:data.mainAddress.pinCode,
          },
        addedByUserId: id,
        createdAt: Date.now()
      });



      const savedOrganization = await newOrganization.save();
       return savedOrganization;
} catch (error) {
     console.log(error);
     throw new Error('Unable to add organizations');
   }
}




const organizationUpdate = async (id, userId, data) => {
     try {
          
          console.log(userId);
          const userData = {};

          if(data.email)
          {
               userData.email = data.email;
          }
          if(data.password)
          { 
               const hashedPassword = bcrypt.hashSync(data.password, 8);
               userData.password = hashedPassword;
               
          }

          userData.updatedAt = Date.now();

          const userUpdate = await userModel.findByIdAndUpdate(
               { _id: userId },
               {
                 $set: userData
               },
               { new: true }
             );


          const organizationData = {};
          if(data.organizationName)
          {
               organizationData.organizationName = data.organizationName
          }
          if(data.organizationRegistrationNumber)
          {
               organizationData.organizationRegistrationNumber = data.organizationRegistrationNumber
          }
          if(data.organizationType)
          {
               organizationData.organizationType = data.organizationType
          }
          if(data.pan)
          {
               organizationData.pan = data.pan
          }
          if(data.gstin)
          {
               organizationData.gstin = data.gstin
          }
          if(data.contactNo)
          {
               organizationData.contactNo = data.contactNo
          }
          if (data.mainAddress) {
               organizationData.mainAddress = {}; // Initialize the mainAddress object
           
               if (data.mainAddress.address1) {
                   organizationData.mainAddress.address1 = data.mainAddress.address1;
               }
               if (data.mainAddress.address2) {
                   organizationData.mainAddress.address2 = data.mainAddress.address2;
               }
               if (data.mainAddress.city) {
                   organizationData.mainAddress.city = data.mainAddress.city;
               }
               if (data.mainAddress.state) {
                   organizationData.mainAddress.state = data.mainAddress.state;
               }
               if (data.mainAddress.country) {
                   organizationData.mainAddress.country = data.mainAddress.country;
               }
               if (data.mainAddress.pinCode) {
                   organizationData.mainAddress.pinCode = data.mainAddress.pinCode;
               }
           }
           
          organizationData.updatedAt = Date.now();

          const result = await organizationModel.findByIdAndUpdate(
               { _id: id },
               {
                 $set: organizationData
               },
               { new: true }
             );
              return result;

          
     } catch (error) {
          console.log(error);
          throw new Error('Unable to update organization data');
        }
}


export const organizationService = {
     getOrganizations,
     getOrganiztionById,
     addOrganization,
     organizationUpdate
};
