import React, { useState } from "react";
import {
  Activity,
  Database,
  Server,
  Cpu,
  HardDrive,
  RefreshCw,
  Power,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";

export default function SystemHealthView({ systemInfo, onRefresh, token }) {
  const [maintenanceMode, setMaintenanceMode] = useState(systemInfo?.maintenanceMode || false);
  const [featureFlags, setFeatureFlags] = useState(
    systemInfo?.featureFlags || {
      aiBuilder: true,
      atsAnalyzer: true,
      pdfExport: true,
      liveSupport: true,
    }
  );

  const [savingConfig, setSavingConfig] = useState(false);
  const [backupMsg, setBackupMsg] = useState(null);

  const memory = systemInfo?.memoryUsage || { rssMb: 52, heapTotalMb: 36, heapUsedMb: 28 };

  const handleToggleMaintenance = async () => {
    const nextMode = !maintenanceMode;
    setMaintenanceMode(nextMode);
    await saveConfig(nextMode, featureFlags);
  };

  const handleToggleFlag = async (flagKey) => {
    const updatedFlags = { ...featureFlags, [flagKey]: !featureFlags[flagKey] };
    setFeatureFlags(updatedFlags);
    await saveConfig(maintenanceMode, updatedFlags);
  };

  const saveConfig = async (mMode, fFlags) => {
    setSavingConfig(true);
    try {
      if (token && token !== "demo-admin-token") {
        await axios.put(
          "/api/admin/system/feature-flags",
          { maintenanceMode: mMode, featureFlags: fFlags },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.warn("Failed to save config:", err);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTriggerBackup = async () => {
    setBackupMsg("Triggering snapshot backup...");
    try {
      if (token && token !== "demo-admin-token") {
        const res = await axios.post(
          "/api/admin/system/backup",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.success) {
          setBackupMsg(`Backup snapshot created at ${new Date(res.data.timestamp).toLocaleTimeString()}`);
        }
      } else {
        setBackupMsg(`Demo snapshot created at ${new Date().toLocaleTimeString()}`);
      }
    } catch (err) {
      setBackupMsg("Backup snapshot failed.");
    } finally {
      setTimeout(() => setBackupMsg(null), 4000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>System Infrastructure & Feature Control</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Monitor node process health, database collections, email queues, feature flags, and maintenance switches.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleTriggerBackup} className="btn-secondary" style={{ fontSize: "0.85rem" }}>
            <RotateCcw size={16} /> Manual DB Backup
          </button>
          <button onClick={onRefresh} className="btn-secondary" style={{ fontSize: "0.85rem" }}>
            <RefreshCw size={16} /> Refresh Metrics
          </button>
        </div>
      </div>

      {backupMsg && (
        <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#047857", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={16} /> {backupMsg}
        </div>
      )}

      {/* Grid Status Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Maintenance Kill Switch</span>
            <Power size={20} color={maintenanceMode ? "#e11d48" : "#059669"} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleToggleMaintenance}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                background: maintenanceMode ? "rgba(225,29,72,0.12)" : "rgba(16,185,129,0.12)",
                color: maintenanceMode ? "#be123c" : "#047857",
                border: `1px solid ${maintenanceMode ? "rgba(225,29,72,0.3)" : "rgba(16,185,129,0.3)"}`,
              }}
            >
              {maintenanceMode ? "MAINTENANCE ACTIVE" : "SYSTEM OPERATIONAL"}
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Database Collections</span>
            <Database size={20} color="#2e2520" />
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            {systemInfo?.database?.usersCount || 14} Users • {systemInfo?.database?.resumesCount || 28} Resumes
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Storage: {systemInfo?.storageUsageMb || 142} MB
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Process Memory (RSS)</span>
            <HardDrive size={20} color="#0284c7" />
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            {memory.rssMb} MB
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Heap: {memory.heapUsedMb} MB / {memory.heapTotalMb} MB
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Email Queue Status</span>
            <Activity size={20} color="#d97706" />
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>
            {systemInfo?.emailQueueStatus || "Idle - 0 pending"}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Nodemailer Transporter Ready
          </p>
        </div>
      </div>

      {/* Feature Flags Grid */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sliders size={18} color="#d97706" /> Dynamic Application Feature Flags
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {[
            { key: "aiBuilder", title: "AI Resume Builder Engine" },
            { key: "atsAnalyzer", title: "ATS Score Audit Engine" },
            { key: "pdfExport", title: "PDF Generation & Text Embedding" },
            { key: "liveSupport", title: "Live User Support & Chat" },
          ].map((item) => {
            const isEnabled = featureFlags[item.key];
            return (
              <div
                key={item.key}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>{item.title}</h4>
                  <span style={{ fontSize: "0.75rem", color: isEnabled ? "#047857" : "#be123c", fontWeight: 600 }}>
                    {isEnabled ? "Feature Active" : "Disabled by Admin"}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleFlag(item.key)}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    border: "none",
                    background: isEnabled ? "linear-gradient(135deg, #059669, #047857)" : "var(--border-color)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: isEnabled ? "25px" : "3px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      transition: "all 0.2s ease",
                    }}
                  ></span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
