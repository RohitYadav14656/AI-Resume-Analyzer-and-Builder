import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import LottieIcon from "../components/LottieIcon";
import WebsiteLogo from "../components/WebsiteLogo";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Auth({ onAuthSuccess, initialTab = "login" }) {
  const [isLogin, setIsLogin] = useState(initialTab === "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Email verification pending state (shown after signup)
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError("");
      try {
        const response = await api.post("/api/auth/google", {
          accessToken: tokenResponse.access_token,
        });
        onAuthSuccess(response.data.user, response.data.accessToken);
      } catch (err) {
        setError(err.response?.data?.error || "Google sign-in failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError("Google sign-in was cancelled or failed. Please try again.");
      setGoogleLoading(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    // Password validation
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email: email.trim(), password } : { name: name.trim(), email: email.trim(), password };

      const response = await api.post(endpoint, payload);

      if (response.data.requiresVerification) {
        // Registration complete but email not yet verified
        setVerificationEmail(email.trim());
        setVerificationPending(true);
        return;
      }

      setSuccess(isLogin ? "Welcome back! Redirecting..." : "Registration successful! Welcome!");
      toast.success(isLogin ? `Welcome back, ${response.data.user?.name || "User"}!` : "Account created successfully!");
      setTimeout(() => {
        onAuthSuccess(response.data.user, response.data.accessToken);
      }, 900);
    } catch (err) {
      const data = err.response?.data;
      const status = err.response?.status;
      // Login blocked by unverified email
      if (data?.requiresVerification) {
        setVerificationEmail(email.trim());
        setVerificationPending(true);
        toast.error("Please verify your email address before logging in.", { id: "auth-verify-required" });
        return;
      }
      const errMsg = status === 401 || (data?.error && data.error.toLowerCase().includes("invalid"))
        ? "Invalid email or password. Please check your credentials."
        : (data?.error || "Something went wrong. Please check your details.");
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess("");
    try {
      await api.post("/api/auth/resend-verification", { email: verificationEmail });
      setResendSuccess("A new verification link has been sent to " + verificationEmail);
    } catch {
      setResendSuccess("Verification email sent! Check your inbox.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email: forgotEmail });
      setForgotSuccess("Check your inbox! A reset link has been sent to " + forgotEmail);
    } catch (err) {
      setForgotError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setError("");
    setSuccess("");
    setShowForgot(false);
    setVerificationPending(false);
    setForgotEmail("");
    setForgotError("");
    setForgotSuccess("");
    setResendSuccess("");
  };

  // ── Shared divider ─────────────────────────────────────────────────────────
  const Divider = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0" }}>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 500 }}>or</span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );

  // ── Google Button ──────────────────────────────────────────────────────────
  const GoogleButton = ({ label }) => (
    <button
      type="button"
      id="google-signin-btn"
      onClick={() => {
        setError("");
        loginWithGoogle();
      }}
      disabled={googleLoading || loading}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.65rem",
        padding: "0.75rem 1rem",
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.9rem",
        color: "var(--text-main)",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        opacity: googleLoading ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(217,119,6,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
      }}
    >
      {googleLoading ? (
        <>
          <LottieIcon type="spinner" width={18} height={18} />
          Connecting...
        </>
      ) : (
        <>
          {/* Google G logo SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1818l-2.9087-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z" fill="#FBBC05"/>
            <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.891 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
          </svg>
          {label}
        </>
      )}
    </button>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFICATION PENDING PANEL
  // ═══════════════════════════════════════════════════════════════════════════
  if (verificationPending) {
    return (
      <div className="container animate-in" style={{ maxWidth: "480px", margin: "4rem auto 6rem" }}>
        <motion.div
          className="card glass-panel"
          style={{ padding: "2.5rem 2rem" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Envelope animation */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{
              width: "72px", height: "72px",
              background: "linear-gradient(135deg, rgba(217,119,6,0.12), rgba(180,83,9,0.12))",
              borderRadius: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "32px", margin: "0 auto 1rem",
              border: "1px solid rgba(217,119,6,0.2)",
            }}></div>
            <h2 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>Check your inbox</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: "1.7" }}>
              We sent a verification link to<br />
              <strong style={{ color: "var(--accent)" }}>{verificationEmail}</strong>.<br />
              Click the link to activate your account.
            </p>
          </div>

          {/* Steps */}
          <div style={{
            background: "var(--surface-2)",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}>
            {[
              "Open the email from ResumeAI",
              "Click the \"Verify My Email\" button",
              "Return here and log in",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: "var(--accent)", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</div>
                {step}
              </div>
            ))}
          </div>

          {/* Resend section */}
          <AnimatePresence>
            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: "10px",
                  padding: "0.75rem 1rem",
                  fontSize: "0.85rem",
                  color: "#10b981",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                 {resendSuccess}
              </motion.div>
            )}
          </AnimatePresence>

          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "0.75rem" }}>
            Didn't receive the email? Check your spam folder or
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "var(--surface-2)",
              border: "1.5px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text-main)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            {resendLoading ? <><LottieIcon type="spinner" width={16} height={16} /> Sending...</> : "↻ Resend Verification Email"}
          </button>

          <button
            type="button"
            onClick={() => switchTab(true)}
            style={{
              width: "100%",
              padding: "0.6rem",
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            ← Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN AUTH PANEL
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="container animate-in" style={{ maxWidth: "480px", margin: "3rem auto 5rem" }}>
      <div className="card glass-panel" style={{ padding: "2.5rem 2rem", position: "relative" }}>

        {/* Brand Header Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <WebsiteLogo size="lg" />
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            {isLogin ? "Welcome back! Sign in to access your AI resumes" : "Create your free account to build ATS-friendly resumes"}
          </p>
        </div>

        {/* Toggle Header */}
        <AnimatePresence mode="wait">
          {!showForgot && (
            <motion.div
              key="tabs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: "flex", background: "var(--surface-2)", padding: "4px", borderRadius: "12px", marginBottom: "2rem" }}>
                <button
                  type="button"
                  onClick={() => switchTab(true)}
                  style={{
                    flex: 1,
                    background: isLogin ? "var(--primary)" : "transparent",
                    color: isLogin ? "white" : "var(--text-muted)",
                    boxShadow: isLogin ? "0 4px 12px rgba(46,37,32,0.15)" : "none",
                    borderRadius: "10px",
                    padding: "0.6rem 0",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => switchTab(false)}
                  style={{
                    flex: 1,
                    background: !isLogin ? "var(--primary)" : "transparent",
                    color: !isLogin ? "white" : "var(--text-muted)",
                    boxShadow: !isLogin ? "0 4px 12px rgba(46,37,32,0.15)" : "none",
                    borderRadius: "10px",
                    padding: "0.6rem 0",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Sign Up
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FORGOT PASSWORD PANEL ── */}
        <AnimatePresence mode="wait">
          {showForgot ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => { setShowForgot(false); setForgotEmail(""); setForgotError(""); setForgotSuccess(""); }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", padding: 0, marginBottom: "1.5rem", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text-main)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              >
                ← Back to Login
              </button>

              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(79,70,229,0.12))", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", margin: "0 auto 1rem" }}></div>
                <h2 style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>Forgot Password?</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: "1.6" }}>
                  Enter your email and we'll send a secure reset link.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {forgotError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: "rgba(225,29,72,0.1)", color: "var(--danger)", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.875rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid rgba(225,29,72,0.2)" }}
                  > {forgotError}</motion.div>
                )}
                {forgotSuccess && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.875rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: "0.5rem", border: "1px solid rgba(16,185,129,0.2)" }}
                  ><span></span><span>{forgotSuccess}</span></motion.div>
                )}
              </AnimatePresence>

              {!forgotSuccess && (
                <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Email Address</label>
                    <input id="forgot-email" type="email" placeholder="john@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                  </div>
                  <button type="submit" className="glow-btn" disabled={forgotLoading} style={{ padding: "0.85rem 0", fontSize: "1rem", borderRadius: "12px", fontWeight: "700", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                    {forgotLoading ? <><LottieIcon type="spinner" width={20} height={20} />Sending...</> : "Send Reset Link"}
                  </button>
                </form>
              )}
              {forgotSuccess && (
                <button type="button" onClick={() => { setShowForgot(false); setForgotEmail(""); setForgotSuccess(""); setIsLogin(true); }} style={{ width: "100%", padding: "0.75rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-main)", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>
                  Back to Login
                </button>
              )}
            </motion.div>

          ) : (
            /* ── LOGIN / REGISTER PANEL ── */
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  {isLogin ? "Access your resumes and AI reports" : "Start building your ATS-optimized resume"}
                </p>
              </div>

              {/* ── Google Button ── */}
              <GoogleButton label={isLogin ? "Continue with Google" : "Sign up with Google"} />

              <Divider />

              {/* Alerts */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: "rgba(225,29,72,0.1)", color: "var(--danger)", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.875rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid rgba(225,29,72,0.2)" }}
                  > {error}</motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: "rgba(217,119,6,0.1)", color: "var(--accent)", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.875rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid rgba(217,119,6,0.2)" }}
                  ><LottieIcon type="success" width={20} height={20} loop={false} />{success}</motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                {!isLogin && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Full Name</label>
                    <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    style={{
                      borderColor: error ? "var(--danger)" : undefined
                    }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <label style={{ margin: 0 }}>Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        id="forgot-password-link"
                        onClick={() => { setShowForgot(true); setForgotEmail(email); setError(""); setSuccess(""); }}
                        style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.8rem", cursor: "pointer", padding: 0, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: "2px", transition: "opacity 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      style={{
                        width: "100%",
                        paddingRight: "2.75rem",
                        borderColor: error ? "var(--danger)" : undefined
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                      style={{
                        position: "absolute",
                        right: "10px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        color: "var(--text-muted)",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="glow-btn"
                  disabled={loading || googleLoading}
                  style={{ padding: "0.85rem 0", fontSize: "1rem", borderRadius: "12px", fontWeight: "700", marginTop: "0.25rem", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                >
                  {loading ? <><LottieIcon type="spinner" width={20} height={20} />Processing...</> : isLogin ? "Sign In" : "Create Account"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
