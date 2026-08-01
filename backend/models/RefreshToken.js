const mongoose = require("mongoose");

/**
 * RefreshToken model — stores hashed refresh tokens.
 * Raw token is NEVER stored in the DB; only the sha256 hash.
 * This means even a DB breach can't be used to forge tokens.
 */
const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // sha256 hash of the raw token sent to the client
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    // Expiry timestamp — enforced at app level AND DB level (TTL index)
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB auto-deletes expired docs
    },

    // Optional: track which device/UA created this token
    userAgent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
