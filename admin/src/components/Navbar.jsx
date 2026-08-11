import React from "react";
import { Search, Bell, RefreshCw, Wifi, Menu } from "lucide-react";

export default function Navbar({
  searchFilter,
  setSearchFilter,
  onRefresh,
  isRefreshing,
  onOpenSearch,
  socketConnected,
  onToggleSidebar,
}) {
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
        <div
          className="admin-search-wrapper"
          onClick={onOpenSearch}
        >
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
          className={`admin-socket-badge ${socketConnected ? "connected" : "syncing"}`}
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
          <RefreshCw size={16} className={isRefreshing ? "spin" : ""} color="var(--text-main)" />
        </button>

        {/* Notification Bell */}
        <div className="admin-bell-box" title="Admin notifications">
          <Bell size={18} color="var(--text-muted)" />
          <span className="bell-badge-dot"></span>
        </div>
      </div>
    </header>
  );
}
