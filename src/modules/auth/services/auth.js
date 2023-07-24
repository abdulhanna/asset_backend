import StatusCodes from "http-status-codes";
import createError from "http-errors-lite";
import bcrypt from "bcryptjs";
import { assert, assertEvery } from "../../../helpers/mad-assert";
import jwtService from "./jwt-services";
import { secret } from "../../../../src/config/secret";
import emailtemplate from "../../../helpers/send-email"
import userModel from "../models/"
import { organizationModel } from "../../organization/models";
import { permissionDefineModel } from "../../user-management/models";

const authService = {};

// user registration
authService.doRegister = async (data) => {
     const role = 'superadmin'; // on comapany onboard default role will be superadmin

     assertEvery(
          [data.email, data.password, data.confirmPassword],
          createError(
               StatusCodes.BAD_REQUEST,
               'Invalid Data: [email], [password] and [confirmPassword] fields must exist'
          )
     );

     assert(
          data.password == data.confirmPassword,
          createError(
               StatusCodes.UNAUTHORIZED,
               "Password and confirm Password don't match"
          )
     );

    assert(
      data.password == data.confirmPassword,
      createError(
        StatusCodes.UNAUTHORIZED,
        "Password and confirm Password don't match"
      )
    );
  
    const existingUser = await userModel.findOne({ 
      email: data.email,
      is_deleted: false,
    });
    
    assert(!existingUser, 'Account already exists');
    
    const token = await jwtService.generatePair(data.email);
    const hashedPassword = bcrypt.hashSync(data.password, 8);
    const sendEmail = await emailtemplate.accountVerificationEmail(data.email, token)
     assert(sendEmail == true , `Something went wrong, please try again!`)
     
   const result = await userModel.create({
        ...data,
        password: hashedPassword,
        role: role,
        verificationToken: token,
      });
     return result;
};

// email confirmation

authService.verifyUser = async (verificationToken) => {
     const user = await userModel.findOne({
          verificationToken,
     });
     assert(user, createError(StatusCodes.NOT_FOUND, 'Invalid token provided'));

     const usercheckVerify = await userModel.findOne({
          verificationToken,
          is_deleted: false,
          is_email_verified: true,
          is_profile_completed: true,
     });

  if(usercheckVerify)
  {
    const redirectURL = `${secret.frontend_baseURL}/login`;
    return redirectURL;
  }
  
  const userToken = await jwtService.verifyAccessToken(verificationToken);
  const companyToken = await jwtService.generatePair(user.email);
  const result = await userModel.findOneAndUpdate(
    { verificationToken},
    { is_email_verified: "true", companyProfileToken: companyToken},
    { new: true }
  );

  const redirectURLcompany = `${secret.frontend_baseURL}/company-profile?confirmation_token=${companyToken}`;
  return redirectURLcompany;
}


authService.completeProfille = async (data) =>{

  assertEvery(
    [data.token, data.organizationName, data.organizationRegistrationNumber, data.contactNo],
    createError(
      StatusCodes.BAD_REQUEST,
      "Invalid Data: [token], [organizationName], [organizationRegistrationNumber] and [confirmPassword] fields must exist"
    )
  );

  const companyProfileToken = data.token;
  const user = await userModel.findOne({
    companyProfileToken,
  });

     assert(user, createError(StatusCodes.NOT_FOUND, 'User not found'));
};

  const usercheckVerify = await userModel.findOne({
    companyProfileToken,
    is_deleted: false,
    is_email_verified: true,
    is_profile_completed: true,
  });

  if(usercheckVerify)
  {
    const redirectURL = `${secret.frontend_baseURL}/login`;
    return {"redirectURL": redirectURL};
  }
  

   const organizationName = data.organizationName;
  const existiingCompanyname = await organizationModel.findOne({
    organizationName
  })
  assert(!existiingCompanyname, "Company Name already exists");

  const getToken = await jwtService.generatePair(user.email);
  const updateToken = await userModel.findOneAndUpdate(
    { companyProfileToken},
    { token: getToken, is_profile_completed: "true"},
    { new: true }
  );

  assert(updateToken, createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout"));
  const newOrganization = new organizationModel({
      userId:user._id,
      organizationName: data.organizationName,
      organizationRegistrationNumber:data.organizationRegistrationNumber,
      pan:data.pan,
      gstin:data.gstin,
      contactNo:data.contactNo,
      mainAddress:{
          address1:data.mainAddress.address1,
          address2:data.mainAddress.address2,
          city:data.mainAddress.city,
          state:data.mainAddress.state,
          country:data.mainAddress.country,
          pinCode:data.mainAddress.pinCode,
      }
  
  });
  const savedOrganization = await newOrganization.save();
  assert(
    savedOrganization,
    createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout")
  );
  const redirectURL = `${secret.frontend_baseURL}/dashboard`;
  return {"userId":user._id, "access_token":getToken, "redirectURL":redirectURL};
}


authService.doLogin = async ({ email, password }) => {
  const existingUser = await userModel.findOne({ email });
  assert(
    existingUser,
    createError(StatusCodes.UNAUTHORIZED, 'User does not exist')
  );
  const isValid = bcrypt.compareSync(password, existingUser.password);
  assert(isValid, createError(StatusCodes.UNAUTHORIZED, "Invalid password"));
  const getToken = await jwtService.generatePair(existingUser.email);

   
       
       const getUserData = await userModel.findOne({ email})
       .select({
        email:1,
        role:1,
        teamrole:1
      })
       .populate({
        path: 'teamrole',
        select: 'permissions',
        populate: {
          path: 'permissions',
          select: 'moduleName read read_write actions',
        },
      })

      let permissions;
      if (getUserData.role === 'superadmin' || getUserData.role === 'root') {
        permissions = {}; // Empty key for superadmin and root roles
      } else if (getUserData.teamrole && getUserData.teamrole.permissions) {
        permissions = getUserData.teamrole.permissions; // Use teamrole's permissions if available
      } else {
        permissions = []; // Default to empty array if no permissions found
      }

      const userData = {
        email: getUserData.email,
        role: getUserData.role,
        permissions,
      }
     
  return {"userData":userData, "access_token":getToken};
};




  export default authService;