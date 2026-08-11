const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["user_activity", "admin_audit", "security", "api_request", "error"],
      default: "user_activity",
    },
    action: { type: String, required: true },
    details: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userName: { type: String, default: "System" },
    userEmail: { type: String, default: "system@resumeai.com" },
    ipAddress: { type: String, default: "127.0.0.1" },
    userAgent: { type: String, default: "Browser/Client" },
    statusCode: { type: Number, default: 200 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
