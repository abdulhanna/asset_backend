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
     res.clearCookie('access_token');
     const user = userModel.findByIdAndUpdate(
          {_id:req.user.data._id},
          {token: null},
          );
};
