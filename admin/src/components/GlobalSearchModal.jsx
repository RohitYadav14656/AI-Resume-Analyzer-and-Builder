import React, { useState, useEffect } from "react";
import { Search, X, Users, FileText, LifeBuoy, Terminal, ArrowRight } from "lucide-react";
import axios from "axios";

export default function GlobalSearchModal({ isOpen, onClose, onNavigate, token }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], resumes: [], tickets: [], logs: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults({ users: [], resumes: [], tickets: [], logs: [] });
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async (val) => {
    setQuery(val);
    if (!val || val.trim().length === 0) {
      setResults({ users: [], resumes: [], tickets: [], logs: [] });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/global-search?q=${encodeURIComponent(val)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setResults(res.data.results);
      }
    } catch (err) {
      console.warn("Global search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalResults =
    (results.users?.length || 0) +
    (results.resumes?.length || 0) +
    (results.tickets?.length || 0) +
    (results.logs?.length || 0);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(46, 37, 32, 0.45)",
        backdropFilter: "blur(10px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        paddingTop: "80px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "75vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          boxShadow: "0 20px 40px -12px rgba(46, 37, 32, 0.2)",
          overflow: "hidden",
          background: "#ffffff",
          border: "1px solid var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color)",
            gap: "12px",
          }}
        >
          <Search size={20} color="#d97706" />
          <input
            type="text"
            autoFocus
            placeholder="Search across Users, Resumes, Tickets, Logs, Settings..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-main)",
              fontSize: "1rem",
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: "var(--surface-2)",
              border: "none",
              color: "var(--text-muted)",
              borderRadius: "6px",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {loading && <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Searching system records...</p>}

          {!loading && query && totalResults === 0 && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", padding: "24px" }}>
              No system records found matching "{query}"
            </p>
          )}

          {/* Users */}
          {results.users?.length > 0 && (
            <div>
              <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#d97706", letterSpacing: "1px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Users size={14} /> Users ({results.users.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {results.users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => {
                      onNavigate("users");
                      onClose();
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "var(--surface-2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>{u.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.email}</p>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className="badge badge-indigo">{u.role}</span>
                      <span className={`badge ${u.status === "active" ? "badge-emerald" : "badge-rose"}`}>{u.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumes */}
          {results.resumes?.length > 0 && (
            <div>
              <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#0284c7", letterSpacing: "1px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText size={14} /> Resumes ({results.resumes.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {results.resumes.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => {
                      onNavigate("resumes");
                      onClose();
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "var(--surface-2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>{r.title || "Untitled Resume"}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{r.userName} • {r.targetJob}</p>
                    </div>
                    <span className="badge badge-emerald">ATS {r.atsScore || 85}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets */}
          {results.tickets?.length > 0 && (
            <div>
              <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#d97706", letterSpacing: "1px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <LifeBuoy size={14} /> Support & Tickets ({results.tickets.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {results.tickets.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => {
                      onNavigate("support");
                      onClose();
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "var(--surface-2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>{t.title}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.userEmail}</p>
                    </div>
                    <span className="badge badge-amber">{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          {results.logs?.length > 0 && (
            <div>
              <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#e11d48", letterSpacing: "1px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Terminal size={14} /> Audit Logs ({results.logs.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {results.logs.map((l) => (
                  <div
                    key={l._id}
                    onClick={() => {
                      onNavigate("logs");
                      onClose();
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "var(--surface-2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>{l.action}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{l.details}</p>
                    </div>
                    <span className="badge badge-indigo">{l.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
