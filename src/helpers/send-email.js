import { secret } from "../config/secret";
import sgMail from "@sendgrid/mail";

const emailtemplate = {}

emailtemplate.accountVerificationEmail = async (toemail, token) => {
    sgMail.setApiKey(secret.sendgrid.api_key);
    const msg = {
      to: toemail, // Change to your recipient
      from:secret.sendgrid.from_user, // Change to your verified sender
      subject: "Please confirm your account on Asset Monitoring",
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Confirm Template</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      margin: 0px;
      padding: 0px;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      -ms-box-sizing: border-box;
      box-sizing: border-box;
      font-size: 17px;
      background-color: #9A3412 ;
      /* font-family: 'Poppins', sans-serif; */
    }

    *,
    html {
      margin: 0px;
      padding: 0px;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      -ms-box-sizing: border-box;
      box-sizing: border-box;

    }
  </style>
</head>
<body>
   <table width="100%" bgColor="#9A3412" align="center" cellpadding="0" cellspacing="0" border="0">
      <tbody>
        <tr>
          <td align="center" style="padding-top: 80px;"><img src="#"></td>
        </tr>
        <tr>
          <td align="center">
            <p style="font-size: 36px; font-weight: 700; color: #fff; padding-top: 52px;">Welcome ${toemail}</p>
          </td>
        </tr>
        <tr>
          <td align="center">
            <p style="font-size: 18px; font-weight:400; color: rgba(255, 255, 255, 0.9); width: 570px; margin: 0 auto; text-align: center; padding-top: 20px; line-height: 28px;">You’re receiving this message because you recently signed up for a account on Asset-Monitoring Software.<br>
              Confirm your email address by clicking the button below. This step adds extra security to your profile by verifying you own this email.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 52px 0;">
              <a href="${secret.frontend_baseURL}/confirm?confirmation_token=${token}" style="background-color: #F97316; padding: 16px 26px 16px 26px; border-radius: 8px; font-weight: 400;
               color: #fff; font-size: 18px; text-decoration: none;">Confirm your email</a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom: 80px;">
            <a href="#" style="color: rgba(255, 255, 255, 0.9); font-size: 18px;">we’re here to help. </a>
          </td>
        </tr>
      </tbody>
   </table>
</body>
</html>`,
    };
      const sendEmail =  await sgMail.send(msg)
      if(sendEmail) return true
  else return false
};


export default emailtemplate;


