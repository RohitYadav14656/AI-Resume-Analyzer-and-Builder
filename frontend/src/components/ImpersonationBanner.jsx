import React from "react";

export default function ImpersonationBanner({ user, onExit }) {
  if (!user || !user.impersonatedBy) return null;

  return (
    <div style={{
      background: "linear-gradient(90deg, #d97706 0%, #b45309 100%)",
      color: "#ffffff",
      padding: "0.55rem 1rem",
      fontSize: "0.85rem",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      position: "relative",
      zIndex: 9999,
    }}>
      <span>
         <strong>Admin Impersonation Mode:</strong> You are currently viewing as <u>{user.email}</u> (Session initiated by {user.impersonatedBy}).
      </span>
      <button
        onClick={onExit}
        style={{
          background: "#ffffff",
          color: "#b45309",
          border: "none",
          padding: "0.25rem 0.75rem",
          borderRadius: "6px",
          fontWeight: 700,
          fontSize: "0.8rem",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        onMouseOver={(e) => e.target.style.background = "#fef3c7"}
        onMouseOut={(e) => e.target.style.background = "#ffffff"}
      >
        Exit Impersonation
      </button>
    </div>
  );
}
