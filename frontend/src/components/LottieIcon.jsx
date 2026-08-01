import React from "react";

// 1. Success checkmark with draw-in and bounce animation
function SuccessIcon({ width, height }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <style>{`
        @keyframes success-circle {
          0% { stroke-dashoffset: 166; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes success-check {
          0% { stroke-dashoffset: 48; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes success-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .success-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3.5;
          stroke-miterlimit: 10;
          stroke: #10b981;
          fill: none;
          animation: success-circle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .success-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke-width: 4.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke: #10b981;
          animation: success-check 0.45s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
        }
        .success-container {
          animation: success-scale 0.3s ease-in-out 0.8s both;
        }
      `}</style>
      <g className="success-container">
        <circle className="success-circle" cx="26" cy="26" r="25" />
        <path className="success-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </g>
    </svg>
  );
}

// 2. File upload indicator with bouncing arrow and pulse glow
function UploadIcon({ width, height }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        @keyframes upload-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes upload-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        .upload-arrow {
          animation: upload-bounce 1.6s ease-in-out infinite;
          stroke: var(--accent, #d97706);
          stroke-width: 3.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .upload-base {
          stroke: #4b5563;
          stroke-width: 3;
          stroke-linecap: round;
        }
        .upload-wave {
          animation: upload-pulse 2s ease-in-out infinite;
          stroke: var(--accent, #d97706);
          stroke-width: 2;
          opacity: 0.5;
        }
      `}</style>
      <g>
        <path className="upload-base" d="M16 46H48M12 40V46C12 47.1 12.9 48 14 48H50C51.1 48 52 47.1 52 46V40" />
        <g className="upload-arrow">
          <path d="M32 14V38" />
          <path d="M22 24L32 14L42 24" />
        </g>
        <path className="upload-wave" d="M24 38H40" style={{ animationDelay: "0.2s" }} />
      </g>
    </svg>
  );
}

// 3. AI sparkles that pulse and glow
function SparkleIcon({ width, height }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <style>{`
        @keyframes sparkle-glow {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(1.1) rotate(15deg); opacity: 1; filter: drop-shadow(0 0 4px var(--accent, #f59e0b)); }
        }
        @keyframes sparkle-glow-small {
          0%, 100% { transform: scale(0.6) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(0.95) rotate(-15deg); opacity: 1; filter: drop-shadow(0 0 3px #fbbf24); }
        }
        .sparkle-main {
          transform-origin: 10px 10px;
          animation: sparkle-glow 2.5s ease-in-out infinite;
          fill: var(--accent, #f59e0b);
        }
        .sparkle-secondary {
          transform-origin: 18px 16px;
          animation: sparkle-glow-small 2.5s ease-in-out infinite 0.7s;
          fill: #fbbf24;
        }
      `}</style>
      <g>
        <path
          className="sparkle-main"
          d="M10 2C10 6.4 13.6 10 18 10C13.6 10 10 13.6 10 18C10 13.6 6.4 10 2 10C6.4 10 10 6.4 10 2Z"
        />
        <path
          className="sparkle-secondary"
          d="M18 12C18 14.2 19.8 16 22 16C19.8 16 18 17.8 18 20C18 17.8 16.2 16 14 16C16.2 16 18 14.2 18 12Z"
        />
      </g>
    </svg>
  );
}

// 4. Smooth dual-ring rotating loading spinner
function SpinnerIcon({ width, height }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        @keyframes spinner-rotate {
          100% { transform: rotate(360deg); }
        }
        @keyframes spinner-dash {
          0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
        }
        .spinner-outer {
          transform-origin: 19px 19px;
          animation: spinner-rotate 2s linear infinite;
        }
        .spinner-inner {
          transform-origin: 19px 19px;
          animation: spinner-rotate 1.2s linear infinite reverse, spinner-dash 1.5s ease-in-out infinite;
          stroke: var(--accent, #d97706);
          stroke-linecap: round;
        }
      `}</style>
      <g>
        <circle cx="19" cy="19" r="16" stroke="#e2e8f0" strokeWidth="3" strokeOpacity="0.1" fill="none" />
        <circle
          className="spinner-inner"
          cx="19"
          cy="19"
          r="16"
          strokeWidth="3.5"
          stroke="var(--accent, #d97706)"
          fill="none"
        />
      </g>
    </svg>
  );
}

export default function LottieIcon({ type, width = 64, height = 64, loop = true, autoplay = true }) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <SuccessIcon width={width} height={height} />;
      case "upload":
        return <UploadIcon width={width} height={height} />;
      case "sparkle":
        return <SparkleIcon width={width} height={height} />;
      case "spinner":
      default:
        return <SpinnerIcon width={width} height={height} />;
    }
  };

  return (
    <div style={{ width, height, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {getIcon()}
    </div>
  );
}
