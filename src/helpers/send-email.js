import { secret } from '../config/secret';
import sgMail from '@sendgrid/mail';

const emailtemplate = {};

emailtemplate.accountVerificationEmail = async (toemail, token) => {
     sgMail.setApiKey(secret.sendgrid.api_key);
     const msg = {
          to: toemail, // Change to your recipient
          from: secret.sendgrid.from_user, // Change to your verified sender
          subject: 'Please confirm your account on Asset Monitoring',
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
            <p style="font-size: 18px; font-weight:400; color: rgba(255, 255, 255, 0.9); width: 570px; margin: 0 auto; text-align: center; padding-top: 20px; line-height: 28px;">
            To ensure the security of your account and provide you with a seamless experience, we need to verify your email address.</p>
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
     const sendEmail = await sgMail.send(msg);
     if (sendEmail) return true;
     else return false;
};

emailtemplate.sendInvitationEmail = async (email, verificationToken) => {
     try {
          sgMail.setApiKey(secret.sendgrid.api_key);

          const message = {
               to: email,
               from: secret.sendgrid.from_user, // Change to your verified sender
               subject: 'Invitation to Set Password',
               html: `<p>Hello,</p><p>You have been invited to set your password. Click the following link to set your password:</p>
        <a href="${secret.frontend_baseURL}/set-password/${verificationToken}">Set Password</a>`,
          };

          await sgMail.send(message);
          console.log('Invitation email sent successfully.');
     } catch (error) {
          console.error('Error sending invitation email:', error);
          throw new Error('Failed to send invitation email');
     }
};


emailtemplate.sendForgetpassEmail = async (email, resetToken) => {
  sgMail.setApiKey(secret.sendgrid.api_key);
  const msg = {
    to: email, // Change to your recipient
    from: secret.sendgrid.from_user, // Change to your verified sender
    subject: "Forgot Password ",
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
            <p style="font-size: 18px; font-weight: 400; color: rgba(255, 255, 255, 0.9); padding-top: 52px; width: 570px; margin: 0 auto; text-align: center; padding-top: 20px; line-height: 28px;">Hi ${email},</p>
          </td>
        </tr>
        <tr>
          <td align="center">
            <p style="font-size: 18px; font-weight:400; color: rgba(255, 255, 255, 0.9); width: 570px; margin: 0 auto; text-align: center; padding-top: 20px; line-height: 28px;">You’re receiving this message because you requested a password reset for your Asset Monitoring account.<br>
              Choose a new password by clicking the button below.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 52px 0;">
              <a href="${secret.frontend_baseURL}/forgot-password?resetToken=${resetToken}" style="background-color: #F97316; padding: 16px 26px 16px 26px; border-radius: 8px; font-weight: 400;
               color: #fff; font-size: 18px; text-decoration: none;">Reset Password</a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom: 80px;">
            <p style="font-size: 18px; color: rgba(255, 255, 255, 0.5); font-weight: 400; margin-bottom: 10px;">This link will expire in 1 hour. If you have questions,</p>
            <a href="#" style="color: rgba(255, 255, 255, 0.9); font-size: 18px;">we’re here to help. </a>
          </td>
        </tr>
      </tbody>
   </table>
</body>
</html>`,
};
const forgetpassEmail = await sgMail.send(msg);
if (forgetpassEmail) return true;
else return false;
};


export default emailtemplate;
