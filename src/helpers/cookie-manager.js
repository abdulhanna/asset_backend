import userModel from '../../src/modules/auth/models/';
export const attachCookie = (res, { access_token: accessToken }) => {
     res.cookie('access_token', accessToken, {
          httpOnly: true,
          secure: false,
          samesite: 'strict',
          path: '/',
     });
};

export const revokeCookie = async (req, res) => {
     res.clearCookie('access_token');
     const user = userModel.findById(req.userId);
     user.token = null;
     user.save();
};
