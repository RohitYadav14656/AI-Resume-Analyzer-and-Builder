import React, { useState, useEffect } from "react";
import { Terminal, ShieldAlert, Activity, AlertOctagon, Filter, Search, Download } from "lucide-react";
import axios from "axios";

export default function LogsView({ token }) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([
    { _id: "l1", category: "admin_audit", action: "USER_MODIFIED", details: "Admin modified user alex.rivera@example.com (Role: admin)", userEmail: "admin@resumeai.com", ipAddress: "127.0.0.1", createdAt: new Date() },
    { _id: "l2", category: "security", action: "LOGIN_SUCCESS", details: "User sarah.chen@tech.io logged in via Google OAuth", userEmail: "sarah.chen@tech.io", ipAddress: "192.168.1.15", createdAt: new Date(Date.now() - 3600000) },
    { _id: "l3", category: "user_activity", action: "ATS_SCREENING_COMPLETED", details: "ATS Audit executed with score 88%", userEmail: "alex.rivera@example.com", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 7200000) },
    { _id: "l4", category: "error", action: "PDF_GEN_WARN", details: "Font fallback applied for custom serif title", userEmail: "mvance@dev.org", ipAddress: "10.0.0.8", createdAt: new Date(Date.now() - 14400000) },
  ]);

  const fetchLogs = () => {
    if (!token || token === "demo-admin-token") return;
    const catQuery = category !== "all" ? `category=${category}&` : "";
    axios
      .get(`/api/admin/logs?${catQuery}search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.success && res.data.logs?.length > 0) {
          setLogs(res.data.logs);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLogs();
  }, [category, search, token]);

  const handleExportLogs = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Terminal color="#e11d48" size={28} /> Audit Logs & System Monitoring
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Real-time audit log stream tracking user activity, security events, API calls, and error stack traces
          </p>
        </div>

        <button onClick={handleExportLogs} className="btn-secondary">
          <Download size={16} /> Export Logs JSON
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Filter size={16} color="#d97706" />
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Category:</span>
          {["all", "admin_audit", "user_activity", "security", "api_request", "error"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                background: category === cat ? "linear-gradient(135deg, #2e2520 0%, #d97706 100%)" : "var(--surface-2)",
                color: category === cat ? "#ffffff" : "var(--text-main)",
              }}
            >
              {cat.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", width: "240px" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search log messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "32px", fontSize: "0.8rem" }}
          />
        </div>
      </div>

      {/* Real-time Log Stream Terminal */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Category</th>
                <th>Action</th>
                <th>Details</th>
                <th>User</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${log.category === "security" ? "badge-rose" : log.category === "admin_audit" ? "badge-indigo" : log.category === "error" ? "badge-amber" : "badge-emerald"}`}>
                      {log.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.85rem" }}>{log.action}</td>
                  <td style={{ color: "var(--text-main)", fontSize: "0.85rem" }}>{log.details}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{log.userEmail}</td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
