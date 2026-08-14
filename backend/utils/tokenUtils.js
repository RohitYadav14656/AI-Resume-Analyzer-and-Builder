const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY_MS = 1 * 60 * 60 * 1000;

/**
 * Generate a short-lived JWT access token.
 * Includes a fingerprint (sha256 of User-Agent) so the token is
 * bound to the browser — mismatched fingerprint = rejected token.
 *
 * @param {string} userId - MongoDB ObjectId as string
 * @param {string} fingerprint - sha256 hash of User-Agent header
 * @returns {string} signed JWT
 */
function generateAccessToken(userId, fingerprint) {
  return jwt.sign({ userId, fingerprint }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Verify a JWT access token and optionally check the fingerprint.
 *
 * @param {string} token
 * @param {string} fingerprint - sha256 hash of User-Agent header
 * @returns {{ userId: string, fingerprint: string }} decoded payload
 * @throws {Error} if invalid, expired, or fingerprint mismatch
 */
function verifyAccessToken(token, fingerprint) {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (fingerprint && decoded.fingerprint !== fingerprint) {
    throw new Error("Token fingerprint mismatch — possible session hijack");
  }
  return decoded;
}

/**
 * Generate a cryptographically secure random refresh token (hex string).
 * @returns {string} 64-byte hex string
 */
function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

/**
 * Hash a token using sha256 for safe storage in DB.
 * Refresh tokens are stored hashed — raw token stays with the client.
 * @param {string} token
 * @returns {string} sha256 hex hash
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Compute browser fingerprint from the User-Agent string.
 * Used to bind JWTs to a specific browser/client.
 * @param {string} userAgent
 * @returns {string} sha256 hex hash
 */
function computeFingerprint(userAgent) {
  return crypto
    .createHash("sha256")
    .update(userAgent || "unknown")
    .digest("hex");
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  computeFingerprint,
  REFRESH_TOKEN_EXPIRY_MS,
};
