import express from 'express';
import {registerUser,loginUser, logoutUser,currentUser,ChangePassword,ForgotPassword,resetpassword} from '../controllers/userController.js';
import { checkAuth } from '../middleware/auth.js';

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout",logoutUser)

router.get("/current",currentUser);

router.put("/ChangePassword",ChangePassword)

router.put("/resetpassword/:token",resetpassword)

// router.put("/resetpassword",resetpassword)

router.post("/ForgotPassword",ForgotPassword)

export default router

