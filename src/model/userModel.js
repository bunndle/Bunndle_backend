import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // ✅ duplicate allowed
    },

    phone: {
      type: String,
      
      unique: true, // ✅ must be unique
      index: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true, // ✅ must be unique
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
  
      select: false, // 🔒 never return password by default
    },
    dob: {
      type: Date, // ✅ DOB field
    },
    profileImage: {
      type: String,
    },
    profileImageId: {
      type: String, // ImageKit fileId (for delete/replace later)
    },

    // 🔐 Forgot / Reset password support
    resetOtpHash: {
      type: String,
      select: false, // 🔒 hide from queries
    },

    resetOtpExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;


















// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     phone: {
//       type: String,
//       unique: true,
//       sparse: true, // ✅ allows null for Google users
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       index: true,
//     },

//     password: {
//       type: String,
//       select: false,
//       required: function () {
//         return this.authProvider === "local"; // ✅ required ONLY for normal signup
//       },
//     },

//     // 🔐 AUTH PROVIDER
//     authProvider: {
//       type: String,
//       enum: ["local", "google"],
//       default: "local",
//     },

//     googleId: {
//       type: String,
//       index: true,
//     },

//     dob: Date,

//     profileImage: String,
//     profileImageId: String,

//     resetOtpHash: {
//       type: String,
//       select: false,
//     },

//     resetOtpExpiry: Date,
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);
