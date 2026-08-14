import React, { useState, useEffect } from "react";
import api from "../api";

export default function NotificationCenterModal({ isOpen, onClose }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements();
    }
  }, [isOpen]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/user/announcements");
      if (data.success) {
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      setError("Failed to fetch system announcements.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.5)",
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
        maxWidth: "520px",
        maxHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        overflow: "hidden"
      }}>
        {/* Modal Header */}
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
              Notifications & Announcements
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "0.2rem 0.5rem",
              borderRadius: "6px"
            }}
          >
            
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              Loading announcements...
            </div>
          ) : error ? (
            <div style={{ padding: "1rem", color: "var(--danger)", background: "#fff1f2", borderRadius: "8px" }}>
              {error}
            </div>
          ) : announcements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}></div>
              <p style={{ fontWeight: 600, margin: 0 }}>No active announcements</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>You are all caught up with system updates.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {announcements.map((item) => {
                const isMaintenance = item.type === "maintenance";
                const isRelease = item.type === "release";
                const badgeBg = isMaintenance ? "#fef3c7" : isRelease ? "#dcfce7" : "#e0f2fe";
                const badgeColor = isMaintenance ? "#b45309" : isRelease ? "#15803d" : "#0369a1";

                return (
                  <div
                    key={item._id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "1rem 1.25rem",
                      background: "var(--surface)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{
                        background: badgeBg,
                        color: badgeColor,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase"
                      }}>
                        {item.type || "Notice"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <h4 style={{ margin: "0 0 0.35rem 0", color: "var(--primary)", fontSize: "0.95rem", fontWeight: 700 }}>
                      {item.title}
                    </h4>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                      {item.message}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: "1rem 1.5rem",
          borderTop: "1px solid var(--border)",
          textAlign: "right",
          background: "var(--surface-2)"
        }}>
          <button
            onClick={onClose}
            style={{
              background: "var(--primary)",
              color: "#ffffff",
              border: "none",
              padding: "0.5rem 1.25rem",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
