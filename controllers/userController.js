import { asyncError } from "../middleware/catchAsyncError.js";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import Joi from "joi";
import { errorHandler } from "../middleware/error.js";
import { GentrateToken, cookieSetter, checkAuth } from "../middleware/auth.js";
import nodeMailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../middleware/logger.js";

//@desc Register user
//@route POST /api/user/register
const registerUser = asyncError(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const RegisrationValidation = Joi.object({
      username: Joi.string().trim().min(3).max(30).required().messages({
        "string.base": "User name should be a type of a 'text' ",
        "string.empty": "User name can not be empty field",
        "string.min": "User name should have a minimum length of 3",
        "string.max": "User name should have maximum length of 30",
        "any.required": "User name is required field",
      }),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .messages({
          "string.base": "User Email should be type of 'text'",
          "string.empty": "User Email can not be empty filed",
          "any.required": "User Email is a required",
        }),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9#?!@$%^&*-]{8,30}$"))
        .error(new Error("password should be min 8 and max 30"))
        .required(),
    });

    const { error } = RegisrationValidation.validate(req.body);

    if (error) {
      return errorHandler(res, 400, error?.message);
    }

    if (!username || !email || !password) {
      return errorHandler(res, 400, "All fields are mandatory!");
    }
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
      return errorHandler(res, 400, "User already registered!!");
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = GentrateToken(user._id);

    res.status(201).json({
      data: {
        message: "Registration Done Successfully 😍",
      },
      status: true,
      statusCode: 201,
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Login user
//@route POST /api/user/login
const loginUser = asyncError(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorHandler(res, 400, "all filed are requried 🤦‍♂️");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return errorHandler(res, 400, "Invalid Email and Password 😒");
    }
    const isMatch = await bcrypt.compare(password, user?.password);

    if (!isMatch) {
      return errorHandler(res, 400, "invalid Password😒");
    }

    const token = GentrateToken(user._id);
    cookieSetter(res, true, token);

    const Loginvalidation = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .messages({
          "string.base": "User Email should be type of 'text'",
          "string.empty": "User Email can not be empty filed",
          "any.required": "User Email is a required",
        }),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9#?!@$%^&*-]{8,30}$"))
        .error(new Error("password should be min 8 and max 30"))
        .required(),
    });

    const { error } = Loginvalidation.validate(req.body);
    if (error) {
      return errorHandler(res, 400, error?.message);
    }

    res.status(200).json({
      data: {
        message: `Welcome back, ${user.username}`,
        access_token: token,
        result: user,
      },
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    console.log(error, "login error");
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Logout user
//@route GET /api/user/logout

const logoutUser = asyncError(async (req, res) => {
  try {
    cookieSetter(res, false, null);
    res.status(200).json({
      data: { message: "Log out succesfully 👍" },
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Current user
//@route GET /api/user/current

const currentUser = asyncError(async (req, res) => {
  try {
    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "unathoraized access");
    }
    const getCurrentLoginUser = await User.findById(user._id).populate(
      "Projects"
    );
    res.status(200).json({
      status: true,
      statusCode: 200,
      data: { message: "User Retrived", result: getCurrentLoginUser },
    });
  } catch (error) {
    return errorHandler(res, 400, `${error.message}`);
  }
});

//@desc ChangePassword
//@route PUT /api/user/ChangePassword
const ChangePassword = asyncError(async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const {
      query: { id },
    } = req;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return errorHandler(res, 400, "all filed are required");
    }
    const user = await checkAuth(req);

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return errorHandler(res, 400, "all field are reqired");
    }

    const getChangePass = await User?.findById(user?._id).select("+password");
    const isPasswordMatched = await getChangePass.comparePassword(oldPassword);
    if (!isPasswordMatched) {
      return errorHandler(res, 400, "old Password is incorrect");
    }

    if (!getChangePass) {
      return errorHandler(res, 400, "Can not find user");
    }

    if (oldPassword === newPassword) {
      return errorHandler(
        res,
        400,
        "The new password needs to be different from the old one."
      );
    }

    if (newPassword !== confirmNewPassword) {
      return errorHandler(res, 400, "New and confirm Password must be same");
    }

    const decreppassword = await bcrypt.hash(confirmNewPassword, 10);

    let getUpdatedData;

    if (req.method === "PUT") {
      getUpdatedData = await User.findByIdAndUpdate(
        getChangePass?._id,
        {
          $set: {
            password: decreppassword,
          },
        },
        { useFindAndModify: false, new: true }
      );
    }
    res.status(200).json({
      data: {
        message: "Your password has been changed successfully",
        // result: getUpdatedData,
      },
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc ForgotPassword
//@route POST /api/user/ForgotPassword

const ForgotPassword = asyncError(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorHandler(res, 400, "all field are required");
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return errorHandler(res, 400, "email is not registered yet");
    }
    let nodemailer = nodeMailer;
    let transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      auth: {
        user: process.env.USEREMAIL,
        pass: process.env.PASSWORD,
      },
      secure: true,
    });

    const uuid = uuidv4();
    const resetToken = uuid;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
    user.save();

    const resetPasswordUrl = `http://localhost:4000/api/user/resetpassword/${resetToken}`;

    const mailData = {
      from: process.env.USEREMAIL,
      to: user.email,
      subject: `Password Link`,
      text: "Hello " + " | sent From:" + "Hello",
      html: `<div>RESET PASSWORD URL  <a  href=${resetPasswordUrl}>  Reset password url ${resetPasswordUrl}  </a>  </div>`,
    };

    transporter.sendMail(mailData, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    res.status(200).json({
      data: {
        message: `email send ${user.email}`,
        resetPassowrdToken: resetToken,
        result: user,
      },
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc resetpassword
//@route PUT /api/user/resetpassword
const resetpassword = asyncError(async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;

    // const {
    //   query: { id },
    // } = req;

    const { token } = req.params;

    if (!newPassword || !confirmNewPassword) {
      return errorHandler(res, 400, "all filed are reqired");
    }

    if (newPassword !== confirmNewPassword) {
      return errorHandler(res, 400, "Password Doesn't match");
    }
    // console.log(token, "id");
    const resetPasswordToken = token;
    // console.log(resetPasswordToken, "resetpassworfd token ");
    const getReset = await User?.findOne({
      resetPasswordToken: token,
    }).select("password");
    console.log(getReset, "getreste");
    let getUpdatedData;

    const hasedPassword = await bcrypt.hash(confirmNewPassword, 10);
    console.log(hasedPassword, "decrptpasword");

    if (req.method === "PUT") {
      getUpdatedData = await User.findByIdAndUpdate(
        getReset._id,
        {
          $set: {
            password: hasedPassword,
          },
        },
        { useFindAndModify: false, new: true }
      );
    }

    res.status(201).json({
      data: {
        message: "password reset successfully",
        //  result: getUpdatedData
      },
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  currentUser,
  ChangePassword,
  ForgotPassword,
  resetpassword,
};
