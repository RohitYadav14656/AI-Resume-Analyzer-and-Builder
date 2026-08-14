import React, { useState, useEffect } from "react";
import api from "../api";

export default function SupportTicketsModal({ isOpen, onClose }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list"); // "list" | "create" | "detail"
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "support",
    priority: "medium",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen]);

  const fetchTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/user/tickets");
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      setError("Failed to load your support tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and Description are required.");
      return;
    }
    setCreating(true);
    setError("");
    setSuccessMsg("");
    try {
      const { data } = await api.post("/api/user/tickets", form);
      if (data.success) {
        setSuccessMsg("Ticket created successfully! Our support team will review it.");
        setForm({ title: "", description: "", type: "support", priority: "medium" });
        await fetchTickets();
        setTimeout(() => {
          setSuccessMsg("");
          setActiveTab("list");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket.");
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    setSubmittingReply(true);
    setError("");
    try {
      const { data } = await api.post(`/api/user/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage,
      });
      if (data.success && data.ticket) {
        setSelectedTicket(data.ticket);
        setReplyMessage("");
        fetchTickets();
      }
    } catch (err) {
      setError("Failed to send reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.55)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "680px",
        maxHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface-2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}></span>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>
              Support & Help Desk
            </h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {activeTab !== "list" && (
              <button
                onClick={() => { setActiveTab("list"); setSelectedTicket(null); setError(""); }}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--primary)"
                }}
              >
                ← Back to List
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: "0.2rem 0.5rem"
              }}
            >
              
            </button>
          </div>
        </div>

        {/* Tab Navigation when on List or Create */}
        {activeTab !== "detail" && (
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "#fafafa" }}>
            <button
              onClick={() => setActiveTab("list")}
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "none",
                background: activeTab === "list" ? "#ffffff" : "transparent",
                fontWeight: activeTab === "list" ? 700 : 500,
                color: activeTab === "list" ? "var(--accent)" : "var(--text-muted)",
                borderBottom: activeTab === "list" ? "2px solid var(--accent)" : "none",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              My Support Tickets ({tickets.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "none",
                background: activeTab === "create" ? "#ffffff" : "transparent",
                fontWeight: activeTab === "create" ? 700 : 500,
                color: activeTab === "create" ? "var(--accent)" : "var(--text-muted)",
                borderBottom: activeTab === "create" ? "2px solid var(--accent)" : "none",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              + Create New Ticket
            </button>
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
          {error && (
            <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", color: "var(--danger)", background: "#fff1f2", borderRadius: "8px", fontSize: "0.88rem" }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", color: "#166534", background: "#f0fdf4", borderRadius: "8px", fontSize: "0.88rem" }}>
              {successMsg}
            </div>
          )}

          {/* TAB 1: LIST */}
          {activeTab === "list" && (
            loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}></div>
                <p style={{ fontWeight: 600, margin: 0 }}>No support tickets found</p>
                <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Have a question or issue? Click "+ Create New Ticket" to get help.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {tickets.map((ticket) => {
                  const isResolved = ticket.status === "resolved";
                  const statusBg = isResolved ? "#dcfce7" : ticket.status === "in_progress" ? "#fef3c7" : "#e0f2fe";
                  const statusColor = isResolved ? "#166534" : ticket.status === "in_progress" ? "#92400e" : "#075985";

                  return (
                    <div
                      key={ticket._id}
                      onClick={() => { setSelectedTicket(ticket); setActiveTab("detail"); }}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        padding: "1rem 1.25rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        background: "var(--surface)"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                        <span style={{
                          background: statusBg,
                          color: statusColor,
                          padding: "0.15rem 0.55rem",
                          borderRadius: "10px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase"
                        }}>
                          {ticket.status?.replace("_", " ")}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--primary)", fontSize: "0.95rem" }}>
                        {ticket.title}
                      </h4>
                      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {ticket.description}
                      </p>
                      {ticket.replies && ticket.replies.length > 0 && (
                        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>
                           {ticket.replies.length} reply({ticket.replies.length > 1 ? "ies" : ""})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* TAB 2: CREATE TICKET */}
          {activeTab === "create" && (
            <form onSubmit={handleCreateTicket} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)", marginBottom: "0.3rem" }}>
                  Category
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border)" }}
                >
                  <option value="support">Technical Support</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="rating">Feedback & Rating</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)", marginBottom: "0.3rem" }}>
                  Priority Level
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border)" }}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High / Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)", marginBottom: "0.3rem" }}>
                  Subject / Title *
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of your issue or request..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border)" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)", marginBottom: "0.3rem" }}>
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or feedback in detail..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border)", resize: "vertical" }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                style={{
                  background: "var(--accent)",
                  color: "#ffffff",
                  border: "none",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: creating ? "not-allowed" : "pointer"
                }}
              >
                {creating ? "Submitting Ticket..." : "Submit Support Ticket"}
              </button>
            </form>
          )}

          {/* TAB 3: TICKET THREAD DETAIL */}
          {activeTab === "detail" && selectedTicket && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ borderBottom: "1px solid var(--border)", pb: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", background: "#f3f4f6", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                    {selectedTicket.type}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Status: <strong>{selectedTicket.status}</strong>
                  </span>
                </div>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>{selectedTicket.title}</h3>
                <div style={{ background: "#f8fafc", padding: "0.85rem 1rem", borderRadius: "8px", fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.5 }}>
                  {selectedTicket.description}
                </div>
              </div>

              {/* Thread Messages */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", my: "0.5rem" }}>
                <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Conversation Thread ({selectedTicket.replies?.length || 0})
                </h4>

                {(!selectedTicket.replies || selectedTicket.replies.length === 0) ? (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-light)", fontStyle: "italic" }}>
                    No admin replies yet. We usually respond within 24 hours.
                  </p>
                ) : (
                  selectedTicket.replies.map((reply, idx) => {
                    const isAdmin = reply.senderRole === "admin";
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isAdmin ? "flex-start" : "flex-end",
                          maxWidth: "85%",
                          background: isAdmin ? "#f0fdf4" : "#f1f5f9",
                          border: `1px solid ${isAdmin ? "#bbf7d0" : "#e2e8f0"}`,
                          borderRadius: "10px",
                          padding: "0.75rem 1rem"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.2rem" }}>
                          <strong style={{ fontSize: "0.8rem", color: isAdmin ? "#15803d" : "#334155" }}>
                            {isAdmin ? ` ${reply.senderName} (Admin)` : reply.senderName}
                          </strong>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-main)", lineHeight: 1.4 }}>
                          {reply.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Type a message reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  style={{ flex: 1, padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border)" }}
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyMessage.trim()}
                  style={{
                    background: "var(--accent)",
                    color: "#ffffff",
                    border: "none",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: submittingReply || !replyMessage.trim() ? "not-allowed" : "pointer"
                  }}
                >
                  Reply
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
