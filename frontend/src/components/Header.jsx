import React, { useState, useEffect } from "react";
import WebsiteLogo from "./WebsiteLogo";
import { Menu, X, Bell, LifeBuoy, Zap, Plus, User, LogIn, LogOut, FileText, Search, Home, ChevronDown } from "lucide-react";

export default function Header({
  view,
  user,
  onNavigate,
  onPreloadRoute,
  onLogout,
  onOpenNotifications,
  onOpenSupport,
  onOpenBuyCredits,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background body scrolling when mobile dropdown is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (to) => {
    setMobileMenuOpen(false);
    onNavigate(to);
  };

  return (
    <>
      <style>{`
        @keyframes headerDropdownSlide {
          from { opacity: 0; transform: translateY(-12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mobile-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-main);
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .mobile-dropdown-item:hover, .mobile-dropdown-item.active {
          background: rgba(217, 119, 6, 0.08);
          color: var(--accent);
        }

        .mobile-dropdown-item.logout-item {
          color: #e11d48;
        }

        .mobile-dropdown-item.logout-item:hover {
          background: rgba(225, 29, 72, 0.08);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0.75rem 1.25rem;
          width: 100%;
        }

        .header-nav-desktop,
        .header-actions-desktop {
          display: flex;
          align-items: center;
        }

        .mobile-dropdown-trigger-box {
          display: none;
        }

        @media (max-width: 991px) {
          .header-nav-desktop,
          .header-actions-desktop {
            display: none !important;
          }

          .mobile-dropdown-trigger-box {
            display: flex !important;
          }

          .header-container {
            padding: 0.65rem 1rem !important;
          }
        }
      `}</style>

      {/* ===== HEADER BAR ===== */}
      <header
        className={`site-header ${scrolled ? "scrolled" : ""}`}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: scrolled
            ? "rgba(248, 250, 252, 0.96)"
            : "rgba(248, 250, 252, 0.90)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: scrolled ? "0 4px 20px -2px rgba(15, 23, 42, 0.06)" : "none",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform, background",
        }}
      >
        <div className="header-container">
          {/* Left: Brand Logo */}
          <div className="header-left">
            <WebsiteLogo size="md" onClick={() => handleNavClick("home")} style={{ cursor: "pointer" }} />
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="header-nav-desktop" aria-label="Main Navigation">
            <button
              className={`nav-tab-btn ${view === "home" ? "active" : ""}`}
              onClick={() => handleNavClick("home")}
            >
              <Home size={16} /> Home
            </button>
            <button
              className={`nav-tab-btn ${view === "builder" ? "active" : ""}`}
              onMouseEnter={() => onPreloadRoute && onPreloadRoute("builder")}
              onClick={() => handleNavClick("builder")}
            >
              <FileText size={16} /> Resume Builder
            </button>
            <button
              className={`nav-tab-btn ${view === "analyzer" ? "active" : ""}`}
              onMouseEnter={() => onPreloadRoute && onPreloadRoute("analyzer")}
              onClick={() => handleNavClick("analyzer")}
            >
              <Search size={16} /> AI Analyzer
            </button>
          </nav>

          {/* Right: Desktop User Actions */}
          <div className="header-actions-desktop">
            {user ? (
              <div className="user-action-group">
                {/* Notifications Trigger */}
                <button
                  onClick={onOpenNotifications}
                  title="Notifications & Announcements"
                  className="icon-action-btn"
                  aria-label="Open notifications"
                >
                  <Bell size={18} color="var(--text-main)" />
                </button>

                {/* Support Tickets Trigger */}
                <button
                  onClick={onOpenSupport}
                  title="Help Desk & Support Tickets"
                  className="icon-action-btn support-btn"
                  aria-label="Open support desk"
                >
                  <LifeBuoy size={17} color="var(--text-main)" />
                  <span className="btn-label">Support</span>
                </button>

                {/* Profile Button with AI Credits Badge */}
                <button
                  onClick={() => handleNavClick("profile")}
                  onMouseEnter={() => onPreloadRoute && onPreloadRoute("profile")}
                  title="View Profile & Credits"
                  className={`profile-action-btn ${view === "profile" ? "active" : ""}`}
                >
                  <User size={17} />
                  <span className="user-name">{user.name}</span>
                  <span className="credits-pill">
                    <Zap size={12} fill="var(--accent)" color="var(--accent)" />
                    {user.aiCredits !== undefined ? user.aiCredits : 100}
                  </span>
                </button>

                {/* Buy Credits CTA */}
                <button
                  onClick={() => onOpenBuyCredits && onOpenBuyCredits("credits")}
                  title="Top up AI Credits"
                  className="buy-credits-btn"
                >
                  <Plus size={15} /> Buy Credits
                </button>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="logout-nav-btn"
                  title="Sign out of account"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="guest-action-group">
                <button
                  className="nav-secondary-btn"
                  onMouseEnter={() => onPreloadRoute && onPreloadRoute("login")}
                  onClick={() => handleNavClick("login")}
                >
                  <LogIn size={16} /> Log In
                </button>
                <button
                  className="nav-primary-btn"
                  onMouseEnter={() => onPreloadRoute && onPreloadRoute("builder")}
                  onClick={() => handleNavClick("builder")}
                >
                  Build Resume Free →
                </button>
              </div>
            )}
          </div>

          {/* Mobile Screen Menu Button (Triggers Mobile Dropdown) */}
          <div className="mobile-dropdown-trigger-box">
            <button
              className="mobile-hamburger-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-label={mobileMenuOpen ? "Close menu dropdown" : "Open menu dropdown"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.95rem",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #d97706, #b45309)",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 3px 12px rgba(217, 119, 6, 0.35)"
              }}
            >
              {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#ffffff", color: "#d97706", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <span>Menu</span>
                  <ChevronDown size={15} style={{ transform: mobileMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                  <span>Menu</span>
                  <ChevronDown size={15} style={{ transform: mobileMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE DROPDOWN BACKDROP OVERLAY ===== */}
      {mobileMenuOpen && (
        <div
          className="mobile-dropdown-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.28)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 99998,
          }}
        />
      )}

      {/* ===== MOBILE SCREEN DROPDOWN PANEL ===== */}
      {mobileMenuOpen && (
        <div
          className="mobile-dropdown-container"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: "64px",
            left: "12px",
            right: "12px",
            maxWidth: "420px",
            margin: "0 auto",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1.5px solid rgba(217, 119, 6, 0.25)",
            borderRadius: "22px",
            boxShadow: "0 20px 50px -10px rgba(15, 23, 42, 0.22), 0 4px 16px rgba(217, 119, 6, 0.1)",
            padding: "1rem",
            zIndex: 99999,
            animation: "headerDropdownSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            overflowY: "auto",
            maxHeight: "calc(90vh - 70px)",
          }}
        >
          {/* Dropdown User Info Card */}
          {user && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              padding: "0.85rem",
              background: "linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(245, 158, 11, 0.04))",
              borderRadius: "14px",
              marginBottom: "0.85rem",
              border: "1px solid rgba(217, 119, 6, 0.18)"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #d97706, #b45309)",
                color: "white",
                fontWeight: "800",
                fontSize: "1.05rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)"
              }}>
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </h4>
                <span style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "2px" }}>
                  <Zap size={13} fill="var(--accent)" color="var(--accent)" />
                  {user.aiCredits !== undefined ? user.aiCredits : 100} Credits
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBuyCredits && onOpenBuyCredits("credits");
                }}
                style={{
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  borderRadius: "10px",
                  background: "var(--accent)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(217, 119, 6, 0.3)"
                }}
              >
                + Buy
              </button>
            </div>
          )}

          {/* Navigation Items inside Mobile Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <button
              className={`mobile-dropdown-item ${view === "home" ? "active" : ""}`}
              onClick={() => handleNavClick("home")}
            >
              <Home size={17} /> Home
            </button>
            <button
              className={`mobile-dropdown-item ${view === "builder" ? "active" : ""}`}
              onClick={() => handleNavClick("builder")}
            >
              <FileText size={17} /> Resume Builder
            </button>
            <button
              className={`mobile-dropdown-item ${view === "analyzer" ? "active" : ""}`}
              onClick={() => handleNavClick("analyzer")}
            >
              <Search size={17} /> AI Resume Analyzer
            </button>

            {user ? (
              <>
                <div style={{ height: "1px", background: "var(--border)", margin: "0.35rem 0" }} />
                <button
                  className={`mobile-dropdown-item ${view === "profile" ? "active" : ""}`}
                  onClick={() => handleNavClick("profile")}
                >
                  <User size={17} /> My Profile & Resumes
                </button>
                <button
                  className="mobile-dropdown-item"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNotifications();
                  }}
                >
                  <Bell size={17} /> Notifications & Announcements
                </button>
                <button
                  className="mobile-dropdown-item"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSupport();
                  }}
                >
                  <LifeBuoy size={17} /> Help Desk & Support
                </button>
                <button
                  className="mobile-dropdown-item logout-item"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={17} /> Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
                <button
                  className="mobile-login-btn"
                  onClick={() => handleNavClick("login")}
                  style={{ padding: "0.7rem 1rem", fontSize: "0.9rem", fontWeight: 700, borderRadius: "12px", background: "rgba(217, 119, 6, 0.1)", color: "var(--accent)", border: "1px solid rgba(217, 119, 6, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer" }}
                >
                  <LogIn size={17} /> Log In / Register
                </button>
                <button
                  className="mobile-start-btn"
                  onClick={() => handleNavClick("builder")}
                  style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", fontWeight: 700, borderRadius: "12px", background: "linear-gradient(135deg, #d97706, #b45309)", color: "white", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(217, 119, 6, 0.3)" }}
                >
                  Build Resume Free →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
