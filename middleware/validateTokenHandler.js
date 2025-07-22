import asyncHandler from 'express-async-handler'
import  jwt  from 'jsonwebtoken';



const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  // console.log("VALIDATING",req.url)
  const exludedRoutes=['/api/login','/api/user/login','/api/user/register']

  if(exludedRoutes.includes(req.url)){
    console.log("NOT ALLOWED")
    next()
  }

  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("User is not authorized");
      }
      req.user = decoded.user;
      next();
    });

    if (!token) {
      res.status(401);
      throw new Error("User is not authorized or token is missing");
    }
  }
});

export default validateToken