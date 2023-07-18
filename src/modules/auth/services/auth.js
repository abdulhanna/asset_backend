import StatusCodes from "http-status-codes";
import createError from "http-errors-lite";
import bcrypt from "bcryptjs";
import { assert, assertEvery } from "../../../helpers/mad-assert";
import jwtService from "./jwt-services";
import emailtemplate from "../../../helpers/send-email"
import userModel from "../models/"

const authService = {};


// user registration
authService.doRegister = async (data) => {

    const role = 'superadmin';   // on comapany onboard default role will be superadmin

    assertEvery(
      [data.email, data.password, data.confirmPassword],
      createError(
        StatusCodes.BAD_REQUEST,
        "Invalid Data: [email], [password] and [confirmPassword] fields must exist"
      )
    );

    assert(
      data.password == data.confirmPassword,
      createError(
        StatusCodes.UNAUTHORIZED,
        "Password and confirm Password don't match"
      )
    );
  

    const existingUser = await userModel.findOne({ email: data.email });
    assert(!existingUser, 'Account already exists');
    
    const token = await jwtService.generatePair(data.email);
    const access_token = token.access_token;
    const hashedPassword = bcrypt.hashSync(data.password, 8);
    const sendEmail = await emailtemplate.sendEmail(data.email, access_token)
     assert(sendEmail == true , `Something went wrong, please try again!`)
     
   const result = await userModel.create({
        ...data,
        password: hashedPassword,
        role: role,
        token: access_token,
      });
     return result;
  };
  


// email confirmation

authService.verifyUser = async (token) => {
  const userToken = token;
  const usercheckVerify = await userModel.findOne({
    token: userToken,
    isDeleted: false,
    is_email_verified: true,
    is_profile_completed: true,
  });


  assert(
    !usercheckVerify,
    createError(StatusCodes.BAD_REQUEST, "email already verified")
  );

  const user = await userModel.findOne({
    token,
  });

  assert(user, createError(StatusCodes.NOT_FOUND, "User not found"));

  const result = await userModel.findOneAndUpdate(
    { token },
    { is_email_verified: "true" },
    { new: true }
  );
  return result;

}






  export default authService;