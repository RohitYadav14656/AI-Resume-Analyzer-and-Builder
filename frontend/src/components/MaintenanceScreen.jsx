import React from "react";

export default function MaintenanceScreen({ notice }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#1c1917",
      color: "#f5f5f4",
      zIndex: 99999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div style={{
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "rgba(217, 119, 6, 0.15)",
        color: "#d97706",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2.5rem",
        marginBottom: "1.5rem"
      }}>
        🛠️
      </div>

      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem", color: "#ffffff" }}>
        Platform Under Scheduled Maintenance
      </h1>

      <p style={{ maxWidth: "540px", fontSize: "1.05rem", color: "#a8a29e", lineHeight: 1.6, marginBottom: "2rem" }}>
        {notice || "We are currently performing routine system upgrades and AI engine maintenance to improve performance. Please check back shortly."}
      </p>

      <div style={{
        background: "#27272a",
        padding: "0.75rem 1.5rem",
        borderRadius: "12px",
        fontSize: "0.85rem",
        color: "#71717a",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }}></span>
        System status: Under Maintenance • Estimated completion: &lt; 30 mins
      </div>
    </div>
  );
}
