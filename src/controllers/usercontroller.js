import userModel from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

import sendOTPEmail from "../utils/email.js"
import generateOTP  from "../utils/otp.js";
import resetCookieOptions  from "../config/cookieOptions.js";
import otpTemplate from "../utils/otpTemplate.js";
import sendEmail from "../utils/email.js";
import adminEmailTemplate from "../utils/adminEmailTemplate.js";
import userThankYouTemplate  from "../utils/userThankYou.js";


import { DEFAULT_OTP, hashOtp} from "../utils/otp_temp.js";


export async function registerUser(req, res) {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        message: "Name, phone, email and password are required",
      });
    }

    // 🔍 Check email or phone already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      name,           // ✅ duplicate allowed
      phone,
      email,
      password: hashedPassword,
    });

    // 🎟️ Generate JWT
    const token = jwt.sign(
      { id: email },
      config.jwtSecret,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
    });

  } catch (error) {
    // ✅ Handle Mongo duplicate key error safely
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `${field} already exists`,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}


export async function loginUser(req,res){
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if(!user){
      return res.status(404).json({ message: "User not found " });
      }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, config.jwtSecret);
    res.status(200).json({ message: "User logged in successfully", token });
}
catch (error) {
  res.status(500).json({ error: error.message });

}
}



export async function getUserProfile(req, res) {
      try {

        const token=req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await userModel.findById(decoded.id);
        res.status(200).json({ message: "User profile fetched successfully", id:user._id,name:user.name,phone:user.phone,email:user.email });
        
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
}



/**
 * STEP 1️⃣ Forgot Password
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found, Register first" });
  }

  const otp = generateOTP();
  user.resetOtpHash = await bcrypt.hash(otp, 10);
  user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetToken = jwt.sign(
    {email: user.email, userId: user._id, type: "password_reset" },
    config.reset_scrt,
    { expiresIn: "10m" }
  );

  await sendOTPEmail(email,"Your Password Reset OTP",  otpTemplate(otp));

  res
    .cookie("reset_token", resetToken, {
      ...resetCookieOptions,
      maxAge: 10 * 60 * 1000,
    })
    .json({ message: "OTP sent to email" });
};

/**
 * STEP 2️⃣ Verify OTP
 */
export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const token = req.cookies.reset_token;
  console.log(token)

  if (!token) return res.status(401).json({ message: "Session expired" });

  const payload = jwt.verify(token, process.env.RESET_SECRET);
  if (payload.type !== "password_reset") {
    return res.status(403).json({ message: "Invalid token" });
  }

  const user = await userModel.findById(payload.userId);
  const valid =
    user &&
    user.resetOtpExpiry > Date.now() &&
    (await bcrypt.compare(otp, user.resetOtpHash));

  if (!valid) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const verifiedToken = jwt.sign(
    { userId: user._id, type: "password_reset_verified" },
    process.env.RESET_SECRET,
    { expiresIn: "5m" }
  );

  res
    .cookie("reset_token", verifiedToken, {
      ...resetCookieOptions,
      maxAge: 5 * 60 * 1000,
    })
    .json({ message: "OTP verified" });
};

/**
 * STEP 3️⃣ Reset Password
 */
export const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const token = req.cookies.reset_token;

  if (!token) return res.status(401).json({ message: "Session expired" });

  const payload = jwt.verify(token, process.env.RESET_SECRET);
  if (payload.type !== "password_reset_verified") {
    return res.status(403).json({ message: "OTP not verified" });
  }

  const user = await userModel.findById(payload.userId);

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetOtpHash = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  res.clearCookie("reset_token").json({
    message: "Password reset successful"
  });
};





export const quickConnect = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }


    // 📩 Send email to admin
    await sendEmail(
      config.email,
      "New Quick Connect Request",
      adminEmailTemplate({ name, phone, email, message })
    );

    // 📧 Send confirmation to user
    await sendEmail(
      email,
      "Thank you for choosing us",
      userThankYouTemplate({ name })
    );

    res.status(200).json({
      message: "Request submitted successfully. We will contact you soon.",
      name,
      email,
      phone,
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};






// Mobile OTP Generation F


export const sendLoginOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number required",
      });
    }

    // 🔍 Check user existence
    const user = await userModel.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first.",
      });
    }

    // ✅ Set DEFAULT OTP
    user.resetOtpHash = hashOtp(DEFAULT_OTP);
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins

    await user.save();

    // 🔔 For now (DEV only)
    console.log("LOGIN OTP:", DEFAULT_OTP);

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const verifyLoginOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: "Phone and OTP required",
      });
    }

    // 🔴 IMPORTANT FIX IS HERE
    const user = await userModel.findOne({ phone })
      .select("+resetOtpHash +resetOtpExpiry");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.resetOtpHash || !user.resetOtpExpiry) {
      return res.status(400).json({
        message: "OTP not requested or session expired",
      });
    }

    if (user.resetOtpExpiry.getTime() < Date.now()) {
      return res.status(400).json({
        message: "Session expired",
      });
    }

    if (user.resetOtpHash !== hashOtp(otp)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // ✅ clear OTP after success
    user.resetOtpHash = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
