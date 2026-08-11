import React, { useState, useEffect, lazy, Suspense } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AdminFooter from "./components/AdminFooter";

// Lazy loading all admin views for optimal code-splitting & performance
const GlobalSearchModal = lazy(() => import("./components/GlobalSearchModal"));
const OverviewView = lazy(() => import("./components/OverviewView"));
const UsersView = lazy(() => import("./components/UsersView"));
const ResumesView = lazy(() => import("./components/ResumesView"));
const AIAnalyticsView = lazy(() => import("./components/AIAnalyticsView"));
const ATSAnalyticsView = lazy(() => import("./components/ATSAnalyticsView"));
const NotificationsView = lazy(() => import("./components/NotificationsView"));
const SupportView = lazy(() => import("./components/SupportView"));
const LogsView = lazy(() => import("./components/LogsView"));
const SecurityView = lazy(() => import("./components/SecurityView"));
const SystemHealthView = lazy(() => import("./components/SystemHealthView"));
const ReportsView = lazy(() => import("./components/ReportsView"));
const SettingsView = lazy(() => import("./components/SettingsView"));
const AdminLogin = lazy(() => import("./components/AdminLogin"));

const ViewLoader = () => (
  <div style={{ padding: "40px", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--accent)" }}>
    <div className="spin" style={{ width: "28px", height: "28px", border: "3px solid rgba(217, 119, 6, 0.2)", borderTopColor: "var(--accent)", borderRadius: "50%" }} />
    <span style={{ marginLeft: "12px", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)" }}>Loading view...</span>
  </div>
);

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser")) || null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [searchFilter, setSearchFilter] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // System State Data
  const [stats, setStats] = useState({
    totalUsers: 14,
    verifiedUsers: 12,
    adminUsersCount: 1,
    activeUsers: 13,
    totalResumes: 28,
    averageAtsScore: 88,
    dailyAiRequests: 142,
    estimatedCost: "$0.0821",
    revenueMonthly: "$4,850.00",
    systemUptimeSeconds: 3600,
  });

  const [charts, setCharts] = useState({
    userGrowth: [
      { month: "Jan", users: 120, resumes: 210 },
      { month: "Feb", users: 240, resumes: 430 },
      { month: "Mar", users: 450, resumes: 890 },
      { month: "Apr", users: 680, resumes: 1240 },
      { month: "May", users: 950, resumes: 1820 },
      { month: "Jun", users: 1310, resumes: 2540 },
      { month: "Jul", users: 1680, resumes: 3120 },
    ],
    atsTrends: [
      { date: "Mon", avgScore: 78, targetScore: 85 },
      { date: "Tue", avgScore: 81, targetScore: 85 },
      { date: "Wed", avgScore: 83, targetScore: 85 },
      { date: "Thu", avgScore: 86, targetScore: 85 },
      { date: "Fri", avgScore: 84, targetScore: 85 },
      { date: "Sat", avgScore: 89, targetScore: 85 },
      { date: "Sun", avgScore: 88, targetScore: 85 },
    ],
  });

  const [recentUsers, setRecentUsers] = useState([
    { _id: "1", name: "Alex Rivera", email: "alex.rivera@example.com", role: "admin", isVerified: true, createdAt: new Date() },
    { _id: "2", name: "Sarah Chen", email: "sarah.chen@tech.io", role: "user", isVerified: true, createdAt: new Date() },
    { _id: "3", name: "Michael Vance", email: "mvance@dev.org", role: "user", isVerified: false, createdAt: new Date() },
  ]);

  const [users, setUsers] = useState([
    { _id: "1", name: "Alex Rivera", email: "alex.rivera@example.com", role: "admin", status: "active", subscription: "enterprise", aiCredits: 999, isVerified: true, createdAt: new Date() },
    { _id: "2", name: "Sarah Chen", email: "sarah.chen@tech.io", role: "user", status: "active", subscription: "pro", aiCredits: 100, isVerified: true, createdAt: new Date() },
    { _id: "3", name: "Michael Vance", email: "mvance@dev.org", role: "user", status: "suspended", subscription: "free", aiCredits: 10, isVerified: false, createdAt: new Date() },
    { _id: "4", name: "David Kim", email: "dkim@ai-labs.com", role: "user", status: "active", subscription: "pro", aiCredits: 75, isVerified: true, createdAt: new Date() },
  ]);

  const [resumes, setResumes] = useState([
    { _id: "r1", title: "Senior Fullstack Engineer", targetJob: "Senior Developer", atsScore: 92, skills: ["React", "Node.js", "MongoDB", "Tailwind"], experience: [{ role: "Lead Dev" }], userId: { name: "Sarah Chen", email: "sarah.chen@tech.io" }, userName: "Sarah Chen", updatedAt: new Date() },
    { _id: "r2", title: "AI Research Specialist", targetJob: "ML Engineer", atsScore: 88, skills: ["Python", "PyTorch", "NLP", "FastAPI"], experience: [{ role: "AI Engineer" }], userId: { name: "David Kim", email: "dkim@ai-labs.com" }, userName: "David Kim", updatedAt: new Date() },
  ]);

  const [systemInfo, setSystemInfo] = useState({
    status: "Healthy",
    uptimeSeconds: 3600,
    nodeVersion: "v20.11.0",
    platform: "win32",
    memoryUsage: { rssMb: 52, heapTotalMb: 36, heapUsedMb: 28 },
    maintenanceMode: false,
    featureFlags: { aiBuilder: true, atsAnalyzer: true, pdfExport: true, liveSupport: true },
  });

  // Socket.IO Setup
  useEffect(() => {
    const socket = io("http://localhost:5000", {
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("join-admin");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("admin:live_notification", (notif) => {
      console.log("Real-Time Socket Broadcast Received:", notif);
    });

    socket.on("user_status_change", ({ userId, isOnline, lastActiveAt }) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === userId ? { ...u, isOnline, lastActiveAt } : u
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Keyboard shortcut Ctrl+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchData = async () => {
    if (!token || token === "demo-admin-token") return;

    setIsRefreshing(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const statsRes = await axios.get("/api/admin/dashboard", { headers }).catch(() => null);
      if (statsRes?.data?.success) {
        setStats(statsRes.data.stats);
        if (statsRes.data.charts) setCharts(statsRes.data.charts);
        if (statsRes.data.recentUsers?.length > 0) setRecentUsers(statsRes.data.recentUsers);
      }

      const usersRes = await axios.get("/api/admin/users", { headers }).catch(() => null);
      if (usersRes?.data?.success && usersRes.data.users?.length > 0) {
        setUsers(usersRes.data.users);
      }

      const resumesRes = await axios.get("/api/admin/resumes", { headers }).catch(() => null);
      if (resumesRes?.data?.success && resumesRes.data.resumes?.length > 0) {
        setResumes(resumesRes.data.resumes);
      }

      const sysRes = await axios.get("/api/admin/system", { headers }).catch(() => null);
      if (sysRes?.data?.success) {
        setSystemInfo(sysRes.data.system);
      }
    } catch (err) {
      console.warn("Using fallback data mode:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleLoginSuccess = (newToken, user) => {
    setToken(newToken);
    setAdminUser(user);
    localStorage.setItem("adminToken", newToken);
    localStorage.setItem("adminUser", JSON.stringify(user));
    toast.success(`Welcome back, ${user.name || "Admin"}! Authenticated successfully.`, { id: "admin-login-success" });
  };

  const handleLogout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast("Logged out of Admin Portal", { icon: "🔒", id: "admin-logout" });
  };

  if (!token) {
    return (
      <Suspense fallback={<ViewLoader />}>
        <Toaster
          position={typeof window !== "undefined" && window.innerWidth < 640 ? "top-center" : "top-right"}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#2e2520",
              color: "#ffffff",
              borderRadius: "12px",
              border: "1px solid rgba(217, 119, 6, 0.3)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              padding: "12px 18px",
              fontSize: "0.9rem",
              maxWidth: "90vw",
            },
          }}
        />
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </Suspense>
    );
  }

  return (
    <div className="admin-app-layout">
      {/* Global Toast Container */}
      <Toaster
        position={typeof window !== "undefined" && window.innerWidth < 640 ? "top-center" : "top-right"}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#2e2520",
            color: "#ffffff",
            borderRadius: "14px",
            border: "1px solid rgba(217, 119, 6, 0.35)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            padding: "12px 18px",
            fontSize: "0.9rem",
            maxWidth: "90vw",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#e11d48",
              secondary: "#ffffff",
            },
          },
        }}
      />

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        adminUser={adminUser}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <Navbar
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          onRefresh={fetchData}
          isRefreshing={isRefreshing}
          onOpenSearch={() => setIsSearchOpen(true)}
          socketConnected={socketConnected}
          onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        <main className="admin-main-content">
          <Suspense fallback={<ViewLoader />}>
            {activeTab === "overview" && (
              <OverviewView
                stats={stats}
                charts={charts}
                recentUsers={recentUsers}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === "users" && (
              <UsersView
                users={users}
                setUsers={setUsers}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                token={token}
              />
            )}

            {activeTab === "resumes" && (
              <ResumesView
                resumes={resumes}
                setResumes={setResumes}
                stats={stats}
                token={token}
              />
            )}

            {activeTab === "ai-analytics" && <AIAnalyticsView token={token} />}

            {activeTab === "ats-analytics" && <ATSAnalyticsView token={token} />}

            {activeTab === "notifications" && <NotificationsView token={token} />}

            {activeTab === "support" && <SupportView token={token} />}

            {activeTab === "logs" && <LogsView token={token} />}

            {activeTab === "security" && <SecurityView token={token} />}

            {activeTab === "health" && <SystemHealthView systemInfo={systemInfo} onRefresh={fetchData} token={token} />}

            {activeTab === "reports" && <ReportsView token={token} />}

            {activeTab === "settings" && <SettingsView />}
          </Suspense>
        </main>

        {/* Admin Footer */}
        <AdminFooter
          setActiveTab={setActiveTab}
          onRefresh={fetchData}
          isRefreshing={isRefreshing}
          socketConnected={socketConnected}
        />
      </div>

      {/* Global Search Command Palette Overlay */}
      <Suspense fallback={null}>
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={(tab) => setActiveTab(tab)}
          token={token}
        />
      </Suspense>
    </div>
  );
}
