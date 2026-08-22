import React, { useState, useEffect, useRef } from "react";
import WebsiteLogo from "./WebsiteLogo";
import {
  Menu,
  X,
  Bell,
  LifeBuoy,
  Zap,
  Plus,
  User,
  LogIn,
  LogOut,
  FileText,
  Search,
  Home,
  ChevronDown,
  Sparkles,
} from "lucide-react";

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
  const [desktopUserDropdownOpen, setDesktopUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const mobileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const desktopDropdownRef = useRef(null);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileDropdownRef.current && 
        !mobileDropdownRef.current.contains(e.target) &&
        (!mobileMenuRef.current || !mobileMenuRef.current.contains(e.target))
      ) {
        setMobileMenuOpen(false);
      }
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target)) {
        setDesktopUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleNavClick = (to) => {
    setMobileMenuOpen(false);
    setDesktopUserDropdownOpen(false);
    onNavigate(to);
  };

  return (
    <>
      <style>{`
        @keyframes headerDropdownSlide {
          from { opacity: 0; transform: translateY(-12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mobile-dropdown-item, .desktop-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-main);
          background: transparent;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
        }

        .mobile-dropdown-item:hover, .mobile-dropdown-item.active,
        .desktop-dropdown-item:hover, .desktop-dropdown-item.active {
          background: rgba(217, 119, 6, 0.1);
          color: var(--accent);
          transform: translateX(4px);
        }

        .mobile-dropdown-item.logout-item, .desktop-dropdown-item.logout-item {
          color: #e11d48;
        }

        .mobile-dropdown-item.logout-item:hover, .desktop-dropdown-item.logout-item:hover {
          background: rgba(225, 29, 72, 0.08);
          transform: translateX(4px);
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
              <div className="user-action-group" style={{ position: "relative" }} ref={desktopDropdownRef}>
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

                {/* Profile Button with AI Credits Badge (Triggers Desktop User Dropdown) */}
                <button
                  onClick={() => setDesktopUserDropdownOpen((prev) => !prev)}
                  onMouseEnter={() => onPreloadRoute && onPreloadRoute("profile")}
                  title="Click for User Menu"
                  className={`profile-action-btn ${view === "profile" ? "active" : ""}`}
                  style={{ display: "flex", alignItems: "center", gap: "0.45rem", cursor: "pointer" }}
                >
                  <User size={17} />
                  <span className="user-name">{user.name}</span>
                  <span className="credits-pill">
                    <Zap size={12} fill="var(--accent)" color="var(--accent)" />
                    {user.aiCredits !== undefined ? user.aiCredits : 100}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: desktopUserDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: "var(--text-muted)"
                    }}
                  />
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

                {/* ===== DESKTOP USER FLOATING DROPDOWN MENU ===== */}
                {desktopUserDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 12px)",
                      right: 0,
                      width: "300px",
                      background: "rgba(255, 255, 255, 0.98)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      border: "1.5px solid rgba(217, 119, 6, 0.25)",
                      borderRadius: "20px",
                      boxShadow: "0 20px 50px -10px rgba(15, 23, 42, 0.2), 0 4px 16px rgba(217, 119, 6, 0.1)",
                      padding: "0.9rem",
                      zIndex: 999,
                      animation: "headerDropdownSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                  >
                    {/* User Card Header */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      background: "linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(245, 158, 11, 0.04))",
                      borderRadius: "14px",
                      marginBottom: "0.75rem",
                      border: "1px solid rgba(217, 119, 6, 0.18)"
                    }}>
                      <div style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #d97706, #b45309)",
                        color: "white",
                        fontWeight: "800",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {user.name ? user.name[0].toUpperCase() : "U"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "var(--accent)", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
                          <Zap size={12} fill="var(--accent)" />
                          {user.aiCredits !== undefined ? user.aiCredits : 100} Credits
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <button
                        className={`desktop-dropdown-item ${view === "profile" ? "active" : ""}`}
                        onClick={() => handleNavClick("profile")}
                      >
                        <User size={16} /> My Profile & Resumes
                      </button>
                      <button
                        className="desktop-dropdown-item"
                        onClick={() => {
                          setDesktopUserDropdownOpen(false);
                          onOpenNotifications && onOpenNotifications();
                        }}
                      >
                        <Bell size={16} /> Notifications
                      </button>
                      <button
                        className="desktop-dropdown-item"
                        onClick={() => {
                          setDesktopUserDropdownOpen(false);
                          onOpenSupport && onOpenSupport();
                        }}
                      >
                        <LifeBuoy size={16} /> Help Desk & Support
                      </button>
                      <button
                        className="desktop-dropdown-item"
                        onClick={() => {
                          setDesktopUserDropdownOpen(false);
                          onOpenBuyCredits && onOpenBuyCredits("credits");
                        }}
                      >
                        <Plus size={16} /> Top up Credits
                      </button>

                      <div style={{ height: "1px", background: "var(--border)", margin: "0.3rem 0" }} />

                      <button
                        className="desktop-dropdown-item logout-item"
                        onClick={() => {
                          setDesktopUserDropdownOpen(false);
                          onLogout && onLogout();
                        }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
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

              </div>
            )}
          </div>

          {/* Mobile Screen Dropdown Trigger Button */}
          <div className="mobile-dropdown-trigger-box" ref={mobileDropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-label={mobileMenuOpen ? "Close mobile navigation menu" : "Open mobile navigation menu"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: user ? "0" : "0.5rem 0.85rem",
                width: user ? "40px" : "auto",
                height: user ? "40px" : "auto",
                borderRadius: user ? "50%" : "12px",
                background: user
                  ? "linear-gradient(135deg, #d97706, #b45309)"
                  : "rgba(217, 119, 6, 0.1)",
                color: user ? "#ffffff" : "var(--accent)",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: user
                  ? "0 4px 10px rgba(217, 119, 6, 0.3)"
                  : "none",
                transition: "all 0.2s ease"
              }}
            >
              {user ? (
                <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </span>
              ) : (
                <>
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                  <span style={{ fontSize: "0.85rem" }}>Menu</span>
                </>
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
            background: "rgba(15, 23, 42, 0.35)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 99998,
          }}
        />
      )}

      {/* ===== MOBILE SCREEN USER DROPDOWN MENU PANEL ===== */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="mobile-dropdown-container"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: "68px",
            left: "14px",
            right: "14px",
            maxWidth: "420px",
            margin: "0 auto",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1.5px solid rgba(217, 119, 6, 0.25)",
            borderRadius: "24px",
            boxShadow: "0 20px 60px -10px rgba(15, 23, 42, 0.25), 0 4px 20px rgba(217, 119, 6, 0.12)",
            padding: "1.1rem",
            zIndex: 99999,
            animation: "headerDropdownSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            overflowY: "auto",
            maxHeight: "calc(90vh - 75px)",
          }}
        >
          {/* Dropdown Logged-in User Profile Header Card */}
          {user && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              padding: "0.9rem",
              background: "linear-gradient(135deg, rgba(217, 119, 6, 0.09), rgba(245, 158, 11, 0.04))",
              borderRadius: "16px",
              marginBottom: "0.9rem",
              border: "1px solid rgba(217, 119, 6, 0.2)"
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #d97706, #b45309)",
                color: "white",
                fontWeight: "800",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(217, 119, 6, 0.35)",
                flexShrink: 0
              }}>
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </h4>
                <span style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "3px" }}>
                  <Zap size={13} fill="var(--accent)" color="var(--accent)" />
                  {user.aiCredits !== undefined ? user.aiCredits : 100} AI Credits
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBuyCredits && onOpenBuyCredits("credits");
                }}
                style={{
                  padding: "0.45rem 0.85rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #d97706, #b45309)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(217, 119, 6, 0.35)",
                  flexShrink: 0
                }}
              >
                + Buy
              </button>
            </div>
          )}

          {/* Navigation Items inside Mobile Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px", padding: "0.25rem 0.5rem 0.1rem" }}>
              Explore Platform
            </div>

            <button
              className={`mobile-dropdown-item ${view === "home" ? "active" : ""}`}
              onClick={() => handleNavClick("home")}
            >
              <Home size={18} /> Home Overview
            </button>
            <button
              className={`mobile-dropdown-item ${view === "builder" ? "active" : ""}`}
              onClick={() => handleNavClick("builder")}
            >
              <FileText size={18} /> AI Resume Builder
            </button>
            <button
              className={`mobile-dropdown-item ${view === "analyzer" ? "active" : ""}`}
              onClick={() => handleNavClick("analyzer")}
            >
              <Search size={18} /> ATS Resume Match & Analyzer
            </button>

            {user ? (
              <>
                <div style={{ height: "1px", background: "var(--border)", margin: "0.4rem 0" }} />
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px", padding: "0.25rem 0.5rem 0.1rem" }}>
                  Account & Services
                </div>

                <button
                  className={`mobile-dropdown-item ${view === "profile" ? "active" : ""}`}
                  onClick={() => handleNavClick("profile")}
                >
                  <User size={18} /> My Profile & Resumes
                </button>
                <button
                  className="mobile-dropdown-item"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNotifications && onOpenNotifications();
                  }}
                >
                  <Bell size={18} /> Notifications & Announcements
                </button>
                <button
                  className="mobile-dropdown-item"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSupport && onOpenSupport();
                  }}
                >
                  <LifeBuoy size={18} /> Help Desk & Support
                </button>

                <div style={{ height: "1px", background: "var(--border)", margin: "0.4rem 0" }} />

                <button
                  className="mobile-dropdown-item logout-item"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout && onLogout();
                  }}
                >
                  <LogOut size={18} /> Sign Out of Account
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.6rem", paddingTop: "0.6rem", borderTop: "1px solid var(--border)" }}>
                <button
                  className="mobile-login-btn"
                  onClick={() => handleNavClick("login")}
                  style={{
                    padding: "0.75rem 1rem",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    borderRadius: "14px",
                    background: "rgba(217, 119, 6, 0.1)",
                    color: "var(--accent)",
                    border: "1px solid rgba(217, 119, 6, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    cursor: "pointer"
                  }}
                >
                  <LogIn size={18} /> Log In / Register
                </button>

              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
