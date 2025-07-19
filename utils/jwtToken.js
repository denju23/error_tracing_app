import { serialize } from "cookie";
import Jwt from "jsonwebtoken";


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




