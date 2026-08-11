import React from "react";

export default function WebsiteLogo({ size = "md", onClick, style = {}, className = "" }) {
  const sizes = {
    sm: { iconSize: 24, fontSize: "1.1rem", badgePadding: "4px 8px", gap: "8px" },
    md: { iconSize: 32, fontSize: "1.35rem", badgePadding: "6px 12px", gap: "10px" },
    lg: { iconSize: 42, fontSize: "1.75rem", badgePadding: "8px 16px", gap: "12px" },
    xl: { iconSize: 54, fontSize: "2.2rem", badgePadding: "10px 20px", gap: "14px" }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div
      onClick={onClick}
      className={`website-logo-container ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: currentSize.gap,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        textDecoration: "none",
        ...style
      }}
    >
      {/* Logo Icon Emblem */}
      <div
        style={{
          width: currentSize.iconSize,
          height: currentSize.iconSize,
          borderRadius: "30%",
          background: "linear-gradient(135deg, #2e2520 0%, #1f1915 50%, #d97706 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(217, 119, 6, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15)",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
      >
        <svg
          width={currentSize.iconSize * 0.58}
          height={currentSize.iconSize * 0.58}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M10 13l1.5 1.5L14 12" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M9 18h6" />
        </svg>
        {/* Glow Dot */}
        <span
          style={{
            position: "absolute",
            top: "3px",
            right: "3px",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            backgroundColor: "#f59e0b",
            boxShadow: "0 0 6px #f59e0b"
          }}
        />
      </div>

      {/* Brand Name Typography */}
      <span
        style={{
          fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: currentSize.fontSize,
          letterSpacing: "-0.03em",
          color: "var(--text-main, #2e2520)",
          display: "flex",
          alignItems: "center",
          lineHeight: 1
        }}
      >
        Resume
        <span
          style={{
            background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginLeft: "4px",
            position: "relative"
          }}
        >
          AI
        </span>
        <span
          style={{
            display: "inline-block",
            width: size === "sm" ? "6px" : size === "lg" || size === "xl" ? "10px" : "8px",
            height: size === "sm" ? "6px" : size === "lg" || size === "xl" ? "10px" : "8px",
            borderRadius: "50%",
            backgroundColor: "#d97706",
            marginLeft: "3px",
            boxShadow: "0 0 10px rgba(217, 119, 6, 0.6)"
          }}
        />
      </span>
    </div>
  );
}
