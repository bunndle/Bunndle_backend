import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,              // ✅ duplicate allowed
    },

    phone: {
      type: String,
      required: true,
      unique: true,            // ✅ must be unique
      index: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,            // ✅ must be unique
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,           // 🔒 never return password by default
    },

    // 🔐 Forgot / Reset password support
    resetOtpHash: {
      type: String,
      select: false,           // 🔒 hide from queries
    },

    resetOtpExpiry: {
      type: Date,
    },

  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
