import JwtServices from "../services/JWTservices.js";
import User from "../models/user.js";
import UserDTO from "../DTO/userDto.js";

const auth = async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken || !refreshToken) {
    const error = {
      status: 401,
      message: "UnAutorized!!!",
    };
    return next(error);
  }
  //verifyAccess Token
  let _id;
  try {
    _id = JwtServices.verifyAccessToken(accessToken)._id;
  } catch (error) {
    return next(error);
  }
  let user;
  try {
    user = await User.findOne({ _id: _id });
  } catch (error) {
    return next(error);
  }
  const userDto = new UserDTO(user);
  req.user = userDto;
  next();
};

export default auth;
