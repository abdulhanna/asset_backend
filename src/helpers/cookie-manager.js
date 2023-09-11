import userModel from '../../src/modules/auth/models/';
export const attachCookie = (res, { access_token: accessToken }) => {
     res.cookie('access_token', accessToken, {
          domain: "https://api.asset.dev.client.kloudlite.io",
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
          secure: false,
          path: "/",
     });
};

export const revokeCookie = async (req, res) => {
     res.clearCookie('access_token');
     const user = userModel.findByIdAndUpdate(
          {_id:req.user.data._id},
          {token: null},
          );
};
