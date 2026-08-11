import React, { useState } from "react";
import { FileSpreadsheet, Download, Calendar, CheckCircle2 } from "lucide-react";

export default function ReportsView({ token }) {
  const [reportType, setReportType] = useState("daily");
  const [format, setFormat] = useState("json");
  const [generating, setGenerating] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");

  const handleGenerate = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setGenerating(true);
    setDownloadMsg("");

    setTimeout(() => {
      setGenerating(false);
      setDownloadMsg(`Successfully generated ${reportType.toUpperCase()} report in .${format.toUpperCase()} format!`);

      const sampleReport = {
        title: `System Performance Report (${reportType.toUpperCase()})`,
        generatedAt: new Date().toLocaleString(),
        metrics: {
          totalUsers: 1420,
          resumesCreated: 3120,
          avgAtsScore: "88%",
          aiCreditsConsumed: 18420,
          dailyAiRequests: 342,
          revenue: "$4,850.00",
        },
      };

      if (format === "json") {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleReport, null, 2));
        const dl = document.createElement("a");
        dl.setAttribute("href", dataStr);
        dl.setAttribute("download", `report-${reportType}-${Date.now()}.json`);
        document.body.appendChild(dl);
        dl.click();
        dl.remove();
      } else if (format === "csv") {
        const csvStr = `Metric,Value\nReport Title,${sampleReport.title}\nGenerated At,${sampleReport.generatedAt}\nTotal Users,1420\nResumes Created,3120\nAvg ATS Score,88%\nAI Credits Consumed,18420\nDaily AI Requests,342\nMonthly Revenue,$4850.00`;
        const dataStr = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvStr);
        const dl = document.createElement("a");
        dl.setAttribute("href", dataStr);
        dl.setAttribute("download", `report-${reportType}-${Date.now()}.csv`);
        document.body.appendChild(dl);
        dl.click();
        dl.remove();
      } else if (format === "excel") {
        // Excel compatible XML / CSV spreadsheet format
        const excelContent = `Metric\tValue\nReport Title\t${sampleReport.title}\nGenerated At\t${sampleReport.generatedAt}\nTotal Users\t1420\nResumes Created\t3120\nAvg ATS Score\t88%\nAI Credits Consumed\t18420\nDaily AI Requests\t342\nMonthly Revenue\t$4850.00`;
        const dataStr = "data:application/vnd.ms-excel;charset=utf-8,\uFEFF" + encodeURIComponent(excelContent);
        const dl = document.createElement("a");
        dl.setAttribute("href", dataStr);
        dl.setAttribute("download", `report-${reportType}-${Date.now()}.xls`);
        document.body.appendChild(dl);
        dl.click();
        dl.remove();
      } else if (format === "pdf") {
        // Formatted Document Report
        const pdfContent = `====================================================\n${sampleReport.title}\nGenerated: ${sampleReport.generatedAt}\n====================================================\n\nMETRICS SUMMARY:\n----------------------------------------------------\nTotal Registered Users : 1,420\nResumes Created        : 3,120\nAvg ATS Compatibility  : 88%\nAI Credits Consumed    : 18,420\nDaily AI Reqs          : 342 Reqs/day\nMonthly Revenue        : $4,850.00\n----------------------------------------------------\nSystem Status          : HEALTHY (Operational)\n====================================================`;
        const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(pdfContent);
        const dl = document.createElement("a");
        dl.setAttribute("href", dataStr);
        dl.setAttribute("download", `report-${reportType}-${Date.now()}.pdf`);
        document.body.appendChild(dl);
        dl.click();
        dl.remove();
      }
    }, 500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
          <FileSpreadsheet color="#059669" size={28} /> Automated Reports & Data Exports
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Generate scheduled system performance, AI consumption, and user analytics reports in CSV, Excel, JSON, or PDF
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Generator Form */}
        <div className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={18} color="#d97706" /> Report Generator Studio
          </h3>

          {downloadMsg && (
            <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#047857", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} /> {downloadMsg}
            </div>
          )}

          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Report Period Frequency</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
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
                <option value="daily">Daily Summary Report</option>
                <option value="weekly">Weekly Performance & ATS Trends</option>
                <option value="monthly">Monthly Growth & Revenue Breakdown</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Export File Format</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {["csv", "json", "excel", "pdf"].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: "none",
                      background: format === fmt ? "linear-gradient(135deg, #2e2520 0%, #d97706 100%)" : "var(--surface-2)",
                      color: format === fmt ? "#ffffff" : "var(--text-main)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="glow-btn" disabled={generating} style={{ justifyContent: "center", marginTop: "10px" }}>
              {generating ? "Compiling Report..." : `Generate & Download .${format.toUpperCase()} File`} <Download size={16} />
            </button>
          </form>
        </div>

        {/* Available Pre-Compiled Reports */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>Pre-Compiled System Reports</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { name: "Daily System & AI Log Summary", size: "45 KB", date: "Today", fmt: "excel" },
              { name: "Weekly ATS Audit Trends & Missing Skills", size: "120 KB", date: "Yesterday", fmt: "csv" },
              { name: "Monthly Platform User Growth & Revenue", size: "380 KB", date: "3 days ago", fmt: "json" },
              { name: "Security Audit & JWT Rotation Log", size: "95 KB", date: "5 days ago", fmt: "pdf" },
            ].map((rep, idx) => (
              <div
                key={idx}
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>{rep.name}</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{rep.date} • {rep.size}</p>
                </div>
                <button
                  className="btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  onClick={() => {
                    setFormat(rep.fmt);
                    handleGenerate();
                  }}
                >
                  <Download size={14} /> Download .{rep.fmt.toUpperCase()}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
