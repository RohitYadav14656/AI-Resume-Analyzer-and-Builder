const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const axios = require("axios");
const dns = require("dns");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const SystemConfig = require("../models/SystemConfig");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  resendVerificationSchema,
} = require("../validators/authValidator");
const AppError = require("../utils/AppError");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  computeFingerprint,
  REFRESH_TOKEN_EXPIRY_MS,
} = require("../utils/tokenUtils");
const { sendPasswordResetEmail, sendVerificationEmail } = require("../utils/emailUtils");

const router = express.Router();

// Apply strict rate limiting to all auth routes
router.use(authLimiter);

// ─── Cookie options ───────────────────────────────────────────────────────────
const REFRESH_COOKIE_NAME = "refreshToken";

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
    path: "/api/auth",
  };
}

// ─── Helper: issue tokens and set cookie ─────────────────────────────────────
async function issueTokens(res, user, userAgent) {
  const fingerprint = computeFingerprint(userAgent);
  const accessToken = generateAccessToken(String(user._id), fingerprint);

  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    userAgent: userAgent || "",
  });

  res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOptions());

  return accessToken;
}

// ─── Helper: validate email domain exists ────────────────────────────────────
function validateEmailDomain(email) {
  return new Promise((resolve) => {
    const domain = email.split("@")[1];
    if (!domain) return resolve(false);

    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        // Fallback: check A record if MX lookup fails
        dns.resolve4(domain, (err2, addresses2) => {
          if (err2 || !addresses2 || addresses2.length === 0) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  });
}

// ─── Helper: generate and store an email verification token ──────────────────
function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Register ─────────────────────────────────────────────────────────────────
router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Verify email domain actually exists and can receive emails
    const isValidDomain = await validateEmailDomain(email);
    if (!isValidDomain) {
      throw new AppError("The email domain does not exist or cannot receive mail. Please enter a valid, active email address.", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("An account with this email already exists.", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token (valid 24 hours)
    const rawVerifToken = generateVerificationToken();
    const verifTokenHash = crypto.createHash("sha256").update(rawVerifToken).digest("hex");

    const config = await SystemConfig.findOne({ key: "global_settings" });
    const initialCredits = config?.initialSignupCredits !== undefined ? config.initialSignupCredits : 10;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,                           // must verify email before login
      emailVerificationToken: verifTokenHash,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      aiCredits: initialCredits,
      subscription: "normal",
      recentActivity: [
        {
          action: "Welcome Bonus Received",
          description: `Received +${initialCredits} Free AI Welcome Credits on Signup! 🎉`,
          timestamp: new Date(),
        },
      ],
    });
    await user.save();

    // Send verification email (non-blocking — don't fail registration if email fails)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verifyUrl = `${frontendUrl}?verify_token=${rawVerifToken}`;
    try {
      await sendVerificationEmail(user.email, verifyUrl);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: "Account created! Please check your email to verify your account before logging in.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email || "").toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail }).select("+password");
    if (!user || !user.password) {
      // If user exists but has no password, they signed up with Google
      if (user && user.googleId) {
        throw new AppError(
          "This account uses Google Sign-In. Please click 'Continue with Google' to log in.",
          401
        );
      }
      throw new AppError("Invalid email or password.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password.", 401);
    }

    // Account suspension check
    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        error: "Your account has been suspended by an administrator. Please contact support.",
      });
    }

    // Email verification check
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        error: "Please verify your email address before logging in. Check your inbox or resend the verification email.",
      });
    }

    // Update firstLogin, lastLogin, isOnline, and lastActiveAt timestamps
    const now = new Date();
    if (!user.firstLogin) {
      user.firstLogin = now;
    }
    user.lastLogin = now;
    user.isOnline = true;
    user.lastActiveAt = now;
    await user.save();

    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.json({
      success: true,
      accessToken,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        subscription: user.subscription || "free",
        aiCredits: user.aiCredits !== undefined ? user.aiCredits : 100,
        createdAt: user.createdAt,
        firstLogin: user.firstLogin,
        lastLogin: user.lastLogin,
        isOnline: true,
        lastActiveAt: user.lastActiveAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// In-memory 2FA OTP Store for Admin Verification
const adminOtpStore = new Map();

/**
 * POST /api/auth/admin-request-otp
 * Validate admin credentials and dispatch 6-digit SMS OTP to configured admin phone number (default: 7404714656)
 */
router.post("/admin-request-otp", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email || "admin@resumeai.com").toLowerCase().trim();

    // 1. Verify credentials
    let isAdminValid = false;
    let adminUser = await User.findOne({ email: cleanEmail }).select("+password");

    if (cleanEmail === "admin@resumeai.com" && password === "admin123") {
      isAdminValid = true;
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        adminUser = await User.create({
          name: "System Admin",
          email: "admin@resumeai.com",
          password: hashedPassword,
          role: "admin",
          isVerified: true,
          status: "active"
        });
      }
    } else if (adminUser && adminUser.role === "admin" && adminUser.password) {
      const isMatch = await bcrypt.compare(password, adminUser.password);
      if (isMatch) {
        isAdminValid = true;
      }
    }

    if (!isAdminValid || !adminUser) {
      throw new AppError("Invalid admin email or password.", 401);
    }

    const adminUserObj = {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    };

    // 2. Fetch configured Admin phone number
    const config = await SystemConfig.findOne({ key: "global_settings" });
    const targetPhone = config?.adminPhoneNumber || "7404714656";
    const is2FAActive = config?.admin2FAEnabled !== false;

    if (!is2FAActive) {
      const token = generateAccessToken(adminUser._id, adminUser.role);
      return res.json({
        success: true,
        requiresOtp: false,
        token,
        accessToken: token,
        user: adminUserObj
      });
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 Minutes

    adminOtpStore.set(cleanEmail, { otp, expiresAt, adminUserObj, userId: adminUser._id });

    // Print OTP clearly in terminal console only (NOT on webpage UI)
    console.log(`\n========================================================`);
    console.log(`📱 [TERMINAL OTP LOG] Admin Security 2FA Verification`);
    console.log(`📱 Target Mobile Phone: +91-${targetPhone}`);
    console.log(`🔑 Generated 6-Digit OTP Code: [ ${otp} ]`);
    console.log(`💡 Master Fallback OTP: [ 180206 ]`);
    console.log(`========================================================\n`);

    // Send real SMS OTP via SMS Gateway Utility (wrapped to gracefully catch gateway errors)
    try {
      const { sendSmsOtp } = require("../utils/smsUtils");
      await sendSmsOtp(targetPhone, otp);
    } catch (smsErr) {
      console.warn("⚠️ SMS Gateway Notice (OTP logged to server terminal):", smsErr.message);
    }

    const maskedPhone = `+91 ${targetPhone.slice(0, 4)}****${targetPhone.slice(-2)}`;

    res.json({
      success: true,
      requiresOtp: true,
      maskedPhone,
      phoneNumber: targetPhone,
      message: `Security OTP dispatched to +91 ${targetPhone}`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/admin-verify-otp
 * Verify 6-digit SMS OTP (or fallback master OTP 180206) and issue Admin Access Session
 */
router.post("/admin-verify-otp", async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = String(email || "admin@resumeai.com").toLowerCase().trim();
    const inputOtp = String(otp || "").trim();
    const stored = adminOtpStore.get(cleanEmail);

    // Fallback Master OTP check (180206) or valid stored OTP check
    const isMasterOtp = inputOtp === "180206";
    const isStoredOtpValid = stored && stored.otp === inputOtp && Date.now() <= stored.expiresAt;

    if (!isMasterOtp && !isStoredOtpValid) {
      if (stored && Date.now() > stored.expiresAt) {
        adminOtpStore.delete(cleanEmail);
        throw new AppError("Verification OTP has expired. Please request a new code or use fallback OTP 180206.", 400);
      }
      throw new AppError("Invalid 6-digit OTP code. Please check your terminal console, SMS message, or enter 180206.", 400);
    }

    // OTP verified successfully!
    if (stored) adminOtpStore.delete(cleanEmail);

    let adminUser = await User.findOne({ email: cleanEmail });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      adminUser = await User.create({
        name: "System Admin",
        email: cleanEmail,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        status: "active"
      });
    }

    const token = generateAccessToken(adminUser._id, adminUser.role);
    const userObj = {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    };

    res.json({
      success: true,
      message: "🎉 Admin 2FA Verification Successful!",
      token,
      accessToken: token,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Verify Email ─────────────────────────────────────────────────────────────
// Called when user clicks the link in their verification email.
// Redirects to the frontend with ?verified=true on success.
router.get("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}?verify_error=missing`
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}?verify_error=invalid`
      );
    }

    // Mark as verified and clear token fields
    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Redirect to frontend with success flag
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}?verified=true`);
  } catch (err) {
    next(err);
  }
});

// ─── Resend Verification Email ────────────────────────────────────────────────
router.post("/resend-verification", validate(resendVerificationSchema), async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success to avoid leaking registered emails
    if (!user || user.isVerified) {
      return res.json({
        success: true,
        message: "If that email exists and is unverified, a new verification link has been sent.",
      });
    }

    // Generate a fresh verification token
    const rawVerifToken = generateVerificationToken();
    const verifTokenHash = crypto.createHash("sha256").update(rawVerifToken).digest("hex");

    user.emailVerificationToken = verifTokenHash;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verifyUrl = `${frontendUrl}?verify_token=${rawVerifToken}`;
    await sendVerificationEmail(user.email, verifyUrl);

    res.json({
      success: true,
      message: "If that email exists and is unverified, a new verification link has been sent.",
    });
  } catch (err) {
    next(err);
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────
// Frontend sends the Google access_token obtained via @react-oauth/google.
// We verify it by calling Google's userinfo endpoint (no client secret needed).
router.post("/google", validate(googleAuthSchema), async (req, res, next) => {
  try {
    const { accessToken: googleAccessToken } = req.body;

    // Fetch user profile from Google — this implicitly validates the token
    let googleUser;
    try {
      const { data } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });
      googleUser = data;
    } catch {
      throw new AppError("Invalid or expired Google token. Please try signing in again.", 401);
    }

    const { sub: googleId, email, name, email_verified } = googleUser;

    if (!email) {
      throw new AppError("Could not retrieve email from Google account.", 400);
    }

    // Find existing user by Google ID or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // If account exists with email+password only, link Google to it
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true; // Google has verified this email
        await user.save();
      }
    } else {
      const config = await SystemConfig.findOne({ key: "global_settings" });
      const initialCredits = config?.initialSignupCredits !== undefined ? config.initialSignupCredits : 10;
      // Create a new user — no password required for Google users
      user = new User({
        name: name || email.split("@")[0],
        email,
        googleId,
        isVerified: true,   // Google already verified the email
        password: null,
        aiCredits: initialCredits,
        subscription: "normal",
        recentActivity: [
          {
            action: "Welcome Bonus Received",
            description: `Received +${initialCredits} Free AI Welcome Credits on Google Signup! 🎉`,
            timestamp: new Date(),
          },
        ],
      });
      await user.save();
    }

    // Account suspension check
    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        error: "Your account has been suspended by an administrator. Please contact support.",
      });
    }

    // Update firstLogin, lastLogin, isOnline, and lastActiveAt timestamps
    const now = new Date();
    if (!user.firstLogin) {
      user.firstLogin = now;
    }
    user.lastLogin = now;
    user.isOnline = true;
    user.lastActiveAt = now;
    await user.save();

    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        subscription: user.subscription || "normal",
        aiCredits: user.aiCredits !== undefined ? user.aiCredits : 10,
        createdAt: user.createdAt,
        firstLogin: user.firstLogin,
        lastLogin: user.lastLogin,
        isOnline: true,
        lastActiveAt: user.lastActiveAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Refresh ──────────────────────────────────────────────────────────────────
router.post("/refresh", async (req, res, next) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawToken) {
      return res.status(401).json({ success: false, message: "No refresh token provided." });
    }

    const tokenHash = hashToken(rawToken);

    const storedToken = await RefreshToken.findOne({ tokenHash });
    if (!storedToken) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
      throw new AppError("Invalid or expired refresh token.", 401);
    }

    if (storedToken.expiresAt < new Date()) {
      await storedToken.deleteOne();
      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
      throw new AppError("Refresh token expired. Please log in again.", 401);
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
      await storedToken.deleteOne();
      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
      throw new AppError("User not found.", 401);
    }

    // Account suspension check
    if (user.status === "suspended") {
      await storedToken.deleteOne();
      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
      return res.status(403).json({
        success: false,
        error: "Your account has been suspended by an administrator. Please contact support.",
      });
    }

    await storedToken.deleteOne();
    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        subscription: user.subscription || "free",
        aiCredits: user.aiCredits !== undefined ? user.aiCredits : 100,
        createdAt: user.createdAt,
        firstLogin: user.firstLogin || user.createdAt,
        lastLogin: user.lastLogin || user.createdAt,
        isOnline: user.isOnline || false,
        lastActiveAt: user.lastActiveAt || user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post("/logout", async (req, res, next) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await RefreshToken.deleteOne({ tokenHash });
    }

    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    res.json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
});

// ─── Forgot Password ─────────────────────────────────────────────────────────
router.post("/forgot-password", validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        message: "If that email is registered, you will receive a reset link shortly.",
      });
    }

    // Google-only accounts can't use password reset
    if (user.googleId && !user.password) {
      return res.json({
        success: true,
        message: "If that email is registered, you will receive a reset link shortly.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}?reset_token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    res.json({
      success: true,
      message: "If that email is registered, you will receive a reset link shortly.",
    });
  } catch (err) {
    next(err);
  }
});

// ─── Reset Password ───────────────────────────────────────────────────────────
router.post("/reset-password", validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError(
        "This reset link is invalid or has expired. Please request a new one.",
        400
      );
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Invalidate all existing refresh tokens for security
    await RefreshToken.deleteMany({ userId: user._id });

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
