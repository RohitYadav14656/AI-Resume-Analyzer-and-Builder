import React from "react";

export default function RiveCTA({ onClick, label = "Analyze Resume" }) {
  return (
    <button 
      onClick={onClick}
      className="rive-cta-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "0.85rem 2.2rem",
        fontSize: "1rem",
        fontWeight: "700",
        borderRadius: "16px",
        background: "linear-gradient(135deg, var(--accent) 0%, #b45309 100%)",
        color: "white",
        border: "none",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: "0 8px 25px rgba(217, 119, 6, 0.3)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}
    >
      <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
         {label}
      </span>
    </button>
  );
}
