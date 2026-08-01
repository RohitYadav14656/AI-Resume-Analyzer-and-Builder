import React from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

export default function RiveCTA({ onClick, label = "Analyze Resume" }) {
  // Use a public community Rive button file that has state machine inputs.
  // Falls back to a standard premium button if Rive fails.
  const { rive, RiveComponent } = useRive({
    src: "https://cdn.rive.app/animations/vehicles.riv", // A placeholder Rive animation or custom button if available
    stateMachines: "bumpy",
    autoplay: true,
  });

  const triggerInput = useStateMachineInput(rive, "bumpy", "bump");

  const handleOnClick = () => {
    if (triggerInput) {
      triggerInput.fire();
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <button 
      onClick={handleOnClick}
      className="rive-cta-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "0.8rem 2rem",
        fontSize: "1rem",
        fontWeight: "700",
        borderRadius: "16px",
        background: "var(--accent)",
        color: "white",
        border: "none",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(217, 119, 6, 0.25)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: 0.15, pointerEvents: "none" }}>
        <RiveComponent />
      </div>
      <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        ✨ {label}
      </span>
    </button>
  );
}
