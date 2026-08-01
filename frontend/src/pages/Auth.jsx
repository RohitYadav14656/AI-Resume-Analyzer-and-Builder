import { useState } from "react";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import LottieIcon from "../components/LottieIcon";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Auth({ onAuthSuccess, initialTab = "login" }) {
  const [isLogin, setIsLogin] = useState(initialTab === "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const response = await api.post(endpoint, payload);
      
      setSuccess(isLogin ? "Welcome back! Redirecting..." : "Registration successful! Welcome!");
      
      // Delay slightly for smooth transition
      setTimeout(() => {
        onAuthSuccess(response.data.user, response.data.accessToken);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-in" style={{ maxWidth: "480px", margin: "4rem auto 6rem", padding: "0 1.5rem" }}>
      <div className="card glass-panel" style={{ padding: "2.5rem 2rem", position: "relative" }}>
        
        {/* Toggle Header */}
        <div style={{ display: "flex", background: "var(--surface-2)", padding: "4px", borderRadius: "12px", marginBottom: "2rem" }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
            style={{
              flex: 1,
              background: isLogin ? "var(--primary)" : "transparent",
              color: isLogin ? "white" : "var(--text-muted)",
              boxShadow: isLogin ? "0 4px 12px rgba(46, 37, 32, 0.15)" : "none",
              borderRadius: "10px",
              padding: "0.6rem 0",
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
            style={{
              flex: 1,
              background: !isLogin ? "var(--primary)" : "transparent",
              color: !isLogin ? "white" : "var(--text-muted)",
              boxShadow: !isLogin ? "0 4px 12px rgba(46, 37, 32, 0.15)" : "none",
              borderRadius: "10px",
              padding: "0.6rem 0",
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            Sign Up
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {isLogin 
              ? "Access your professional resumes and AI reports" 
              : "Start building your ATS-optimized resume in minutes"
            }
          </p>
        </div>

        {/* Alerts */}
        <AnimatePresence mode="wait">
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
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid rgba(225, 29, 72, 0.2)"
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: "rgba(217, 119, 6, 0.1)",
                color: "var(--accent)",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid rgba(217, 119, 6, 0.2)"
              }}
            >
              <LottieIcon type="success" width={20} height={20} loop={false} />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="glow-btn"
            disabled={loading}
            style={{
              padding: "0.85rem 0",
              fontSize: "1rem",
              borderRadius: "12px",
              fontWeight: "700",
              marginTop: "0.75rem",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            {loading ? (
              <>
                <LottieIcon type="spinner" width={20} height={20} />
                Processing...
              </>
            ) : (
              isLogin ? "Sign In" : "Sign Up"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
