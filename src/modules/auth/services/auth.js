import StatusCodes from "http-status-codes";
import createError from "http-errors-lite";
import bcrypt from "bcryptjs";
import { assert, assertEvery } from "../../../helpers/mad-assert";
import jwtService from "./jwt-services";
import { secret } from "../../../../src/config/secret";
import emailtemplate from "../../../helpers/send-email"
import userModel from "../models"
import { organizationModel, locationModel } from "../../organization/models";

const authService = {};

// user registration
authService.doRegister = async (data) => {
     const role = 'superadmin'; // on comapany onboard default role will be superadmin
     const dashboardPermission = 'superadmin_dashboard';
     const userType = 'superadmin'; // on comapany onboard default userType will be superadmin

     assertEvery(
          [data.email, data.password, data.confirmPassword, data.acceptedTAndC, data.acceptedPrivacyPolicy],
          createError(
               StatusCodes.BAD_REQUEST,
               'Invalid Data: [email], [password], [confirmPassword], [data.acceptedTAndC] and [data.acceptedPrivacyPolicy] fields must exist'
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
          isDeleted: false,
     });

     assert(!existingUser, 'Account already exists');

     const token = await jwtService.generatePair(data.email);
     const hashedPassword = bcrypt.hashSync(data.password, 8);
     const sendEmail = await emailtemplate.accountVerificationEmail(
          data.email,
          token
     );
     assert(sendEmail == true, `Something went wrong, please try again!`);

     const result = await userModel.create({
          ...data,
          password: hashedPassword,
          role: role,
          userType: userType,
          dashboardPermission: dashboardPermission,
          verificationToken: token,
          createdAt : Date.now()
     });
     return result;
};

//////// email confirmation ////////////
authService.verifyUser = async (verificationToken) => {
     const usercheckVerify = await userModel.findOne({
          verificationToken,
          isDeleted: false,
          is_email_verified: true,
     });

     if (usercheckVerify) {
          const redirectURL = `${secret.frontend_baseURL}/login`;
          return redirectURL;
     }
 
       await jwtService.verifyAccessToken(verificationToken);
       const getUser = await userModel.findOne({verificationToken});
       if(getUser.role == 'superadmin')
       {
        const verifyEmail = await userModel.findOneAndUpdate(
          { verificationToken},
          { verificationToken: null, is_email_verified: true, updatedAt : Date.now()},
          { new: true }
        );
       }
       else
       {
          //set pass token for otherr user roles
          const setpassstoken = await jwtService.generatePair(getUser.email)
        const verifyEmail = await userModel.findOneAndUpdate(
          { verificationToken},
          { setPasswordToken: setpassstoken, verificationToken: null, is_email_verified: true, updatedAt : Date.now()},
          { new: true }
        );
       }
     
    const redirectURLlogin = getUser.role == 'superadmin' ? `${secret.frontend_baseURL}/login` : `${secret.frontend_baseURL}/set-password?setPassword_Token?${setpassstoken}`;
    return redirectURLlogin;
}


///////////////// set Password other user roles than superadmin, root /////////////////

authService.setPassword = async (data) =>
{
  const setPasswordToken = data.setPasswordToken;
  const tokenchecksetPass = await userModel.findOne({
    setPasswordToken
  });

  assert(
    tokenchecksetPass,
    createError(StatusCodes.UNAUTHORIZED, "Token Invalid or Expired")
  );
  const pass = data.password;
  const confirmPass = data.confirmPassword;

  const check = pass === confirmPass;
  assert(
    check,
    createError(
      StatusCodes.CONFLICT,
      "password and confirmPassword don't match"
    )
  );
 
  const hashPass = bcrypt.hashSync(pass, 8);
  assert(
    hashPass,
    createError(StatusCodes.NOT_IMPLEMENTED, "error in implementing")
  );

  const updatePass = await userModel.findByIdAndUpdate(
    { _id: tokenchecksetPass._id },
    {$set:{
      password: hashPass,
      updatedAt: Date.now()
   }},
    { new: true }
  )
  return {"msg":"Password updaated successfully"}
}


////////////// Profiel complete ///////////////
    authService.completeProfille = async (id, data) =>{

      assertEvery(
        [data.organizationName, data.organizationRegistrationNumber, data.contactNo],
        createError(
          StatusCodes.BAD_REQUEST,
          "Invalid Data: [organizationName], [organizationRegistrationNumber] and [confirmPassword] fields must exist"
        )
      );
    
      const usercheckVerify = await userModel.findOne({
        _id:id,
        is_email_verified: true,
        is_profile_completed: true,
        isDeleted: false,
   });

   if (usercheckVerify) {
        const redirectUrl = `${secret.frontend_baseURL}/dashboard`;
        return {"redirectUrl":redirectUrl};
   }
   const user = await userModel.findOne({
    _id:id,
  });

      const organizationName = data.organizationName;
      const existingCompanyname = await organizationModel.findOne({
        organizationName
      })

      assert(!existingCompanyname, createError(StatusCodes.BAD_REQUEST, "Company Name already exists"))

      
      const newOrganization = new organizationModel({
          userId:user._id,
          organizationName: data.organizationName,
          organizationRegistrationNumber:data.organizationRegistrationNumber,
          organizationType: data.organizationType,
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
          },
          addedByUserId: id,
        createdAt: Date.now()
      
      });
      const savedOrganization = await newOrganization.save();
      assert(
        savedOrganization,
        createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout")
      );

      const getToken = await jwtService.generatePair({
        _id:user._id,
        role:user.role,
        dashboardPermission:user.dashboardPermission,
        organizationId:savedOrganization._id,
        assignedLocationId:null
      });
      const updateToken = await userModel.findByIdAndUpdate(
        { _id: user._id},
        { token:getToken, is_profile_completed: true, updatedAt : Date.now()},
        { new: true }
      );
      assert(updateToken, createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout"));
      const redirectUrl = `${secret.frontend_baseURL}/dashboard`;
      return {"access_token":getToken,"redirectUrl":redirectUrl};
    }
    


///////////////// login ///////////////////////////
authService.doLogin = async ({ email, password }) => {

  assertEvery([email, password], createError(StatusCodes.BAD_REQUEST,"Email and Password fields must exist"))
  const existingUser = await userModel.findOne({ 
    email,
    isDeleted:false
   });
   // user does not exist
   assert(existingUser,  createError(StatusCodes.BAD_REQUEST,"User does not exist",{"errorstatus":"1","redirectUrl":""}))
   const isValid = bcrypt.compareSync(password, existingUser.password);
// invalid password
  assert(isValid, createError(StatusCodes.UNAUTHORIZED, "Invalid password", {"errorstatus":"2","redirectUrl":""}));

 // account is deactivated
 assert(existingUser.isDeactivated == false, createError(StatusCodes.UNAUTHORIZED, "Your account is deactivated", {"errorstatus":"3","redirectUrl":""}));

  // email not verified condition
  assert(existingUser.is_email_verified == true, createError(StatusCodes.UNAUTHORIZED, "Pendig account verification, please verify your email", {"errorstatus":"4","redirectUrl":""}));

    

      let getToken;
  if(existingUser.role == 'superadmin')
  {
    
     // profile not completed
  if(existingUser.is_profile_completed == false)
  {

    // set token for authorization
    getToken = await jwtService.generatePair({
      _id:existingUser._id,
      role:existingUser.role,
      dashboardPermission:existingUser.dashboardPermission,
      organizationId:null,
      assignedLocationId:null
    });

     await userModel.findOneAndUpdate(
       { email},
       { token: getToken, updatedAt : Date.now()},
       { new: true }
     );
    const redirectURLcompany = `${secret.frontend_baseURL}/company-profile`;
    const userData = {
      msg: "Company Profile is not completed, please complete your company profile", 
      errorstatus:"5",
      redirectUrl:redirectURLcompany,
      access_token: getToken
    }
    return userData;
  }
  const getOrganization = await organizationModel.findOne({
    userId:existingUser._id
  })
   getToken = await jwtService.generatePair({
    _id:existingUser._id,
    role:existingUser.role,
    dashboardPermission:existingUser.dashboardPermission,
    organizationId:getOrganization._id,
    assignedLocationId:null
  });

  }
  else if(existingUser.role == 'root'){
    getToken = await jwtService.generatePair({
      _id:existingUser._id,
      role:existingUser.role,
      dashboardPermission:existingUser.dashboardPermission,
      organizationId:null,
      assignedLocationId:null
    });
  }
  else
  {
    const locationIdToSearch = await locationModel.findOne({ assignedUserId: { $elemMatch: { $eq: existingUser._id } } });
    getToken = await jwtService.generatePair({
      _id:existingUser._id,
      role:null,
      dashboardPermission:existingUser.dashboardPermission,
      organizationId:existingUser.userProfile.organizationId,
      assignedLocationId:locationIdToSearch._id
    });    
  }
 
      
      const updateToken = await userModel.findByIdAndUpdate(
        { _id:existingUser._id},
        { token: getToken, updatedAt : Date.now()},
        { new: true }
      );

      assert(updateToken, createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout"));

      const getUserData = await userModel.findOne({ email})
      .select('email role teamRoleId dashboardPermission token')
      .populate({
       path: 'teamRoleId',
       select: 'roleName permissions',
       populate: {
         path: 'permissions',
         select: 'moduleName read read_write actions',
       },
     })



    let permissions;
    let role;
    if (getUserData.role === 'superadmin' || getUserData.role === 'root') {
         permissions = {}; // Empty key for superadmin and root roles
        role = getUserData.role;
    } else if (getUserData.teamRoleId && getUserData.teamRoleId.permissions) {
         permissions = getUserData.teamRoleId.permissions; // Use teamrole's permissions if available
         role = getUserData.teamRoleId.roleName;
    } else {
         permissions = []; // Default to empty array if no permissions found
         role = "";
    }

      const userData = {
        email: getUserData.email,
        role,
        dashboardPermission: getUserData.dashboardPermission,
        permissions,
        access_token: getUserData.token
      }
  return userData;
};




/////////// change password ////////////////
authService.changePassword = async (id, data) => {
  const pass = data.password;
  const confirmPass = data.confirmPassword;
  const oldPass = data.oldPassword;
  assert(
    pass && confirmPass && oldPass,
    createError(
      StatusCodes.NOT_FOUND,
      "New password, confirm password and old password are required"
    )
  );
  
  const userData = await userModel.findOne({ _id: id, isDeleted: false});
  assert(
    userData,
    createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server")
  );
  const checkOldPass = bcrypt.compareSync(oldPass, userData.password);
  assert(
    checkOldPass,
    createError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Your old password is incorrect"
    )
  );

  const isMatch = pass === oldPass;
  assert(
    !isMatch,
    createError(
      StatusCodes.METHOD_NOT_ALLOWED,
      "You used this password recently, Please choose a different one."
    )
  );

  const check = pass === confirmPass;
  assert(
    check,
    createError(
      StatusCodes.CONFLICT,
      "password and confirm password don't match"
    )
  );
 
  const hashPass = bcrypt.hashSync(pass, 8);
  assert(
    hashPass,
    createError(StatusCodes.NOT_IMPLEMENTED, "error in implementing")
  );

  const updatePass = await userModel.findByIdAndUpdate(
    { _id: userData._id },
    {$set:{
      password: hashPass,
      updatedAt: Date.now()
   }},
    { new: true }
  ).select('email role');

  assert(
    updatePass,
    createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server")
  );

  return {"msg":"Password updated successfully"}
};



/////// Password Forget /////////

authService.forgetPass = async (data) => {
  assert(data.email, createError(StatusCodes.UNAUTHORIZED, "email required"));
  const userData = await userModel.findOne({ email: data.email, isDeleted: false });

    // user does not exist
    assert(userData,  createError(StatusCodes.BAD_REQUEST,"User does not exist",{"errorstatus":"1","redirectUrl":""}))
// email not verified condtion

assert(userData.is_email_verified == true, createError(StatusCodes.UNAUTHORIZED, "Pendig account verification, please verify your email", {"errorstatus":"4","redirectUrl":""}));
 
  const token = await jwtService.generateResetToken(data.email);
  const updateUser = await userModel.findOneAndUpdate(
    { email: data.email },
    { $set: { 
      resetToken: token,
      updatedAt: Date.now()
     }},
    { new: true }
  );
  assert(
    updateUser,
    createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server")
  );
  // send email

  const sendForgetpassEmail = await emailtemplate.sendForgetpassEmail(userData.email,token);

assert(sendForgetpassEmail == true, `Something went wrong, please try again!`);
return {"msg": "Reset Password email sent!"}

};



/////// Reset Pass after email verification /////////

authService.resetPass = async (data) => {
  assertEvery(
    [data.token, data.password, data.confirmPassword],
    createError(StatusCodes.BAD_REQUEST, 'Invalid Data: [token], [password] and [confirmPassword] fields must exist')
  );

  const token1 = data.token;
  const tokencheckreset = await userModel.findOne({
    resetToken: token1,
  });
  assert(
    tokencheckreset,
    createError(StatusCodes.UNAUTHORIZED, "Link Invalid or Expired")
  );
 
  await jwtService.verifyResetToken(token1); 
  
  const password = data.password;
  const confirmPassword = data.confirmPassword;
  assert(
    password == confirmPassword,
    createError(
      StatusCodes.UNAUTHORIZED,
      "Password and confirm Password don't match"
    )
  );
  const hash = bcrypt.hashSync(password, 8);
  const updatePass = await userModel.findOneAndUpdate(
    { email: tokencheckreset.email },
    { $set: { password: hash, resetToken: null } }
  );
  assert(
    updatePass,
    createError(StatusCodes.INTERNAL_SERVER_ERROR, "error in updating password")
  );
  return {"msg": "Password Updated Successfully"}
};


// resend confirmation email 

authService.resendVerificationemail = async ({email}) =>{
  assert(
    email,
    createError(
         StatusCodes.NOT_FOUND,
         "Email field must exists"
    )
);

const userData = await userModel.findOne({email});
assert(userData, createError(StatusCodes.NOT_FOUND, "User with this email does not exist"))
const token = await jwtService.generatePair(email);

    const result = await userModel.findOneAndUpdate(
     { email },
      { verificationToken: token, updatedAtt : Date.now()}
     );
     assert(result, createError(StatusCodes.REQUEST_TIMEOUT, "Request timeout"))
     const sendEmail = await emailtemplate.accountVerificationEmail(email, token);
     assert(sendEmail == true, `Something went wrong, please try again!`);
     return {"msg": "Verification email sent!"}
 
}

  export default authService;