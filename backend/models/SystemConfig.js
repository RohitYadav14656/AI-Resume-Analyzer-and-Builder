const mongoose = require("mongoose");

const SystemConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "global_settings" },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceNotice: { type: String, default: "Platform is under scheduled maintenance. Please check back shortly." },
    pricePerCreditInr: { type: Number, default: 2 },
    creditCostAnalyze: { type: Number, default: 1 },
    creditCostBuild: { type: Number, default: 1 },
    dailyBonusCredits: { type: Number, default: 4 },
    initialSignupCredits: { type: Number, default: 10 },
    normalPlanPrice: { type: Number, default: 0 },
    proPlanPrice: { type: Number, default: 499 },
    enterprisePlanPrice: { type: Number, default: 1999 },
    paymentGateway: { type: String, default: "upi_qr" },
    upiId: { type: String, default: "resumeai@fam" },
    upiName: { type: String, default: "FamPay / Resume AI" },
    adminPhoneNumber: { type: String, default: "7404714656" },
    admin2FAEnabled: { type: Boolean, default: true },
    smsApiKey: { type: String, default: "" },
    smsProvider: { type: String, default: "fast2sms" },
    razorpayKeyId: { type: String, default: "" },
    razorpayKeySecret: { type: String, default: "" },
    stripePublishableKey: { type: String, default: "" },
    stripeSecretKey: { type: String, default: "" },
    featureFlags: {
      aiBuilder: { type: Boolean, default: true },
      atsAnalyzer: { type: Boolean, default: true },
      pdfExport: { type: Boolean, default: true },
      liveSupport: { type: Boolean, default: true },
    },
    emailQueueStatus: { type: String, default: "Idle - 0 pending" },
    lastBackupAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemConfig", SystemConfigSchema);
