import  userModel  from '../../src/modules/auth/models/'
import { config } from '../config/config';
export const attachCookie = (
  res,
  { access_token: accessToken}
) => {
  res.cookie('access_token', accessToken, {
    httpOnly: config.cookie.http_only,
    secure: config.cookie.secure,
    samesite: config.cookie.same_site,
    path: config.cookie.path,
  });
};

export const revokeCookie = async (req, res) => {
  res.clearCookie('access_token');
  const user = userModel.findById(req.userId);
  user.token = null;
  user.save();
};
