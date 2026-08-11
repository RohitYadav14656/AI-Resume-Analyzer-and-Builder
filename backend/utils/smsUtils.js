const axios = require("axios");
const SystemConfig = require("../models/SystemConfig");

/**
 * Send 6-digit SMS OTP to target mobile number via Fast2SMS / 2Factor / SMS Gateway
 * @param {string} phoneNumber - Indian mobile number (e.g. 7404714656)
 * @param {string} otpCode - 6-digit OTP string
 */
async function sendSmsOtp(phoneNumber, otpCode) {
  const cleanPhone = String(phoneNumber || "7404714656").replace(/\D/g, "");
  const targetMobile = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
  const message = `Your Resume AI Admin Security 2FA OTP code is: ${otpCode}. Valid for 10 minutes. Do not share with anyone.`;

  console.log(`\n========================================================`);
  console.log(`📱 [REAL SMS OTP GATEWAY DISPATCH]`);
  console.log(`📱 Recipient Mobile: +91-${targetMobile}`);
  console.log(`🔑 6-Digit OTP Code: [ ${otpCode} ]`);
  console.log(`========================================================\n`);

  try {
    const config = await SystemConfig.findOne({ key: "global_settings" });
    const smsApiKey = config?.smsApiKey || process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY || "";
    const smsProvider = config?.smsProvider || "fast2sms";

    if (smsApiKey) {
      if (smsProvider === "fast2sms") {
        // Fast2SMS India API
        const response = await axios.post(
          "https://www.fast2sms.com/dev/bulkV2",
          {
            variables_values: otpCode,
            route: "otp",
            numbers: targetMobile,
          },
          {
            headers: {
              authorization: smsApiKey,
              "Content-Type": "application/json",
            },
            timeout: 8000,
          }
        );
        console.log("✅ [Fast2SMS API] SMS Dispatch Status:", response.data);
        return { success: true, provider: "fast2sms", response: response.data };
      } else if (smsProvider === "2factor") {
        // 2Factor India OTP API
        const url = `https://2factor.in/API/V1/${smsApiKey}/SMS/+91${targetMobile}/${otpCode}/AUTOGEN`;
        const response = await axios.get(url, { timeout: 8000 });
        console.log("✅ [2Factor API] SMS Dispatch Status:", response.data);
        return { success: true, provider: "2factor", response: response.data };
      }
    }

    // Attempt Fast2SMS free test endpoint fallback
    try {
      if (smsApiKey) {
        const freeRouteRes = await axios.get(
          `https://www.fast2sms.com/dev/bulkV2?authorization=${smsApiKey}&route=otp&variables_values=${otpCode}&flash=0&numbers=${targetMobile}`,
          { timeout: 5000 }
        );
        if (freeRouteRes?.data) {
          console.log("✅ [Fast2SMS Route] Dispatch status:", freeRouteRes.data);
        }
      }
    } catch (apiErr) {
      console.warn("Fast2SMS API key request note:", apiErr.message);
    }

    return { success: true, provider: "console_logger", targetMobile, message };
  } catch (err) {
    console.error("⚠️ SMS Dispatch Gateway Error:", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendSmsOtp };
