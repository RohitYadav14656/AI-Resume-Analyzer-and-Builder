const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const AppError = require("../utils/AppError");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  computeFingerprint,
  REFRESH_TOKEN_EXPIRY_MS,
} = require("../utils/tokenUtils");

const router = express.Router();

// Apply strict rate limiting to all auth routes
router.use(authLimiter);

// ─── Cookie options ───────────────────────────────────────────────────────────
const REFRESH_COOKIE_NAME = "refreshToken";

function refreshCookieOptions() {
  return {
    httpOnly: true,       // Not accessible via JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",   // Prevents CSRF
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
    path: "/api/auth",    // Cookie only sent to auth endpoints
  };
}

// ─── Helper: issue tokens and set cookie ─────────────────────────────────────
async function issueTokens(res, user, userAgent) {
  const fingerprint = computeFingerprint(userAgent);
  const accessToken = generateAccessToken(String(user._id), fingerprint);

  // Generate a raw refresh token and store its hash in the DB
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    userAgent: userAgent || "",
  });

  // Set refresh token as HttpOnly cookie — JS can NEVER read this
  res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOptions());

  return accessToken;
}

// ─── Register ─────────────────────────────────────────────────────────────────
router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("An account with this email already exists.", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.status(201).json({
      success: true,
      accessToken,
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

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password.", 401);
    }

    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Refresh ──────────────────────────────────────────────────────────────────
// Exchanges a valid HttpOnly refresh token cookie for a new access token.
// Implements token rotation: old token is deleted, new one issued.
router.post("/refresh", async (req, res, next) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawToken) {
      throw new AppError("No refresh token provided.", 401);
    }

    const tokenHash = hashToken(rawToken);

    // Find and validate the stored token
    const storedToken = await RefreshToken.findOne({ tokenHash });
    if (!storedToken) {
      // Token not found — possible reuse attack; clear cookie
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

    // ── Token Rotation: delete old token, issue new pair ──
    await storedToken.deleteOne();
    const accessToken = await issueTokens(res, user, req.headers["user-agent"]);

    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
// Invalidates the refresh token in DB and clears the HttpOnly cookie.
router.post("/logout", async (req, res, next) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await RefreshToken.deleteOne({ tokenHash }); // invalidate in DB
    }

    // Always clear the cookie, even if token wasn't found
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });

    res.json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
