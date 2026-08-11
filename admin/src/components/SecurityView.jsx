import React, { useState, useEffect } from "react";
import { ShieldAlert, Key, Smartphone, AlertTriangle, CheckCircle2, Lock, Users } from "lucide-react";
import axios from "axios";

export default function SecurityView({ token }) {
  const [securityData, setSecurityData] = useState({
    activeSessions: 18,
    failedLoginsLast24h: 3,
    jwtConfig: { accessTokenTTL: "15m", refreshTokenTTL: "7d", algorithm: "HS256" },
    recentFailedLogins: [
      { ip: "192.168.1.42", email: "hacker@test.com", timestamp: new Date(Date.now() - 3600000), reason: "Invalid Password" },
      { ip: "10.0.0.12", email: "john.doe@gmail.com", timestamp: new Date(Date.now() - 7200000), reason: "Rate Limit Exceeded" },
    ],
    permissionsMatrix: {
      admin: ["user:manage", "resume:manage", "system:config", "analytics:view", "broadcast:send"],
      moderator: ["user:view", "resume:view", "tickets:reply"],
      support: ["tickets:reply", "user:view"],
      user: ["resume:create", "ai:analyze"],
    },
  });

  useEffect(() => {
    if (!token || token === "demo-admin-token") return;
    axios
      .get("/api/admin/security", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data?.success && res.data.security) {
          setSecurityData(res.data.security);
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldAlert color="#e11d48" size={28} /> Security & RBAC Permission Matrix
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Monitor active sessions, failed login attempts, JWT token parameters, and role-based permissions
        </p>
      </div>

      {/* Security Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Active User Sessions</span>
            <Users size={18} color="#059669" />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "8px" }}>
            {securityData.activeSessions} Active
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#047857", marginTop: "4px", display: "inline-block", fontWeight: 600 }}>
            HttpOnly Refresh Tokens
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Failed Logins (24h)</span>
            <AlertTriangle size={18} color="#e11d48" />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "8px" }}>
            {securityData.failedLoginsLast24h} Flags
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#be123c", marginTop: "4px", display: "inline-block", fontWeight: 600 }}>
            Rate Limiter Protected
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Access Token TTL</span>
            <Key size={18} color="#2e2520" />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "8px" }}>
            {securityData.jwtConfig?.accessTokenTTL}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#d97706", marginTop: "4px", display: "inline-block", fontWeight: 600 }}>
            In-Memory Short Lived
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Refresh Token Rotation</span>
            <Lock size={18} color="#0284c7" />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "8px" }}>
            Strict Enabled
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#0284c7", marginTop: "4px", display: "inline-block", fontWeight: 600 }}>
            Single Use Cookie Rotation
          </span>
        </div>
      </div>

      {/* Permission Matrix Grid */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
          <ShieldAlert size={18} color="#d97706" /> Role-Based Access Control (RBAC) Permission Matrix
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>User Management</th>
                <th>Resume Operations</th>
                <th>System Configuration</th>
                <th>Analytics Access</th>
                <th>Broadcast Messaging</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, color: "#2e2520" }}>admin</td>
                <td><span className="badge badge-emerald">Full Control</span></td>
                <td><span className="badge badge-emerald">Full Control</span></td>
                <td><span className="badge badge-emerald">Full Control</span></td>
                <td><span className="badge badge-emerald">Read / Write</span></td>
                <td><span className="badge badge-emerald">Allowed</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: "#0284c7" }}>moderator</td>
                <td><span className="badge badge-indigo">View Only</span></td>
                <td><span className="badge badge-indigo">View Only</span></td>
                <td><span className="badge badge-rose">Denied</span></td>
                <td><span className="badge badge-indigo">Read Only</span></td>
                <td><span className="badge badge-rose">Denied</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: "#b45309" }}>support</td>
                <td><span className="badge badge-indigo">View Only</span></td>
                <td><span className="badge badge-rose">Denied</span></td>
                <td><span className="badge badge-rose">Denied</span></td>
                <td><span className="badge badge-rose">Denied</span></td>
                <td><span className="badge badge-rose">Denied</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: "#047857" }}>user</td>
                <td><span className="badge badge-indigo">Self Profile Only</span></td>
                <td><span className="badge badge-emerald">Own Resumes Only</span></td>
                <td><span className="badge badge-rose">Denied</span></td>
                <td><span className="badge badge-rose">Denied</span></td>
                <td><span className="badge badge-rose">Denied</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
