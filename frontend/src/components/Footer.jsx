import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer-basic">
      <div className="footer-basic-container">
        {/* Copyright & Legal Protection */}
        <div className="footer-basic-right" style={{ margin: "0 auto", textAlign: "center", justifyContent: "center" }}>
          <span>ALL RIGHTS RESERVED</span>
          <span className="footer-bullet">•</span>
          <span>© {currentYear} ResumeAI</span>
          <span className="footer-bullet">•</span>
          <span>Copyright Protection</span>
        </div>
      </div>
    </footer>
  );
}

