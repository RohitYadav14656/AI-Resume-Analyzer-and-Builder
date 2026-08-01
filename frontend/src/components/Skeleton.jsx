import React from "react";

export function Skeleton({ className = "", style = {}, width, height, variant = "text" }) {
  const classes = `skeleton ${
    variant === "circle" ? "skeleton-avatar" : variant === "title" ? "skeleton-title" : "skeleton-text"
  } ${className}`;

  const customStyle = {
    ...style,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  return <span className={classes} style={customStyle} />;
}

export function AnalysisResultSkeleton() {
  return (
    <div className="card animate-in" style={{ maxWidth: 760, margin: "0 auto", opacity: 0.85 }}>
      {/* Header Skeleton */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "2rem", marginBottom: "1.75rem", paddingBottom: "1.75rem", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <Skeleton variant="title" width="40%" height="20px" style={{ marginBottom: "1rem" }} />
          <Skeleton variant="text" width="90%" height="14px" style={{ marginBottom: "0.5rem" }} />
          <Skeleton variant="text" width="75%" height="14px" />
        </div>
        <div style={{ display: "flex", gap: "2rem" }}>
          {/* Ring 1 */}
          <div style={{ textAlign: "center" }}>
            <Skeleton variant="circle" width="90px" height="90px" style={{ marginBottom: "0.5rem" }} />
            <Skeleton variant="text" width="60px" height="12px" />
          </div>
          {/* Ring 2 */}
          <div style={{ textAlign: "center" }}>
            <Skeleton variant="circle" width="90px" height="90px" style={{ marginBottom: "0.5rem" }} />
            <Skeleton variant="text" width="60px" height="12px" />
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Skeletons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
          <Skeleton variant="title" width="50%" height="16px" style={{ marginBottom: "1rem" }} />
          <Skeleton variant="text" width="85%" height="12px" style={{ marginBottom: "0.6rem" }} />
          <Skeleton variant="text" width="90%" height="12px" style={{ marginBottom: "0.6rem" }} />
          <Skeleton variant="text" width="70%" height="12px" />
        </div>
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
          <Skeleton variant="title" width="50%" height="16px" style={{ marginBottom: "1rem" }} />
          <Skeleton variant="text" width="80%" height="12px" style={{ marginBottom: "0.6rem" }} />
          <Skeleton variant="text" width="85%" height="12px" style={{ marginBottom: "0.6rem" }} />
          <Skeleton variant="text" width="75%" height="12px" />
        </div>
      </div>

      {/* Suggestions Skeleton */}
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
        <Skeleton variant="title" width="30%" height="16px" style={{ marginBottom: "1rem" }} />
        <Skeleton variant="text" width="95%" height="12px" style={{ marginBottom: "0.6rem" }} />
        <Skeleton variant="text" width="90%" height="12px" style={{ marginBottom: "0.6rem" }} />
        <Skeleton variant="text" width="80%" height="12px" />
      </div>
    </div>
  );
}

export function ResumeBuilderSkeleton() {
  return (
    <div className="container" style={{ display: "flex", gap: "2rem", alignItems: "flex-start", paddingTop: 0 }}>
      {/* Left Form Card Skeleton */}
      <div className="card" style={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="title" width="35%" height="22px" style={{ marginBottom: "1.5rem" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div>
            <Skeleton variant="text" width="40%" height="12px" style={{ marginBottom: "0.5rem" }} />
            <Skeleton variant="text" width="100%" height="40px" />
          </div>
          <div>
            <Skeleton variant="text" width="40%" height="12px" style={{ marginBottom: "0.5rem" }} />
            <Skeleton variant="text" width="100%" height="40px" />
          </div>
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <Skeleton variant="text" width="20%" height="12px" style={{ marginBottom: "0.5rem" }} />
          <Skeleton variant="text" width="100%" height="80px" />
        </div>
        <Skeleton variant="text" width="100%" height="50px" />
      </div>

      {/* Right Preview Card Skeleton */}
      <div className="card" style={{ width: 450, position: "sticky", top: "100px", padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <Skeleton variant="title" width="60%" height="24px" style={{ margin: "0 auto 0.75rem" }} />
          <Skeleton variant="text" width="40%" height="12px" style={{ margin: "0 auto" }} />
        </div>
        <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "1.5rem 0" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <Skeleton variant="title" width="30%" height="16px" style={{ marginBottom: "0.75rem" }} />
            <Skeleton variant="text" width="90%" height="12px" style={{ marginBottom: "0.5rem" }} />
            <Skeleton variant="text" width="95%" height="12px" style={{ marginBottom: "0.5rem" }} />
            <Skeleton variant="text" width="70%" height="12px" />
          </div>
          <div>
            <Skeleton variant="title" width="30%" height="16px" style={{ marginBottom: "0.75rem" }} />
            <Skeleton variant="text" width="85%" height="12px" style={{ marginBottom: "0.5rem" }} />
            <Skeleton variant="text" width="60%" height="12px" />
          </div>
        </div>
      </div>
    </div>
  );
}
