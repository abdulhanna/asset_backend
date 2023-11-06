import userModel from '../../src/modules/auth/models/';
import { config } from '../config/config'
export const attachCookie = (res, { access_token: accessToken }) => {
     res.cookie('access_token', accessToken, {
          domain: config.cookie.domain,
          maxAge: config.cookie.max_age,
          httpOnly: config.cookie.http_only,
          secure: config.cookie.secure,
          path: config.cookie.path,
     });
};

export const revokeCookie = async (req, res) => {
      const userId = req.user.data._id;
        const user =   await userModel.findOneAndUpdate(
               { userId},
               { token: null, updatedAt : Date.now()},
               { new: true }
             );
          res.clearCookie('access_token');
};
