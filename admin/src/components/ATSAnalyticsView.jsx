import React, { useState, useEffect } from "react";
import { BarChart3, Award, Tag, AlertCircle, Briefcase, FileCheck } from "lucide-react";
import axios from "axios";

export default function ATSAnalyticsView({ token }) {
  const [data, setData] = useState({
    averageAtsScore: 84,
    scoreDistribution: [
      { range: "90-100%", count: 42, pct: 31 },
      { range: "80-89%", count: 58, pct: 43 },
      { range: "70-79%", count: 24, pct: 18 },
      { range: "<70%", count: 10, pct: 8 },
    ],
    keywordMatchTrends: [
      { keyword: "React.js", matches: 380, trend: "+12%" },
      { keyword: "Node.js", matches: 310, trend: "+8%" },
      { keyword: "Python", matches: 290, trend: "+15%" },
      { keyword: "TypeScript", matches: 260, trend: "+22%" },
      { keyword: "AWS", matches: 210, trend: "+5%" },
    ],
    commonMissingSkills: [
      "Docker & Containerization",
      "GraphQL / Microservices Architecture",
      "CI/CD Pipeline Automation (GitHub Actions)",
      "Jest & Cypress Testing",
      "Agile Scrum Workflows",
    ],
    industryPerformance: [
      { industry: "Software Engineering", avgScore: 88, total: 64 },
      { industry: "Data Science & AI", avgScore: 86, total: 32 },
      { industry: "Product Management", avgScore: 82, total: 18 },
      { industry: "UI/UX Design", avgScore: 80, total: 14 },
    ],
  });

  useEffect(() => {
    if (!token || token === "demo-admin-token") return;
    axios
      .get("/api/admin/ats-analytics", { headers: { Authorization: `Bearer ${token}` } })
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
          <BarChart3 color="#d97706" size={28} /> ATS Audit & Keyword Analytics
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Track resume compatibility scores, keyword match trends, missing skills, and industry metrics
        </p>
      </div>

      {/* Top Banner KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* ATS Score Gauge Card */}
        <div className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(5, 150, 105, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)",
            border: "4px solid #059669",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px rgba(5, 150, 105, 0.2)",
            marginBottom: "16px"
          }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)" }}>{data.averageAtsScore}%</span>
            <span style={{ fontSize: "0.65rem", color: "#047857", fontWeight: 700, textTransform: "uppercase" }}>Avg System</span>
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>System-Wide ATS Health</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>Based on last 500 analyzed resumes</p>
        </div>

        {/* Score Distribution Breakdown */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Award size={18} color="#059669" /> Resume ATS Score Distribution
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.scoreDistribution?.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "70px", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{d.range}</span>
                <div style={{ flex: 1, height: "10px", background: "var(--surface-2)", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ width: `${d.pct || 25}%`, height: "100%", background: i === 0 ? "#059669" : i === 1 ? "#2e2520" : i === 2 ? "#d97706" : "#e11d48", borderRadius: "6px" }}></div>
                </div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700, width: "60px", textAlign: "right" }}>{d.count} resumes</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid for Keywords & Missing Skills */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Top Keywords */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Tag size={18} color="#0284c7" /> Top Matched ATS Keywords
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Total Matches</th>
                  <th>Monthly Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.keywordMatchTrends?.map((k, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{k.keyword}</td>
                    <td style={{ color: "var(--text-main)" }}>{k.matches}</td>
                    <td><span className="badge badge-emerald">{k.trend}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Common Missing Skills */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} color="#e11d48" /> Most Common Missing ATS Skills
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.commonMissingSkills?.map((skill, index) => (
              <div key={index} style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(225, 29, 72, 0.08)",
                border: "1px solid rgba(225, 29, 72, 0.25)",
                color: "#be123c",
                fontSize: "0.85rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(225, 29, 72, 0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#be123c" }}>
                  {index + 1}
                </span>
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
