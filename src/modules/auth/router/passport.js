import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import passport from 'passport';
import { secret } from '../../../config/secret';
import userModel from '../models';

// Function to extract JWT from cookies

/***** Old code */
// const extractJwtFromCookies = (req) => {
//      const cookieName = 'access_token'; // Replace this with the actual name of your JWT cookie
//      const cookieValue = req.cookies[cookieName];
//      return cookieValue || null;
//    };

/***** new code */
   const extractJwtFromCookies = (req) => {
    const cookieName = 'access_token'; // Replace this with the actual name of your JWT cookie
    const cookieValue = req.cookies[cookieName];
  
    if (cookieValue) {
      // Check if the token is still valid in the schema
      userModel.findOne({ token: cookieValue }, (err, user) => {
        if (err || !user) {
          // Token is invalid or user not found, remove the cookie
          res.clearCookie(cookieName);
          return null;
        }
      });
  
      return cookieValue;
    }
  
    return null;
  };
   
   const opts = {};
   
   // Use custom function to extract JWT from cookies
   opts.jwtFromRequest = extractJwtFromCookies;
   
   opts.secretOrKey = secret.JWT_KEY;
   
   export const initPassport = () => {
     passport.use(
       new JwtStrategy(opts, (payload, done) => {
         return done(null, payload);
       })
     );
   };
   
   export const isLoggedIn = (req, res, next) => {
     return passport.authenticate('jwt', { session: false })(req, res, next);
   };
