const mongoose = require("mongoose");

const AILogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, default: "User" },
    feature: {
      type: String,
      enum: ["builder", "ats_audit", "grammar_fix", "suggestion"],
      default: "ats_audit",
    },
    model: { type: String, default: "llama-3.3-70b-versatile" },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    responseTimeMs: { type: Number, default: 450 },
    costEst: { type: Number, default: 0.00015 },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AILog", AILogSchema);
