import React from "react";
import WebsiteLogo from "./WebsiteLogo";

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="admin-footer-basic">
      <div className="admin-footer-basic-container">
        {/* Left Side: Admin Brand Name & Logo */}
        <div className="admin-footer-left">
          <WebsiteLogo size="sm" />
          <span className="admin-footer-brand-name">ResumeAI Admin</span>
        </div>

        {/* Right Side: Copyright & Protection */}
        <div className="admin-footer-right">
          <span>ALL RIGHTS RESERVED</span>
          <span className="admin-footer-bullet">•</span>
          <span>© {currentYear} ResumeAI</span>
          <span className="admin-footer-bullet">•</span>
          <span>Copyright Protection</span>
        </div>
      </div>
    </footer>
  );
}

