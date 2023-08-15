import jwt from "jsonwebtoken";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../config/index.js";
import RefreshToken from "../models/token.js";

class JwtServices {
  //signAccessToken
  static signAccessToken(payload, expiryTime) {
    return jwt.sign(payload, ACCESS_TOKEN, { expiresIn: expiryTime });
  }
  //signRefreshToken
  static signRefreshToken(payload, expiryTime) {
    return jwt.sign(payload, REFRESH_TOKEN, { expiresIn: expiryTime });
  }
  //verifyAccessToken
  static verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN);
  }
  //verifyRefreshToken
  static verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN);
  }
  //storeRefreshToken
  static async storeRefreshToken(token, userId) {
    try {
      const newToken = new RefreshToken({
        userId: userId,
        token: token,
      });
      await newToken.save();
    } catch (error) {
      return next(error);
    }
  }
}

export default JwtServices;
