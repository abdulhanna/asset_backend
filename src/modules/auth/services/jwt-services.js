import { secret } from "../../../config/secret";
import { sign, verify } from 'jsonwebtoken';

const jwtService = {};

const signToken = (data, secret, expiry) =>
  new Promise((resolve, reject) => {
    sign({ data }, secret, { expiresIn: expiry }, (err, token) => {
      if (err) {
        console.log('ERR:', err.message);
        return reject(err);
      }
      return resolve(token);
    });
  });

const verifyToken = (token, secret) =>
  new Promise((resolve, reject) => {
    verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      return resolve(decoded);
    });
  });

jwtService.generatePair = async (data) => {
  const accessToken = await signToken(data, secret.JWT_KEY, '86400000');
  return accessToken ;
};

jwtService.verifyAccessToken = async (token) => {
  return verifyToken(token, secret.JWT_KEY);
};

export default jwtService;

