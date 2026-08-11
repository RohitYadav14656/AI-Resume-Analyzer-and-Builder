import React, { useState, useEffect } from "react";
import { LifeBuoy, MessageSquare, CheckCircle, Clock, Star, Send, X, AlertTriangle } from "lucide-react";
import axios from "axios";

export default function SupportView({ token }) {
  const [tickets, setTickets] = useState([
    {
      _id: "t1",
      userName: "Alex Rivera",
      userEmail: "alex.rivera@example.com",
      type: "bug",
      title: "PDF Download font alignment issue on Safari",
      description: "When generating two-page resumes, the experience section heading overlaps slightly on Safari 17.2.",
      rating: 5,
      status: "open",
      priority: "high",
      createdAt: new Date(),
      replies: [],
    },
    {
      _id: "t2",
      userName: "Sarah Chen",
      userEmail: "sarah.chen@tech.io",
      type: "feature",
      title: "Request LaTeX formatting export support",
      description: "Would love to export directly to .tex for academic applications.",
      rating: 5,
      status: "in_progress",
      priority: "medium",
      createdAt: new Date(),
      replies: [
        { senderName: "Admin Support", senderRole: "admin", message: "Hi Sarah, LaTeX export is planned for v2.4 release!", createdAt: new Date() },
      ],
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState("in_progress");
  const [loading, setLoading] = useState(false);

  const fetchTickets = () => {
    if (!token || token === "demo-admin-token") return;
    axios
      .get("/api/admin/tickets", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data?.success && res.data.tickets?.length > 0) {
          setTickets(res.data.tickets);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage) return;
    setLoading(true);

    try {
      if (token && token !== "demo-admin-token") {
        const res = await axios.post(
          `/api/admin/tickets/${selectedTicket._id}/reply`,
          { message: replyMessage, status: replyStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.success) {
          fetchTickets();
          setSelectedTicket(res.data.ticket);
        }
      } else {
        const updated = {
          ...selectedTicket,
          status: replyStatus,
          replies: [
            ...selectedTicket.replies,
            { senderName: "System Admin", senderRole: "admin", message: replyMessage, createdAt: new Date() },
          ],
        };
        setTickets(tickets.map((t) => (t._id === updated._id ? updated : t)));
        setSelectedTicket(updated);
      }
      setReplyMessage("");
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
          <LifeBuoy color="#d97706" size={28} /> Feedback & Support Tickets
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Review user bug reports, feature requests, ratings, and execute reply & resolve workflows
        </p>
      </div>

      {/* Main Table List */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Subject / Title</th>
                <th>Submitted By</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id}>
                  <td>
                    <span className={`badge ${t.type === "bug" ? "badge-rose" : t.type === "feature" ? "badge-indigo" : "badge-emerald"}`}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{t.title}</td>
                  <td>
                    <div>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>{t.userName}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.userEmail}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${t.priority === "high" ? "badge-rose" : "badge-amber"}`}>{t.priority}</span>
                  </td>
                  <td>
                    <span className={`badge ${t.status === "resolved" ? "badge-emerald" : t.status === "in_progress" ? "badge-indigo" : "badge-amber"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="glow-btn"
                      style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                    >
                      View & Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply & Resolve Side Drawer Modal */}
      {selectedTicket && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(46, 37, 32, 0.45)",
            backdropFilter: "blur(10px)",
            zIndex: 999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: "520px",
              height: "100vh",
              borderRadius: "0",
              borderLeft: "1px solid var(--border-color)",
              background: "#ffffff",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={`badge ${selectedTicket.type === "bug" ? "badge-rose" : "badge-indigo"}`}>
                {selectedTicket.type?.toUpperCase()}
              </span>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)" }}>{selectedTicket.title}</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Submitted by {selectedTicket.userName} ({selectedTicket.userEmail})
              </p>
            </div>

            <div style={{ padding: "16px", borderRadius: "12px", background: "var(--surface-2)", border: "1px solid var(--border-color)" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: "1.5" }}>{selectedTicket.description}</p>
            </div>

            {/* Conversation Log */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto" }}>
              <h4 style={{ fontSize: "0.85rem", color: "#d97706", fontWeight: 700 }}>Ticket Conversation Thread</h4>
              {selectedTicket.replies?.length === 0 && (
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No replies yet. Send a response below.</p>
              )}
              {selectedTicket.replies?.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: r.senderRole === "admin" ? "rgba(217, 119, 6, 0.12)" : "var(--surface-2)",
                    border: r.senderRole === "admin" ? "1px solid rgba(217, 119, 6, 0.3)" : "1px solid var(--border-color)",
                    alignSelf: r.senderRole === "admin" ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-main)" }}>{r.senderName}</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>{r.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Update Status</label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    color: "var(--text-main)",
                    fontSize: "0.8rem",
                    outline: "none",
                  }}
                >
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Mark Resolved</option>
                  <option value="open">Keep Open</option>
                </select>
              </div>

              <textarea
                rows={3}
                required
                placeholder="Type official response to user..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "10px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />

              <button type="submit" className="glow-btn" disabled={loading} style={{ justifyContent: "center" }}>
                {loading ? "Sending..." : "Send Response & Update Status"} <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
