import { useState, useEffect, useCallback } from "react";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Auth from "./pages/Auth";
import ResumeScene3D from "./components/ResumeScene3D";
import SplineScene from "./components/SplineScene";
import RiveCTA from "./components/RiveCTA";
import LottieIcon from "./components/LottieIcon";
import { motion, AnimatePresence } from "framer-motion";
import api, { setAccessToken, clearAccessToken, registerLogoutCallback } from "./api";
// Local robust CountUp component to avoid bundler/library interop issues
function CountUp({ end, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <>{count}{suffix}</>;
}

const emptyExperience = { company: "", role: "", duration: "", description: "" };
const emptyEducation = { school: "", degree: "", year: "" };

export default function App() {
  const [view, setView] = useState("home"); // "home" | "builder" | "analyzer" | "login"
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // Access token lives in memory only (api.js) — NOT in localStorage.
  // We keep a boolean here just to know if the user is authenticated.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [form, setForm] = useState({
    userName: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    summary: "",
    skills: "",
    experience: [emptyExperience],
    education: [emptyEducation],
    projects: [{ name: "", description: "", techStack: "", link: "" }],
    extra: "",
  });

  // Pre-fill userName/email if user logs in
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        userName: prev.userName || user.name || "",
        email: prev.email || user.email || ""
      }));
    }
  }, [user]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const navigate = (to) => {
    setMobileMenuOpen(false);
    if ((to === "builder" || to === "analyzer") && !user) {
      setRedirectTarget(to);
      setView("login");
    } else {
      setView(to);
    }
    scrollToTop();
  };

  const handleAuthSuccess = (userData, accessToken) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Store access token in memory (never localStorage)
    setAccessToken(accessToken);
    // Only persist the user info (NOT the token) for page-reload UX
    localStorage.setItem("user", JSON.stringify(userData));
    
    if (redirectTarget) {
      setView(redirectTarget);
      setRedirectTarget(null);
    } else {
      setView("home");
    }
    scrollToTop();
  };

  // Shared logout logic — called by button AND by axios interceptor on refresh failure
  const performLogout = useCallback(async () => {
    try {
      // Tell the server to delete the refresh token from DB and clear the HttpOnly cookie
      await api.post("/api/auth/logout");
    } catch {
      // Even if the server call fails, clear client state
    } finally {
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      setView("home");
      setMobileMenuOpen(false);
      scrollToTop();
    }
  }, []);

  // Register the global logout callback so the axios interceptor can
  // trigger logout when a token refresh fails (e.g. refresh token expired).
  useEffect(() => {
    registerLogoutCallback(performLogout);
  }, [performLogout]);

  const handleLogout = () => performLogout();

  return (
    <div>
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        {/* Brand Logo */}
        <button
          className="navbar-brand"
          style={{ background: "none", color: "inherit", padding: 0, boxShadow: "none", transform: "none", fontFamily: "inherit", overflow: "visible", whiteSpace: "nowrap" }}
          onClick={() => navigate("home")}
        >
          <span className="brand-dot" />
          ResumeAI
        </button>

        {/* Desktop Center Tabs */}
        <div className="navbar-center navbar-desktop-only">
          {view !== "home" && view !== "login" ? (
            <>
              <button
                className={`nav-link ${view === "builder" ? "active" : ""}`}
                onClick={() => navigate("builder")}
              >
                ✏️ Resume Builder
              </button>
              <button
                className={`nav-link ${view === "analyzer" ? "active" : ""}`}
                onClick={() => navigate("analyzer")}
              >
                🔍 AI Analyzer
              </button>
            </>
          ) : view === "home" ? (
            <>
              <button className="nav-link" onClick={() => navigate("builder")}>Builder</button>
              <button className="nav-link" onClick={() => navigate("analyzer")}>Analyzer</button>
            </>
          ) : null}
        </div>

        {/* Desktop Auth Actions */}
        <div className="navbar-actions navbar-desktop-only">
          {user ? (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-main)" }}>
                👤 {user.name}
              </span>
              <button
                className="btn-nav secondary"
                style={{ background: "transparent", border: "1.5px solid var(--border)", color: "var(--text-main)", padding: "0.5rem 1.1rem", fontSize: "0.875rem", borderRadius: "8px", boxShadow: "none" }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                className="btn-nav secondary"
                style={{ background: "transparent", border: "1.5px solid var(--border)", color: "var(--text-main)", padding: "0.5rem 1.1rem", fontSize: "0.875rem", borderRadius: "8px", boxShadow: "none" }}
                onClick={() => navigate("login")}
              >
                Log In
              </button>
              <button
                className="btn-nav"
                style={{ padding: "0.5rem 1.1rem", fontSize: "0.875rem", borderRadius: "8px" }}
                onClick={() => {
                  setRedirectTarget("builder");
                  setView("login");
                }}
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`hamburger-line ${mobileMenuOpen ? "open-1" : ""}`} />
          <span className={`hamburger-line ${mobileMenuOpen ? "open-2" : ""}`} />
          <span className={`hamburger-line ${mobileMenuOpen ? "open-3" : ""}`} />
        </button>
      </nav>

      {/* Mobile Slide-Down Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            className="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Nav Links */}
            <div className="mobile-menu-links">
              <button
                className={`mobile-nav-link ${view === "home" ? "active" : ""}`}
                onClick={() => navigate("home")}
              >
                🏠 Home
              </button>
              <button
                className={`mobile-nav-link ${view === "builder" ? "active" : ""}`}
                onClick={() => navigate("builder")}
              >
                ✏️ Resume Builder
              </button>
              <button
                className={`mobile-nav-link ${view === "analyzer" ? "active" : ""}`}
                onClick={() => navigate("analyzer")}
              >
                🔍 AI Analyzer
              </button>
            </div>

            {/* Divider */}
            <div className="mobile-menu-divider" />

            {/* Auth Section */}
            <div className="mobile-menu-auth">
              {user ? (
                <>
                  <div className="mobile-user-info">
                    <span className="mobile-user-avatar">👤</span>
                    <div>
                      <div className="mobile-user-name">{user.name}</div>
                      <div className="mobile-user-email">{user.email}</div>
                    </div>
                  </div>
                  <button
                    className="mobile-auth-btn mobile-auth-btn-secondary"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="mobile-auth-row">
                  <button
                    className="mobile-auth-btn mobile-auth-btn-secondary"
                    onClick={() => navigate("login")}
                  >
                    Log In
                  </button>
                  <button
                    className="mobile-auth-btn mobile-auth-btn-primary"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setRedirectTarget("builder");
                      setView("login");
                      scrollToTop();
                    }}
                  >
                    Get Started →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== VIEWS ===== */}
      {view === "home" && <HeroPage navigate={navigate} />}
      {view === "builder" && <ResumeBuilder form={form} setForm={setForm} />}
      {view === "analyzer" && <ResumeAnalyzer form={form} setForm={setForm} setView={setView} />}
      {view === "login" && <Auth onAuthSuccess={handleAuthSuccess} />}
    </div>
  );
}

/* ===== HERO PAGE ===== */
function HeroPage({ navigate }) {
  const [analyzingState, setAnalyzingState] = useState(false);

  return (
    <>
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-bg-glow" />
        <div className="hero-bg-glow-2" />

        <div className="hero-grid-split">
          {/* LEFT CONTENT */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <LottieIcon type="sparkle" width={20} height={20} />
              <span className="badge-dot" />
              AI-Powered Resume Intelligence
            </div>

            <h1 className="hero-title" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
              Build Resumes That<br />
              <span className="gradient-text" style={{ background: "linear-gradient(135deg, var(--accent) 0%, #d97706 50%, #f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Actually Get You Hired
              </span>
            </h1>

            <p className="hero-subtitle" style={{ marginLeft: 0 }}>
              Create professional, ATS-optimized resumes in minutes — then let our AI
              analyze every detail and give you a real score before you apply.
            </p>

            <div className="hero-actions" style={{ justifyContent: "flex-start", gap: "1rem" }}>
              <button 
                className="glow-btn" 
                style={{ padding: "0.9rem 2.2rem", fontSize: "1rem", borderRadius: "16px", fontWeight: "700" }} 
                onClick={() => navigate("builder")}
              >
                🚀 Build My Resume
              </button>

              <RiveCTA 
                label={analyzingState ? "Analyzing..." : "Analyze Resume"} 
                onClick={() => {
                  setAnalyzingState(true);
                  setTimeout(() => {
                    setAnalyzingState(false);
                    navigate("analyzer");
                  }, 2000);
                }} 
              />
            </div>

            {analyzingState && (
              <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <LottieIcon type="spinner" width={24} height={24} />
                <span className="dots-typing" style={{ fontSize: "0.9rem", color: "var(--accent)" }}>
                  AI is analyzing <span></span><span></span><span></span>
                </span>
              </div>
            )}

            <div className="hero-stats" style={{ justifyContent: "flex-start", marginTop: "3rem" }}>
              <div className="stat-item" style={{ textAlign: "left" }}>
                <div className="stat-number" style={{ color: "var(--accent)" }}>
                  <CountUp end={98} duration={2} suffix="%" />
                </div>
                <div className="stat-label">ATS Pass Rate</div>
              </div>
              <div className="stat-item" style={{ textAlign: "left" }}>
                <div className="stat-number" style={{ color: "var(--accent)" }}>
                  <CountUp end={2} duration={1.5} suffix=" min" />
                </div>
                <div className="stat-label">Avg. Build Time</div>
              </div>
              <div className="stat-item" style={{ textAlign: "left" }}>
                <div className="stat-number" style={{ color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span>AI</span>
                  <LottieIcon type="success" width={24} height={24} loop={false} />
                </div>
                <div className="stat-label">Smart Analysis</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT 3D CANVAS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="hero-3d-container"
            style={{ position: "relative", width: "100%", height: "100%" }}
          >
            <div style={{ height: "100%", minHeight: "500px", width: "100%" }}>
              <ResumeScene3D />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" style={{ background: "transparent" }}>
        <div className="section-header">
          <span className="section-label" style={{ color: "var(--accent)" }}>What We Offer</span>
          <h2 className="section-title">Everything you need to land the job</h2>
          <p className="section-subtitle">
            From building to analyzing, we have every step covered with powerful AI tools.
          </p>
        </div>

        <div className="features-grid">
          <motion.div 
            whileHover={{ y: -8 }}
            className="feature-card glass-panel"
          >
            <div className="feature-icon" style={{ background: "rgba(37, 99, 235, 0.1)" }}>✏️</div>
            <h3 className="feature-title">Smart Resume Builder</h3>
            <p className="feature-desc">
              Fill in your details and watch a beautiful, professional resume come to life in real-time.
              Download it as a clean, ATS-readable PDF.
            </p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -8 }}
            className="feature-card glass-panel"
          >
            <div className="feature-icon" style={{ background: "rgba(37, 99, 235, 0.1)" }}>🤖</div>
            <h3 className="feature-title">AI-Powered Analysis</h3>
            <p className="feature-desc">
              Upload any resume and get an instant AI-generated score, ATS rating, strengths,
              weaknesses, and personalized improvement tips.
            </p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -8 }}
            className="feature-card glass-panel"
          >
            <div className="feature-icon" style={{ background: "rgba(37, 99, 235, 0.1)" }}>🎯</div>
            <h3 className="feature-title">Job Description Matching</h3>
            <p className="feature-desc">
              Paste a job description and our AI compares your resume against it — showing you
              exactly what keywords are missing and how to fix them.
            </p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -8 }}
            className="feature-card glass-panel"
          >
            <div className="feature-icon" style={{ background: "rgba(37, 99, 235, 0.1)" }}>⚡</div>
            <h3 className="feature-title">Instant ATS Score</h3>
            <p className="feature-desc">
              Get a real-time ATS compatibility score so you know your resume will actually
              pass automated screening systems before you even apply.
            </p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -8 }}
            className="feature-card glass-panel"
          >
            <div className="feature-icon" style={{ background: "rgba(37, 99, 235, 0.1)" }}>📊</div>
            <h3 className="feature-title">Keyword Suggestions</h3>
            <p className="feature-desc">
              One-click missing keyword additions from your analysis — seamlessly add
              important skills to your builder profile instantly.
            </p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -8 }}
            className="feature-card glass-panel"
          >
            <div className="feature-icon" style={{ background: "rgba(37, 99, 235, 0.1)" }}>💾</div>
            <h3 className="feature-title">Cloud Save</h3>
            <p className="feature-desc">
              Save your resume to our database and access it anytime.
              Your data is always secure and ready to update.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)" }}>
        <div className="cta-content">
          <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "1rem" }}>
            <LottieIcon type="upload" width={80} height={80} />
          </div>
          <h2 className="cta-title">Ready to land your dream job?</h2>
          <p className="cta-subtitle">
            Join thousands of job seekers who've improved their resume with ResumeAI.
            Start for free — no sign up needed.
          </p>
          <button className="cta-btn" style={{ background: "white", color: "var(--primary)", border: "none" }} onClick={() => navigate("builder")}>
            Start Building Now →
          </button>
        </div>
      </section>
    </>
  );
}
