import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import passport from 'passport';
import { secret } from '../../../config/secret';

const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

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
