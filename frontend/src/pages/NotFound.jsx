import React from "react";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound({ navigate }) {
  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "2rem"
    }}>
      <div style={{
        background: "rgba(225, 29, 72, 0.1)",
        padding: "1rem",
        borderRadius: "50%",
        marginBottom: "2rem"
      }}>
        <AlertCircle size={64} color="#e11d48" />
      </div>
      <h1 className="hero-title" style={{ fontSize: "clamp(3.5rem, 12vw, 5rem)", fontWeight: 800, margin: "0 0 1rem 0", lineHeight: 1.1 }}>
        <span className="gradient-text" style={{ background: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #b45309 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          404
        </span>
      </h1>
      <h2 style={{ fontSize: "clamp(1.5rem, 6vw, 2rem)", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
        Page Not Found
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "clamp(0.95rem, 3vw, 1.1rem)", maxWidth: "500px", marginBottom: "2.5rem", lineHeight: 1.6 }}>
        Oops! The page you are looking for doesn't exist or has been moved. Let's get you back to building your perfect resume.
      </p>
      <button 
        className="glow-btn"
        style={{
          padding: "0.85rem 2rem", 
          fontSize: "1.05rem", 
          borderRadius: "14px", 
          fontWeight: "700", 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "0.5rem",
          cursor: "pointer",
          border: "none",
          color: "white"
        }}
        onClick={() => {
           window.history.replaceState({}, document.title, "/");
           navigate("home");
        }}
      >
        <Home size={20} />
        Back to Home
      </button>
    </div>
  );
}
