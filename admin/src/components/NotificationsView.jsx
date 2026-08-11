import React, { useState, useEffect } from "react";
import { Bell, Send, CheckCircle2, Megaphone, Users, Shield, Zap } from "lucide-react";
import axios from "axios";

export default function NotificationsView({ token }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [targetGroup, setTargetGroup] = useState("all");
  const [announcements, setAnnouncements] = useState([]);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const fetchAnnouncements = () => {
    if (!token || token === "demo-admin-token") return;
    axios
      .get("/api/admin/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data?.success) setAnnouncements(res.data.announcements);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatusMsg("");

    try {
      if (token && token !== "demo-admin-token") {
        const res = await axios.post(
          "/api/admin/notifications",
          { title, message, type, targetGroup },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.success) {
          setStatusMsg("Notification broadcast successfully via Socket.IO!");
          fetchAnnouncements();
        }
      } else {
        const newAnn = {
          _id: Date.now().toString(),
          title,
          message,
          type,
          targetGroup,
          createdBy: "Admin Demo",
          createdAt: new Date(),
        };
        setAnnouncements([newAnn, ...announcements]);
        setStatusMsg("Demo mode broadcast recorded!");
      }
      setTitle("");
      setMessage("");
    } catch (err) {
      setStatusMsg(err.response?.data?.error || "Broadcast failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Bell color="#d97706" size={28} /> System Announcements & Broadcasts
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Send real-time system notices, feature releases, and targeted announcements to users via WebSockets
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Broadcast Composer */}
        <div className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Megaphone size={18} color="#d97706" /> Broadcast Notification Composer
          </h3>

          {statusMsg && (
            <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#047857", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} /> {statusMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Title</label>
              <input
                type="text"
                required
                className="search-input"
                placeholder="e.g. Scheduled Maintenance Notice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ paddingLeft: "14px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Category Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                >
                  <option value="announcement">Announcement</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="release">Feature Release</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Target User Group</label>
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "var(--text-main)",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                >
                  <option value="all">All Registered Users</option>
                  <option value="free">Free Users Only</option>
                  <option value="pro">Pro Users Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Broadcast Message</label>
              <textarea
                required
                rows={4}
                placeholder="Write the full message details to be pushed to user dashboards..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <button type="submit" className="glow-btn" disabled={sending} style={{ justifyContent: "center", marginTop: "8px" }}>
              {sending ? "Broadcasting..." : "Broadcast Real-Time Notification"} <Send size={16} />
            </button>
          </form>
        </div>

        {/* Broadcast History Log */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>Broadcast History</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "480px", overflowY: "auto" }}>
            {announcements.length === 0 && (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "16px" }}>No previous announcements recorded.</p>
            )}

            {announcements.map((item) => (
              <div
                key={item._id}
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>{item.title}</h4>
                  <span className={`badge ${item.type === "maintenance" ? "badge-amber" : item.type === "release" ? "badge-emerald" : "badge-indigo"}`}>
                    {item.type}
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-main)", lineHeight: "1.4" }}>{item.message}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  <span>Target: {item.targetGroup?.toUpperCase()}</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
