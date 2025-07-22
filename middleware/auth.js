import  {serialize}  from "cookie";
import Jwt from "jsonwebtoken";
import UserSchema from "../models/userModel.js";



export const cookieSetter = (res, set, token) => {
  res.setHeader(
    "Set-Cookie",
    serialize("token", set ? token : "", {
      httpOnly: true,
      path: "/",
      maxAge: set ? 15 * 24 * 60 * 100 : 0,
    })
  );
};

export const GentrateToken = (_id) => {
  return Jwt.sign({ _id }, process.env.JWT_SECRET);
};

export const checkAuth = async (req) => {
  const cookie = req.headers?.authorization;
  if (!cookie) return null;
  const token = cookie.split(" ")[1];
  const decode = Jwt.verify(token, process.env.JWT_SECRET);
  return await UserSchema.findById(decode._id);
};

export const authorizeRoles = (requiredRole) => {
  return async (req, res, next) => {
    const { role } = req.body;

    try {
      if (role !== requiredRole) {
        return res.status(403).json({
          message:
            "You do not have the required role to perform this action...",
        });
      }
      next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  };
};
