import React, { useState, useEffect } from "react";
import { Cpu, Zap, DollarSign, Clock, AlertTriangle, Layers, Activity } from "lucide-react";
import axios from "axios";

export default function AIAnalyticsView({ token }) {
  const [data, setData] = useState({
    totalPrompts: 3420,
    tokenUsage: { promptTokens: 184000, completionTokens: 290000, totalTokens: 474000 },
    avgResponseTimeMs: 410,
    failedRequestsCount: 14,
    totalCostEst: "$0.8532",
    mostUsedFeatures: [
      { feature: "ATS Resume Screening", count: 1840, pct: 53.8 },
      { feature: "Grammar & Style Fixer", count: 890, pct: 26.0 },
      { feature: "AI Suggestion Generator", count: 420, pct: 12.3 },
      { feature: "Summary Generator", count: 270, pct: 7.9 },
    ],
    modelComparison: [
      { model: "Llama-3.3-70B-Versatile", latencyMs: 380, successRate: "99.6%", costPerKTokens: "$0.0001" },
      { model: "Llama-3.1-8B-Instant", latencyMs: 140, successRate: "99.8%", costPerKTokens: "$0.00005" },
    ],
  });

  useEffect(() => {
    if (!token || token === "demo-admin-token") return;
    axios
      .get("/api/admin/ai-analytics", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data?.success && res.data.analytics) {
          setData(res.data.analytics);
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Cpu color="#d97706" size={28} /> AI Analytics & Token Usage
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Monitor Llama model performance, prompt distribution, latency, and cost metrics
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Total Tokens Processed</span>
            <Zap size={18} color="#2e2520" />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "8px" }}>
            {(data.tokenUsage?.totalTokens || 474000).toLocaleString()}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#047857", marginTop: "4px", display: "inline-block", fontWeight: 600 }}>
            Prompt: {(data.tokenUsage?.promptTokens || 184000).toLocaleString()} • Compl: {(data.tokenUsage?.completionTokens || 290000).toLocaleString()}
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Average Response Time</span>
            <Clock size={18} color="#0284c7" />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "8px" }}>
            {data.avgResponseTimeMs} ms
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "inline-block" }}>
            Groq Llama-3.3 Cloud Processing
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Estimated API Cost</span>
            <DollarSign size={18} color="#059669" />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "8px" }}>
            {data.totalCostEst}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#047857", marginTop: "4px", display: "inline-block", fontWeight: 600 }}>
            Free Tier ($0.00 actual charged)
          </span>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Failed AI Requests</span>
            <AlertTriangle size={18} color="#e11d48" />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "8px" }}>
            {data.failedRequestsCount}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#be123c", marginTop: "4px", display: "inline-block", fontWeight: 600 }}>
            99.6% Success Rate
          </span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Most Used Features */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={18} color="#d97706" /> Most-Used AI Features
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {data.mostUsedFeatures?.map((item, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-main)" }}>
                  <span>{item.feature}</span>
                  <span style={{ color: "#d97706", fontWeight: 600 }}>{item.count} reqs ({item.pct}%)</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "var(--surface-2)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${item.pct}%`, height: "100%", background: "linear-gradient(90deg, #2e2520 0%, #d97706 100%)", borderRadius: "4px" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Comparison Matrix */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={18} color="#0284c7" /> AI Model Comparison Matrix
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Avg Latency</th>
                  <th>Success</th>
                  <th>Cost / 1k</th>
                </tr>
              </thead>
              <tbody>
                {data.modelComparison?.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{m.model}</td>
                    <td style={{ color: "var(--text-main)" }}>{m.latencyMs} ms</td>
                    <td><span className="badge badge-emerald">{m.successRate}</span></td>
                    <td style={{ color: "var(--text-muted)" }}>{m.costPerKTokens}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
