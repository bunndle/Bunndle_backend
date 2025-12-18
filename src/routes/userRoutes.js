import express from "express";
import authMiddleware from "../middleware/auth_validate.js";
import {
  registerUser,
  loginUser, forgotPassword,
  verifyOtp, resetPassword, 
  getUserProfile
}from "../controllers/usercontroller.js";



const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile",authMiddleware,getUserProfile)
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp)
router.post("/reset-password", resetPassword);



export default router;