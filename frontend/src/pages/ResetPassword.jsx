import { useState, useEffect } from "react";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import LottieIcon from "../components/LottieIcon";

/**
 * ResetPassword page
 * Rendered when the app detects a `reset_token` query param in the URL.
 * Props:
 *   token       - the raw reset token from the URL
 *   onGoToLogin - callback to navigate back to the login view
 */
export default function ResetPassword({ token, onGoToLogin }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate token is present
  const tokenMissing = !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/reset-password", { token, password });
      setSuccess(true);

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        onGoToLogin();
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "transparent" };
    if (pwd.length < 6) return { level: 1, label: "Too short", color: "#ef4444" };
    const checks = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
    const passed = checks.filter((r) => r.test(pwd)).length;
    if (passed === 0) return { level: 2, label: "Weak", color: "#f97316" };
    if (passed === 1) return { level: 3, label: "Fair", color: "#eab308" };
    if (passed === 2) return { level: 4, label: "Good", color: "#22c55e" };
    return { level: 5, label: "Strong 💪", color: "#10b981" };
  };

  const strength = getStrength(password);

  return (
    <div
      className="container animate-in"
      style={{ maxWidth: "460px", margin: "4rem auto 6rem", padding: "0 1.5rem" }}
    >
      <div className="card glass-panel" style={{ padding: "2.5rem 2rem" }}>
        {/* Header Icon */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              background:
                success
                  ? "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15))"
                  : tokenMissing
                  ? "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(185,28,28,0.15))"
                  : "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15))",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              margin: "0 auto 1rem",
            }}
          >
            {success ? "✅" : tokenMissing ? "⛔" : "🔑"}
          </div>

          <h2 style={{ fontSize: "1.65rem", marginBottom: "0.4rem" }}>
            {success ? "Password Reset!" : tokenMissing ? "Invalid Link" : "Set New Password"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: "1.6" }}>
            {success
              ? "Your password has been updated. Redirecting you to login..."
              : tokenMissing
              ? "This password reset link is missing or invalid. Please request a new one."
              : "Choose a strong password for your ResumeAI account."}
          </p>
        </div>

        {/* Invalid token state */}
        {tokenMissing && (
          <button
            type="button"
            onClick={onGoToLogin}
            className="glow-btn"
            style={{
              width: "100%",
              padding: "0.85rem",
              fontSize: "0.95rem",
              borderRadius: "12px",
              fontWeight: "700",
            }}
          >
            Go to Login
          </button>
        )}

        {/* Success state */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "12px",
              padding: "1.25rem",
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
              <LottieIcon type="success" width={48} height={48} loop={false} />
            </div>
            <p style={{ color: "#10b981", fontSize: "0.9rem", fontWeight: 600, margin: 0 }}>
              All sessions have been signed out for security. Redirecting in 3 seconds…
            </p>
          </motion.div>
        )}

        {success && (
          <button
            type="button"
            onClick={onGoToLogin}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text-main)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Go to Login Now
          </button>
        )}

        {/* Reset form */}
        {!tokenMissing && !success && (
          <>
            {/* Error alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: "rgba(225, 29, 72, 0.1)",
                    color: "var(--danger)",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    border: "1px solid rgba(225, 29, 72, 0.2)",
                  }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              {/* New Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="reset-password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: "3rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      fontSize: "1rem",
                      padding: "4px",
                      lineHeight: 1,
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <div style={{ marginTop: "8px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        marginBottom: "4px",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: "4px",
                            borderRadius: "4px",
                            background:
                              i <= strength.level ? strength.color : "var(--surface-2)",
                            transition: "background 0.3s",
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: strength.color, margin: 0, fontWeight: 500 }}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Confirm New Password</label>
                <input
                  id="reset-confirm-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    borderColor:
                      confirmPassword && confirmPassword !== password
                        ? "var(--danger)"
                        : confirmPassword && confirmPassword === password
                        ? "#10b981"
                        : undefined,
                  }}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "4px", marginBottom: 0 }}>
                    Passwords don't match
                  </p>
                )}
                {confirmPassword && confirmPassword === password && (
                  <p style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "4px", marginBottom: 0 }}>
                    ✓ Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                id="reset-password-submit"
                className="glow-btn"
                disabled={loading}
                style={{
                  padding: "0.85rem 0",
                  fontSize: "1rem",
                  borderRadius: "12px",
                  fontWeight: "700",
                  marginTop: "0.5rem",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {loading ? (
                  <>
                    <LottieIcon type="spinner" width={20} height={20} />
                    Updating Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              <button
                type="button"
                onClick={onGoToLogin}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  textAlign: "center",
                  padding: "0.25rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                ← Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
