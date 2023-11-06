import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import passport from 'passport';
import { secret } from '../../../config/secret';
import userModel from '../models';

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

     /** old code */
    //  passport.use(
    //    new JwtStrategy(opts, (payload, done) => {
    //     console.log(payload.data._id+'>>>>>>');
    //      return done(null, payload);
    //    })
    //  );



/**** new code */
     passport.use(
      new JwtStrategy(opts, (payload, done) => {
        // Query the database to check if the user and token are valid
        userModel.findById(payload.data._id, (err, user) => {
          if (err) {
            return done(err, false);
          }
       // if token is not null
          if (user && user.token !== null ) {
            return done(null, payload);
          } else {
            return done(null, false);
          }
        });
      })
    );
   };
   
   export const isLoggedIn = (req, res, next) => {
     return passport.authenticate('jwt', { session: false })(req, res, next);
   };
