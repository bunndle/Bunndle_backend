import express from "express";
import authMiddleware from "../middleware/auth_validate.js";
import {
  registerUser,
  loginUser, 
  forgotPassword,
  verifyOtp, 
  resetPassword, 
  getUserProfile,
  quickConnect,
  sendLoginOtp,
  verifyLoginOtp
}from "../controllers/usercontroller.js";



const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile)
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp)
router.post("/reset-password", resetPassword);
router.post("/connect",authMiddleware,quickConnect);



router.post("/send-otp", sendLoginOtp);
router.post("/verify-otp", verifyLoginOtp);




export default router;