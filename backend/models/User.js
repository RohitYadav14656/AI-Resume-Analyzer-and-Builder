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
    role: {
      type: String,
      enum: ["user", "admin", "moderator", "support"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    subscription: {
      type: String,
      enum: ["free", "normal", "pro", "enterprise"],
      default: "normal",
    },
    aiCredits: {
      type: Number,
      default: 10,
    },
    lastDailyCreditBonus: {
      type: Date,
      default: null,
    },
    aiUsageCount: {
      type: Number,
      default: 0,
    },
    firstLogin: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    failedLogins: {
      type: Number,
      default: 0,
    },
    permissions: [
      {
        type: String,
      },
    ],

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

    // ── Profile & AI Customization ──────────────────────────────────────────
    headline: {
      type: String,
      default: "",
      trim: true,
    },
    university: {
      type: String,
      default: "",
      trim: true,
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    github: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    aiPersonalization: {
      type: Boolean,
      default: true,
    },
    notificationPreferences: {
      emailAlerts: { type: Boolean, default: true },
      resumeTips: { type: Boolean, default: true },
      weeklySummary: { type: Boolean, default: false },
    },
    recentActivity: [
      {
        action: { type: String, required: true },
        description: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
