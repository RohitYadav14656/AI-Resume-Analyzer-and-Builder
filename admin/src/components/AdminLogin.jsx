import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertTriangle, Key, Smartphone, CheckCircle, RefreshCw, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import WebsiteLogo from "./WebsiteLogo";

export default function AdminLogin({ onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1: Email/Password | 2: 6-Digit SMS OTP Verification
  const [email, setEmail] = useState("admin@resumeai.com");
  const [password, setPassword] = useState("admin123");
  const [otp, setOtp] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("+91 7404714656");
  const [devOtp, setDevOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Submit Credentials -> Request SMS OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setInfoMsg("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/admin-request-otp", { email, password });
      if (res.data && res.data.success) {
        if (!res.data.requiresOtp && res.data.token) {
          toast.success("Admin authenticated successfully!");
          onLoginSuccess(res.data.token, res.data.user);
          return;
        }

        setMaskedPhone(res.data.maskedPhone || `+91 ${res.data.phoneNumber || "7404714656"}`);
        if (res.data.devOtp) setDevOtp(res.data.devOtp);
        const msg = res.data.message || `6-Digit OTP sent to ${res.data.maskedPhone || "7404714656"}`;
        setInfoMsg(msg);
        toast.success(msg);
        setStep(2);
        setTimer(60);
        setCanResend(false);
      }
    } catch (err) {
      console.warn("Request OTP error, trying direct login fallback:", err);
      // Fallback: Attempt standard auth login if OTP endpoint is unavailable
      try {
        const fallbackRes = await axios.post("/api/auth/login", { email, password });
        if (fallbackRes.data && fallbackRes.data.success) {
          toast.success("Admin authenticated successfully!");
          onLoginSuccess(fallbackRes.data.token || "admin-session-token", fallbackRes.data.user);
          return;
        }
        const errMsg = fallbackRes.data?.message || "Invalid admin credentials";
        setError(errMsg);
        toast.error(errMsg);
      } catch (fallbackErr) {
        const errMsg = fallbackErr.response?.data?.message || err.response?.data?.message || "Authentication failed. Please check your credentials and server connection.";
        setError(errMsg);
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the complete 6-digit OTP security code.");
      toast.error("Please enter the complete 6-digit OTP code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/admin-verify-otp", { email, otp });
      if (res.data && res.data.success) {
        const token = res.data.accessToken || res.data.token || "admin-session-token";
        toast.success("2FA Security Verification Successful!");
        onLoginSuccess(token, res.data.user);
      }
    } catch (err) {
      const errTxt = err.response?.data?.error || err.response?.data?.message || "Invalid 6-digit OTP code.";
      setError(errTxt);
      toast.error(errTxt);
    } finally {
      setLoading(false);
    }
  };

  const handleBypassDemo = () => {
    const demoToken = "demo-admin-token";
    const demoUser = {
      id: "demo-admin-id",
      name: "System Admin",
      email: email || "admin@resumeai.com",
      role: "admin",
    };
    toast.success("Entered Admin Portal in Demo Mode");
    onLoginSuccess(demoToken, demoUser);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "radial-gradient(circle at 50% 20%, #3a2e28 0%, #221a16 60%, #15100e 100%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Decorative Ambient Glows */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
          filter: "blur(40px)"
        }}
      />

      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "40px 36px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          background: "rgba(35, 28, 24, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(217, 119, 6, 0.25)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(217, 119, 6, 0.12)",
          position: "relative",
          zIndex: 2
        }}
      >
        {/* Website Logo Header Branding */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <WebsiteLogo size="xl" lightText={true} style={{ marginBottom: "12px" }} />
          
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(217, 119, 6, 0.15)",
              border: "1px solid rgba(217, 119, 6, 0.3)",
              color: "#f59e0b",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "10px"
            }}
          >
             Admin Control Center
          </div>

          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            {step === 1 ? "Sign In to Admin Portal" : "2FA Phone Verification"}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#a8a29e", marginTop: "6px", margin: 0, lineHeight: 1.5 }}>
            {step === 1
              ? "Enter your administrator credentials to request verification OTP"
              : `Enter the 6-digit OTP security code sent to ${maskedPhone}`}
          </p>
        </div>

        {/* Credentials Notice Banner */}
        {step === 1 && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              background: "rgba(217, 119, 6, 0.12)",
              border: "1px solid rgba(217, 119, 6, 0.3)",
              color: "#f59e0b",
              fontSize: "0.8rem",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
              <Key size={14} /> Admin Credentials & 2FA Phone:
            </div>
            <div style={{ color: "#e7e5e4", fontFamily: "monospace", fontSize: "0.8rem" }}>
              Email: <strong style={{ color: "#ffffff" }}>admin@resumeai.com</strong> | Phone: <strong style={{ color: "#ffffff" }}>7404714656</strong>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              background: "rgba(225, 29, 72, 0.15)",
              border: "1px solid rgba(225, 29, 72, 0.35)",
              color: "#fda4af",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertTriangle size={16} color="#f43f5e" /> {error}
          </div>
        )}

        {infoMsg && step === 2 && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#6ee7b7",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle size={16} color="#10b981" /> {infoMsg}
          </div>
        )}

        {/* STEP 1: EMAIL & PASSWORD */}
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "#a8a29e", fontWeight: 600 }}>Admin Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="#a8a29e" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  required
                  className="search-input"
                  placeholder="admin@resumeai.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    paddingLeft: "42px",
                    paddingRight: "14px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "rgba(20, 15, 12, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.92rem"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "#a8a29e", fontWeight: 600 }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#a8a29e" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="search-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    paddingLeft: "42px",
                    paddingRight: "36px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "rgba(20, 15, 12, 0.7)",
                    color: "#ffffff",
                    fontSize: "0.92rem"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#a8a29e",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.95rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "8px",
                boxShadow: "0 6px 20px rgba(217, 119, 6, 0.35)",
                transition: "all 0.2s ease"
              }}
            >
              {loading ? "Authenticating..." : "Send Verification OTP to 7404714656"} <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          /* STEP 2: 6-DIGIT OTP VERIFICATION */
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
              <label style={{ fontSize: "0.85rem", color: "#e7e5e4", fontWeight: 700 }}>
                Enter 6-Digit SMS Security Code:
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "1.7rem",
                  letterSpacing: "10px",
                  fontWeight: 900,
                  padding: "14px",
                  borderRadius: "14px",
                  border: "2px solid #d97706",
                  background: "rgba(20, 15, 12, 0.9)",
                  color: "#f59e0b",
                  outline: "none",
                  boxShadow: "0 0 20px rgba(217, 119, 6, 0.2)"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "1rem",
                border: "none",
                cursor: (loading || otp.length < 6) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(5, 150, 105, 0.35)"
              }}
            >
              {loading ? "Verifying OTP..." : "Verify OTP & Access Admin Portal"} <ShieldCheck size={18} />
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", paddingTop: "6px" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", color: "#a8a29e", cursor: "pointer", fontWeight: 600 }}
              >
                ← Back to Login
              </button>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={!canResend || loading}
                style={{
                  background: "none",
                  border: "none",
                  color: canResend ? "#f59e0b" : "#78716c",
                  fontWeight: 700,
                  cursor: canResend ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <RefreshCw size={12} /> {canResend ? "Resend OTP" : `Resend in ${timer}s`}
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: "center", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "16px" }}>
          <button
            onClick={handleBypassDemo}
            style={{ background: "none", border: "none", color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
          >
            Enter Demo Mode (Local Admin Preview)
          </button>
        </div>
      </div>
    </div>
  );
}
