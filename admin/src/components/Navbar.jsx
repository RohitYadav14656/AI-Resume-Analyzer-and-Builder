import React, { useState } from "react";
import {
  Search,
  Bell,
  RefreshCw,
  Wifi,
  Menu,
  ChevronDown,
  LayoutDashboard,
  Users,
  FileText,
  Cpu,
  Settings,
  LogOut,
  ShieldCheck,
  Activity,
  LifeBuoy,
} from "lucide-react";

export default function Navbar({
  searchFilter,
  setSearchFilter,
  onRefresh,
  isRefreshing,
  onOpenSearch,
  socketConnected,
  onToggleSidebar,
  adminUser,
  onLogout,
  activeTab,
  setActiveTab,
}) {
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const handleMobileNav = (tabId) => {
    if (setActiveTab) setActiveTab(tabId);
    setMobileDropdownOpen(false);
  };

  const navLinks = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "resumes", label: "Resume Management", icon: FileText },
    { id: "ai-analytics", label: "AI Analytics", icon: Cpu },
    { id: "health", label: "System Health", icon: Activity },
    { id: "support", label: "Support Tickets", icon: LifeBuoy },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="admin-header-nav">
      <div className="admin-header-left">
        {/* Mobile Hamburger Toggle for Admin Sidebar */}
        <button
          className="admin-mobile-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation drawer"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Input Trigger */}
        <div className="admin-search-wrapper" onClick={onOpenSearch}>
          <Search
            size={16}
            color="var(--text-muted)"
            className="admin-search-icon"
          />
          <input
            type="text"
            readOnly
            className="search-input admin-search-input"
            placeholder="Search users, resumes, tickets... (Ctrl+K)"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Status & Action Buttons */}
      <div className="admin-header-actions">
        {/* WebSocket Real-time Status */}
        <div
          className={`admin-socket-badge ${
            socketConnected ? "connected" : "syncing"
          }`}
        >
          <Wifi size={14} />
          <span className="socket-badge-text">
            {socketConnected ? "Live Sync" : "Syncing..."}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="btn-secondary admin-icon-btn"
          title="Refresh metrics"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "spin" : ""}
            color="var(--text-main)"
          />
        </button>

        {/* Notification Bell */}
        <div className="admin-bell-box" title="Admin notifications">
          <Bell size={18} color="var(--text-muted)" />
          <span className="bell-badge-dot"></span>
        </div>

        {/* Mobile User Quick Dropdown Button */}
        <div className="admin-mobile-dropdown-wrapper">
          <button
            className="admin-mobile-dropdown-trigger"
            onClick={() => setMobileDropdownOpen((prev) => !prev)}
            aria-label="Admin mobile options menu"
          >
            <div className="admin-mobile-avatar-circle">
              {adminUser?.name ? adminUser.name[0].toUpperCase() : "A"}
            </div>
            <span className="admin-mobile-trigger-text">Admin</span>
            <ChevronDown
              size={14}
              style={{
                transform: mobileDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          {/* Mobile Dropdown Overlay Menu */}
          {mobileDropdownOpen && (
            <>
              <div
                className="admin-mobile-dropdown-backdrop"
                onClick={() => setMobileDropdownOpen(false)}
              />
              <div className="admin-mobile-dropdown-card">
                {/* Admin User Header Info */}
                <div className="admin-mobile-user-card">
                  <div className="admin-mobile-avatar-large">
                    {adminUser?.name ? adminUser.name[0].toUpperCase() : "A"}
                  </div>
                  <div className="admin-mobile-user-details">
                    <div className="admin-mobile-user-name">
                      {adminUser?.name || "System Admin"}
                    </div>
                    <div className="admin-mobile-user-email">
                      {adminUser?.email || "admin@resumeai.com"}
                    </div>
                  </div>
                  <span className="admin-mobile-role-pill">
                    <ShieldCheck size={12} /> Admin
                  </span>
                </div>

                {/* Quick Navigation Links */}
                <div className="admin-mobile-menu-section-title">Navigation</div>
                <div className="admin-mobile-nav-list">
                  {navLinks.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMobileNav(item.id)}
                        className={`admin-mobile-nav-btn ${
                          isActive ? "active" : ""
                        }`}
                      >
                        <IconComponent size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="admin-mobile-divider" />

                {/* Quick Actions */}
                <div className="admin-mobile-action-row">
                  <button
                    className="admin-mobile-quick-action"
                    onClick={() => {
                      setMobileDropdownOpen(false);
                      onRefresh && onRefresh();
                    }}
                  >
                    <RefreshCw size={15} className={isRefreshing ? "spin" : ""} />
                    <span>Refresh</span>
                  </button>

                  <button
                    className="admin-mobile-quick-action"
                    onClick={() => {
                      setMobileDropdownOpen(false);
                      onOpenSearch && onOpenSearch();
                    }}
                  >
                    <Search size={15} />
                    <span>Search</span>
                  </button>
                </div>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    className="admin-mobile-logout-btn"
                    onClick={() => {
                      setMobileDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out of Admin</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
