import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import passport from 'passport';
import { secret } from '../../../config/secret';

// Function to extract JWT from cookies
const extractJwtFromCookies = (req) => {
     const cookieName = 'access_token'; // Replace this with the actual name of your JWT cookie
     const cookieValue = req.cookies[cookieName];
     return cookieValue || null;
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
   
   
   
