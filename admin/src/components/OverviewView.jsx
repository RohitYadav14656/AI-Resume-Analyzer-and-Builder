import React from "react";
import {
  Users,
  FileText,
  Award,
  Shield,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  CheckCircle,
  Zap,
  DollarSign,
  Activity,
  Calendar,
  Download,
} from "lucide-react";

export default function OverviewView({ stats, recentUsers, onNavigate, charts }) {
  const userGrowthData = charts?.userGrowth || [
    { month: "Jan", users: 120, resumes: 210 },
    { month: "Feb", users: 240, resumes: 430 },
    { month: "Mar", users: 450, resumes: 890 },
    { month: "Apr", users: 680, resumes: 1240 },
    { month: "May", users: 950, resumes: 1820 },
    { month: "Jun", users: 1310, resumes: 2540 },
    { month: "Jul", users: 1680, resumes: 3120 },
  ];

  const atsTrendData = charts?.atsTrends || [
    { date: "Mon", avgScore: 78, targetScore: 85 },
    { date: "Tue", avgScore: 81, targetScore: 85 },
    { date: "Wed", avgScore: 83, targetScore: 85 },
    { date: "Thu", avgScore: 86, targetScore: 85 },
    { date: "Fri", avgScore: 84, targetScore: 85 },
    { date: "Sat", avgScore: 89, targetScore: 85 },
    { date: "Sun", avgScore: 88, targetScore: 85 },
  ];

  const statCards = [
    {
      title: "Total Registered Users",
      value: stats?.totalUsers || 1420,
      sub: `${stats?.verifiedUsers || 1240} verified • ${stats?.activeUsers || 1390} active`,
      icon: Users,
      color: "#2e2520",
      bgColor: "rgba(46, 37, 32, 0.08)",
    },
    {
      title: "Resumes Built / Analyzed",
      value: stats?.totalResumes || 3120,
      sub: "+18.4% growth this month",
      icon: FileText,
      color: "#d97706",
      bgColor: "rgba(217, 119, 6, 0.12)",
    },
    {
      title: "Average System ATS Score",
      value: `${stats?.averageAtsScore || 88}%`,
      sub: "Target: 85% benchmark",
      icon: Award,
      color: "#059669",
      bgColor: "rgba(5, 150, 105, 0.12)",
    },
    {
      title: "Daily AI Requests",
      value: stats?.dailyAiRequests || 342,
      sub: `Cost Est: ${stats?.estimatedCost || "$0.0821"}`,
      icon: Zap,
      color: "#0284c7",
      bgColor: "rgba(2, 132, 199, 0.12)",
    },
    {
      title: "Monthly Revenue (Future Ready)",
      value: stats?.revenueMonthly || "$4,850.00",
      sub: "Pro & Enterprise Subscriptions",
      icon: DollarSign,
      color: "#d97706",
      bgColor: "rgba(217, 119, 6, 0.12)",
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "28px 32px",
          background: "linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(46, 37, 32, 0.04) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "6px" }}>
            Admin Control Center Overview
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Real-time platform analytics, user growth, ATS trends, AI request monitoring, and infrastructure status.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => onNavigate("reports")} className="btn-secondary">
            <Download size={16} /> Export Reports
          </button>
          <button onClick={() => onNavigate("users")} className="glow-btn">
            Manage Users <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>{card.title}</span>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: card.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color={card.color} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.5px" }}>
                {card.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <TrendingUp size={13} color="#059669" /> {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* User Growth & Resume Creation Analytics (SVG Chart) */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={18} color="#d97706" /> User Growth & Resume Creation
            </h3>
            <span className="badge badge-indigo">Monthly Trend</span>
          </div>

          <div style={{ height: "180px", width: "100%", position: "relative", display: "flex", alignItems: "flex-end", gap: "12px", paddingTop: "20px" }}>
            {userGrowthData.map((d, idx) => {
              const maxVal = 3500;
              const userH = (d.users / maxVal) * 140;
              const resH = (d.resumes / maxVal) * 140;
              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "4px", height: "140px" }}>
                    <div
                      title={`Users: ${d.users}`}
                      style={{
                        width: "40%",
                        height: `${userH}px`,
                        background: "linear-gradient(180deg, #2e2520 0%, #1f1915 100%)",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s ease",
                      }}
                    ></div>
                    <div
                      title={`Resumes: ${d.resumes}`}
                      style={{
                        width: "40%",
                        height: `${resH}px`,
                        background: "linear-gradient(180deg, #d97706 0%, #b45309 100%)",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s ease",
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{d.month}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", background: "#2e2520", borderRadius: "2px" }}></span> Total Users
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", background: "#d97706", borderRadius: "2px" }}></span> Resumes Generated
            </span>
          </div>
        </div>

        {/* ATS Score Trends Analytics */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Award size={18} color="#059669" /> ATS Score Trends vs Target
            </h3>
            <span className="badge badge-emerald">7-Day Rolling</span>
          </div>

          <div style={{ height: "180px", width: "100%", display: "flex", alignItems: "flex-end", gap: "12px", paddingTop: "20px" }}>
            {atsTrendData.map((d, idx) => {
              const h = (d.avgScore / 100) * 140;
              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end", height: "140px" }}>
                    <div
                      title={`Avg ATS Score: ${d.avgScore}%`}
                      style={{
                        width: "60%",
                        height: `${h}px`,
                        background: d.avgScore >= 85 ? "linear-gradient(180deg, #059669 0%, #047857 100%)" : "linear-gradient(180deg, #d97706 0%, #b45309 100%)",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s ease",
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{d.date}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
            <span>Target Benchmark: <strong style={{ color: "#059669" }}>85%</strong></span>
            <span>Current Average: <strong style={{ color: "var(--text-main)" }}>{stats?.averageAtsScore || 88}%</strong></span>
          </div>
        </div>
      </div>

      {/* Grid Split: System Load & Recent Signups */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
        {/* System Load & Health Widget */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>Server Health & Resources</h3>
            <Cpu size={18} color="#2e2520" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>Groq Llama-3.3 AI Engine</span>
                <span style={{ color: "#059669", fontWeight: 600 }}>Optimal (99.8%)</span>
              </div>
              <div style={{ height: "8px", background: "var(--surface-2)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "98%", height: "100%", background: "linear-gradient(90deg, #059669, #10b981)" }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>Memory Heap Usage</span>
                <span style={{ color: "#b45309", fontWeight: 600 }}>28 MB / 64 MB</span>
              </div>
              <div style={{ height: "8px", background: "var(--surface-2)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "44%", height: "100%", background: "linear-gradient(90deg, #2e2520, #d97706)" }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>Verified User Ratio</span>
                <span style={{ color: "#0284c7", fontWeight: 600 }}>88% Verified</span>
              </div>
              <div style={{ height: "8px", background: "var(--surface-2)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "88%", height: "100%", background: "linear-gradient(90deg, #0284c7, #38bdf8)" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent User Signups */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>Recent Registered Users</h3>
            <button onClick={() => onNavigate("users")} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
              View All Users
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{u.name}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.email}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.role === "admin" ? "badge-indigo" : "badge-emerald"}`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td>
                        {u.isVerified ? (
                          <span className="badge badge-emerald" style={{ fontSize: "0.7rem" }}>
                            <CheckCircle size={12} /> Verified
                          </span>
                        ) : (
                          <span className="badge badge-amber" style={{ fontSize: "0.7rem" }}>
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                      No recent users registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
