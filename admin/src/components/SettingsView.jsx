import React, { useState, useEffect } from "react";
import { Settings, Save, Cpu, Lock, CheckCircle, IndianRupee, CreditCard, ShieldCheck } from "lucide-react";
import axios from "axios";

export default function SettingsView({ token }) {
  const [settings, setSettings] = useState({
    aiModel: "groq-llama3-70b",
    maxResumeUploadMb: 5,
    maintenanceMode: false,
    pricePerCreditInr: 2,
    creditCostAnalyze: 1,
    creditCostBuild: 1,
    dailyBonusCredits: 4,
    initialSignupCredits: 10,
    normalPlanPrice: 0,
    proPlanPrice: 499,
    enterprisePlanPrice: 1999,
    paymentGateway: "upi_qr",
    upiId: "resumeai@fam",
    upiName: "FamPay / Resume AI",
    adminPhoneNumber: "7404714656",
    admin2FAEnabled: true,
    smsApiKey: "",
    smsProvider: "fast2sms",
    razorpayKeyId: "",
    razorpayKeySecret: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const getAuthHeader = () => {
    const activeToken = token || localStorage.getItem("adminToken") || localStorage.getItem("token");
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/system", {
        headers: getAuthHeader()
      });
      if (res.data?.success && res.data.system) {
        const sys = res.data.system;
        setSettings((prev) => ({
          ...prev,
          maintenanceMode: sys.maintenanceMode || false,
          pricePerCreditInr: sys.pricePerCreditInr !== undefined ? sys.pricePerCreditInr : 2,
          creditCostAnalyze: sys.creditCostAnalyze !== undefined ? sys.creditCostAnalyze : 1,
          creditCostBuild: sys.creditCostBuild !== undefined ? sys.creditCostBuild : 1,
          dailyBonusCredits: sys.dailyBonusCredits !== undefined ? sys.dailyBonusCredits : 4,
          initialSignupCredits: sys.initialSignupCredits !== undefined ? sys.initialSignupCredits : 10,
          normalPlanPrice: sys.normalPlanPrice !== undefined ? sys.normalPlanPrice : 0,
          proPlanPrice: sys.proPlanPrice !== undefined ? sys.proPlanPrice : 499,
          enterprisePlanPrice: sys.enterprisePlanPrice !== undefined ? sys.enterprisePlanPrice : 1999,
          paymentGateway: sys.paymentGateway || "upi_qr",
          upiId: sys.upiId || "resumeai@fam",
          upiName: sys.upiName || "FamPay / Resume AI",
          adminPhoneNumber: sys.adminPhoneNumber || "7404714656",
          admin2FAEnabled: sys.admin2FAEnabled !== undefined ? sys.admin2FAEnabled : true,
          smsApiKey: sys.smsApiKey || "",
          smsProvider: sys.smsProvider || "fast2sms",
          razorpayKeyId: sys.razorpayKeyId || "",
          razorpayKeySecret: sys.razorpayKeySecret || "",
          stripePublishableKey: sys.stripePublishableKey || "",
          stripeSecretKey: sys.stripeSecretKey || "",
        }));
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    setErrorMsg("");

    try {
      const res = await axios.put(
        "/api/admin/system/config",
        settings,
        { headers: getAuthHeader() }
      );
      if (res.data?.success) {
        setSavedMsg("Platform & Payment Gateway settings updated successfully!");
        setTimeout(() => setSavedMsg(""), 4000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMsg("🔑 Admin authentication token expired or missing. Please log out and log back into the Admin Dashboard.");
      } else {
        setErrorMsg(err.response?.data?.error || err.response?.data?.message || "Failed to save settings.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "840px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>Platform, Payment & Credit Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Configure Razorpay/Stripe API keys, credit pricing in Rupees (₹ INR), and platform system controls.
        </p>
      </div>

      {savedMsg && (
        <div style={{
          padding: "12px 18px",
          borderRadius: "10px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#047857",
          fontSize: "0.85rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle size={18} /> {savedMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: "12px 18px",
          borderRadius: "10px",
          background: "rgba(225, 29, 72, 0.12)",
          border: "1px solid rgba(225, 29, 72, 0.3)",
          color: "#be123c",
          fontSize: "0.85rem",
          fontWeight: 600
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* 🔒 Section 0: Admin 2FA Security Phone Number */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px", background: "rgba(245, 158, 11, 0.04)", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={20} color="#d97706" /> Admin Security & 2-Factor SMS Verification
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700, marginBottom: "6px" }}>
                Admin 2FA Verification Phone Number (Receives SMS OTP)
              </label>
              <input
                type="text"
                placeholder="e.g. 7404714656"
                value={settings.adminPhoneNumber}
                onChange={(e) => setSettings({ ...settings, adminPhoneNumber: e.target.value })}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  fontWeight: 700
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                SMS OTP codes for Admin Portal login will be dispatched to this mobile number.
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", color: "var(--text-main)" }}>
                <input
                  type="checkbox"
                  checked={settings.admin2FAEnabled}
                  onChange={(e) => setSettings({ ...settings, admin2FAEnabled: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "#d97706" }}
                />
                Require 6-Digit SMS OTP Verification for Admin Login
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                Protects the admin dashboard against unauthorized access.
              </span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(245, 158, 11, 0.2)", paddingTop: "14px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700, marginBottom: "6px" }}>
                SMS Provider
              </label>
              <select
                value={settings.smsProvider}
                onChange={(e) => setSettings({ ...settings, smsProvider: e.target.value })}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  fontWeight: 600
                }}
              >
                <option value="fast2sms">Fast2SMS India (fast2sms.com)</option>
                <option value="2factor">2Factor India (2factor.in)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700, marginBottom: "6px" }}>
                SMS Gateway API Key (Fast2SMS / 2Factor)
              </label>
              <input
                type="password"
                placeholder="Paste Fast2SMS or 2Factor API Key here..."
                value={settings.smsApiKey}
                onChange={(e) => setSettings({ ...settings, smsApiKey: e.target.value })}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem"
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Paste your Fast2SMS or 2Factor API key here to send real SMS directly to mobile phones.
              </span>
            </div>
          </div>
        </div>

        {/* 💳 Section 1: Payment Gateway Credentials */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <CreditCard size={20} color="#d97706" /> Payment Gateway Configuration (Collect Money)
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Active Payment Gateway</label>
            <select
              value={settings.paymentGateway}
              onChange={(e) => setSettings({ ...settings, paymentGateway: e.target.value })}
              style={{
                background: "#ffffff",
                border: "1.5px solid var(--border-color)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "var(--text-main)",
                fontSize: "0.9rem",
                outline: "none"
              }}
            >
              <option value="upi_qr">📱 FamPay & UPI QR Code (Direct Payment to FamPay @fam / any UPI)</option>
              <option value="mock">⚡ Mock Payment Gateway Simulator (Instant Checkout Test Interface)</option>
              <option value="razorpay">💳 Razorpay API (Merchant Account Required)</option>
            </select>
          </div>

          {settings.paymentGateway === "upi_qr" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "rgba(16, 185, 129, 0.06)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700, marginBottom: "6px" }}>
                  FamPay / UPI ID (Receives Payments)
                </label>
                <input
                  type="text"
                  placeholder="e.g. username@fam or 9876543210@fam"
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1.5px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "var(--text-main)",
                    fontSize: "0.85rem",
                    fontWeight: 600
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  Your FamPay `@fam` handle or any UPI ID where users scan & pay money.
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700, marginBottom: "6px" }}>
                  Payee / Merchant Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Resume AI / FamPay Account"
                  value={settings.upiName}
                  onChange={(e) => setSettings({ ...settings, upiName: e.target.value })}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1.5px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "var(--text-main)",
                    fontSize: "0.85rem",
                    fontWeight: 600
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  Name shown to customers on UPI payment screen.
                </span>
              </div>
            </div>
          ) : settings.paymentGateway === "razorpay" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "rgba(217, 119, 6, 0.04)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(217, 119, 6, 0.15)" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 600, marginBottom: "6px" }}>
                  Razorpay Key ID (rzp_live_... or rzp_test_...)
                </label>
                <input
                  type="text"
                  placeholder="rzp_live_xxxxxxxxxxxx"
                  value={settings.razorpayKeyId}
                  onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1.5px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "var(--text-main)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 600, marginBottom: "6px" }}>
                  Razorpay Key Secret
                </label>
                <input
                  type="password"
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={settings.razorpayKeySecret}
                  onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1.5px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "var(--text-main)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ background: "rgba(99, 102, 241, 0.08)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(99, 102, 241, 0.2)", fontSize: "0.85rem", color: "#3730a3" }}>
              ⚡ <strong>Mock Payment Gateway Simulator Active:</strong> Users will see an interactive payment portal to simulate payments (Card, NetBanking, UPI QR, 1-Click Pay) without requiring any real bank account or external gateway keys.
            </div>
          )}
        </div>

        {/* 🇮🇳 Section 2: AI Credit Pricing & Subscription Tier Rates (INR ₹) */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <IndianRupee size={20} color="#d97706" /> Subscription Tiers, Free Credits & Token Pricing (INR ₹)
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>
                New User Initial Free Credits
              </label>
              <input
                type="number"
                min="0"
                value={settings.initialSignupCredits}
                onChange={(e) => setSettings({ ...settings, initialSignupCredits: parseInt(e.target.value) || 0 })}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  fontWeight: 700
                }}
                required
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Free credits gifted to new users on registration (Default: 10)
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>
                Daily Login Bonus Credits
              </label>
              <input
                type="number"
                min="0"
                value={settings.dailyBonusCredits}
                onChange={(e) => setSettings({ ...settings, dailyBonusCredits: parseInt(e.target.value) || 0 })}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  fontWeight: 700
                }}
                required
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Free credits awarded to users on daily login (Default: 4)
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>
                Pro User Subscription Price (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                value={settings.proPlanPrice}
                onChange={(e) => setSettings({ ...settings, proPlanPrice: parseInt(e.target.value) || 0 })}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  fontWeight: 700
                }}
                required
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Cost for user to become a Pro User (e.g. ₹499)
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>
                Enterprise User Subscription Price (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                value={settings.enterprisePlanPrice}
                onChange={(e) => setSettings({ ...settings, enterprisePlanPrice: parseInt(e.target.value) || 0 })}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  fontWeight: 700
                }}
                required
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Cost for user to become an Enterprise User (e.g. ₹1999)
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>
                Token Top-Up Cost per Credit (₹ INR)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={settings.pricePerCreditInr}
                onChange={(e) => setSettings({ ...settings, pricePerCreditInr: parseFloat(e.target.value) || 1 })}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  fontWeight: 700
                }}
                required
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Token purchase price per credit when user buys tokens
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px" }}>
                Credits Cost per ATS Scan
              </label>
              <input
                type="number"
                min="0"
                value={settings.creditCostAnalyze}
                onChange={(e) => setSettings({ ...settings, creditCostAnalyze: parseInt(e.target.value) || 1 })}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  fontWeight: 700
                }}
                required
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Credits deducted when user analyzes a resume
              </span>
            </div>
          </div>
        </div>

        {/* 🤖 Section 3: AI Engine Configuration */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Cpu size={18} color="#d97706" /> AI Model & Platform Engine
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>Active LLM Provider</label>
            <select
              value={settings.aiModel}
              onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
              style={{
                background: "#ffffff",
                border: "1.5px solid var(--border-color)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "var(--text-main)",
                fontSize: "0.9rem",
                outline: "none"
              }}
            >
              <option value="groq-llama3-70b">Groq Llama 3.3 70B Versatile (Recommended)</option>
              <option value="groq-mixtral-8x7b">Groq Mixtral 8x7B</option>
              <option value="openai-gpt4o">OpenAI GPT-4o (Fallback)</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.9rem" }}>Platform Maintenance Mode</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Locks user website with maintenance screen</div>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "#d97706", cursor: "pointer" }}
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="glow-btn" style={{ alignSelf: "flex-start", opacity: saving ? 0.7 : 1 }}>
          <Save size={18} /> {saving ? "Saving Settings..." : "Save Platform Configurations"}
        </button>

      </form>
    </div>
  );
}
