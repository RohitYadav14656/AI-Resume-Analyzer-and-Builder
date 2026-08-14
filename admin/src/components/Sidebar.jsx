import React from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Cpu,
  BarChart3,
  Bell,
  LifeBuoy,
  Terminal,
  ShieldAlert,
  Activity,
  FileSpreadsheet,
  Settings,
  LogOut,
  X,
  CreditCard,
} from "lucide-react";
import WebsiteLogo from "./WebsiteLogo";

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLogout,
  adminUser,
  isMobileOpen,
  onCloseMobile,
}) {
  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "resumes", label: "Resume Management", icon: FileText },
    { id: "ai-analytics", label: "AI Analytics", icon: Cpu },
    { id: "ats-analytics", label: "ATS Analytics", icon: BarChart3 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "support", label: "Feedback & Support", icon: LifeBuoy },
    { id: "logs", label: "Logs & Monitoring", icon: Terminal },
    { id: "security", label: "Security & RBAC", icon: ShieldAlert },
    { id: "health", label: "System & Health", icon: Activity },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "reports", label: "Reports & Exports", icon: FileSpreadsheet },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`admin-sidebar ${isMobileOpen ? "mobile-open" : ""}`}
      >
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <div className="admin-brand-wrap">
            <WebsiteLogo size="md" />
            <span className="admin-badge-tag">Control Center</span>
          </div>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              className="admin-sidebar-close-btn"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={17} color={isActive ? "#d97706" : "#78716c"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Profile & Logout */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info-box">
            <div className="admin-avatar">
              {adminUser?.name ? adminUser.name[0].toUpperCase() : "A"}
            </div>
            <div className="admin-user-details">
              <p className="admin-user-name">
                {adminUser?.name || "System Admin"}
              </p>
              <p className="admin-user-email">
                {adminUser?.email || "admin@resumeai.com"}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn-secondary admin-signout-btn"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
