import Joi from "joi";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import UserDTO from "../DTO/userDto.js";
import JwtServices from "../services/JWTservices.js";
import RefreshToken from "../models/token.js";
const passwordPattren =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[ -/:-@\[-`{-~]).{6,64}$/;
const authController = {
  //register method
  async register(req, res, next) {
    //validate user input by using Joi
    const userRegisterSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattren).required(),
      confirmpassword: Joi.ref("password"),
    });
    //validate registerSchema
    const { error } = userRegisterSchema.validate(req.body);
    //if error occurs middleware will handle it
    if (error) {
      return next(error);
    }
    const { username, name, email, password } = req.body;

    //password hashing by using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    //managing email and username confict
    try {
      const emailInUse = await User.exists({ email });
      const usernameInUse = await User.exists({ username });
      if (emailInUse) {
        const error = {
          status: 409,
          message: "email Is Already in use please use anOther email!!!",
        };
        return next(error);
      }
      if (usernameInUse) {
        const error = {
          status: 409,
          message:
            "username is not available please choose anOther username!!!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //save register in database
    let user;
    try {
      const userToRegiseter = new User({
        username,
        name,
        email,
        password: hashedPassword,
      });
      user = await userToRegiseter.save();
    } catch (error) {
      return next(error);
    }
    //genrating tokens
    const accessToken = JwtServices.signAccessToken({ _id: user._id }, "30m");
    const refreshToken = JwtServices.signRefreshToken({ _id: user._id }, "60m");
    //store refreshToken
    await JwtServices.storeRefreshToken(refreshToken, user._id);
    //sending tokens to the cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    //sending response
    return res.status(201).json({ user, auth: true });
  },
  //login controller
  async login(req, res, next) {
    //validate user input
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattren).required(),
    });
    //valiate userLoginSchema
    const { error } = userLoginSchema.validate(req.body);
    //if error occurs middleWare will handle it
    if (error) {
      return next(error);
    }
    const { username, password } = req.body;
    //fetching username and password from database and matching
    let user;
    try {
      user = await User.findOne({ username });
      if (!user) {
        const error = {
          status: 401,
          message: "invalid username!!!",
        };
        return next(error);
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: "invalid password!!!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //genrate token
    const accessToken = JwtServices.signAccessToken({ _id: user._id }, "30m");
    const refreshToken = JwtServices.signRefreshToken({ _id: user._id }, "60m");
    //update refresh token to the database
    try {
      await RefreshToken.updateOne(
        { _id: user._id },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }
    //sending tokens to the cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    const userDto = new UserDTO(user);
    //sending response
    res.status(200).json({ user: userDto, auth: true });
  },

  //logOut method

  async logout(req, res, next) {
    //fetch refresh token from cookies
    const { refreshToken } = req.cookies;
    //delete refresh token from database
    let user;
    try {
      user = await RefreshToken.deleteOne({ token: refreshToken });
    } catch (error) {
      return next(error);
    }
    //clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    //sending response
    res.status(200).json({ user: null, auth: false });
  },

  async refresh(req, res, next) {
    //fetch refresh toke from cookies
    const originalRefreshToken = req.cookies.refreshToken;
    //verify refreshToken
    let _id;
    try {
      _id = await JwtServices.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 409,
        message: "UnAuthorized!!!",
      };
      return next(error);
    }
    //match refresh Token to the database
    try {
      const match = await RefreshToken.findOne({
        _id: _id,
        token: originalRefreshToken,
      });
      if (!match) {
        const error = {
          status: 409,
          message: "unAuthorized!!!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //genrate tokens
    try {
      const accessToken = JwtServices.signAccessToken({ _id: _id }, "30m");
      const refreshToken = JwtServices.signRefreshToken({ _id: _id }, "60m");
      //update refresh toke to the database
      await RefreshToken.updateOne({ _id: _id }, { token: refreshToken });
      //sending tokens to the cookies
      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (error) {
      return next(error);
    }
    //sending response
    const user = await User.findOne({ _id });
    const userDto = new UserDTO(user);
    res.status(200).json({ user: userDto, auth: true });
  },
};

export default authController;
