const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Optional — Google users have no password
      default: null,
    },

    // ── Google OAuth ────────────────────────────────────────────────────────
    googleId: {
      type: String,
      default: null,
      sparse: true,   // allows null + unique index to coexist
    },

    // ── Email Verification ──────────────────────────────────────────────────
    // default: true  → protects existing DB users from being locked out.
    // New email signups are explicitly set to false in the register route.
    // Google users are explicitly set to true (Google already verified the email).
    isVerified: {
      type: Boolean,
      default: true,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    // ── Password Reset (from previous feature) ──────────────────────────────
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
