import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import LottieIcon from "./components/LottieIcon";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import api, { setAccessToken, clearAccessToken, registerLogoutCallback } from "./api";
import WebsiteLogo from "./components/WebsiteLogo";
import { Sparkles, Cpu, Target, Gauge, CheckCircle2, Cloud, ArrowRight, ShieldCheck, Zap, Award, Star, Bell } from "lucide-react";

// Lazy-loaded components for optimal initial bundle performance
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const ResumeAnalyzer = lazy(() => import("./pages/ResumeAnalyzer"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const HeroMockup = lazy(() => import("./components/HeroMockup"));
const RiveCTA = lazy(() => import("./components/RiveCTA"));
const NotificationCenterModal = lazy(() => import("./components/NotificationCenterModal"));
const SupportTicketsModal = lazy(() => import("./components/SupportTicketsModal"));
const BuyCreditsModal = lazy(() => import("./components/BuyCreditsModal"));

import ImpersonationBanner from "./components/ImpersonationBanner";
import MaintenanceScreen from "./components/MaintenanceScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Lightweight Suspense fallback spinner
const ViewLoader = () => (
  <div style={{
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    color: "var(--accent)"
  }}>
    <LottieIcon type="spinner" width={42} height={42} />
    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)" }}>Loading view...</span>
  </div>
);
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
  const [view, setView] = useState("home"); // "home" | "builder" | "analyzer" | "login" | "profile"
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // Access token lives in memory only (api.js) — NOT in localStorage.
  // We keep a boolean here just to know if the user is authenticated.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [verifiedToast, setVerifiedToast] = useState(""); // "success" | "error" | ""

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [buyCreditsModalProps, setBuyCreditsModalProps] = useState({ isOpen: false, mode: "credits", plan: "pro" });
  const [systemConfig, setSystemConfig] = useState({ maintenanceMode: false, maintenanceNotice: "", pricePerCreditInr: 2, proPlanPrice: 499, enterprisePlanPrice: 1999 });

  const handleOpenBuyCredits = (modeOrPlan) => {
    if (modeOrPlan === "pro" || modeOrPlan === "enterprise") {
      setBuyCreditsModalProps({ isOpen: true, mode: "plan", plan: modeOrPlan });
    } else {
      setBuyCreditsModalProps({ isOpen: true, mode: "credits", plan: "pro" });
    }
  };

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

  // Silent session restore on app mount: fetches access token into memory using HttpOnly cookie
  useEffect(() => {
    async function restoreSession() {
      try {
        const { data } = await api.post("/api/auth/refresh");
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          setIsAuthenticated(true);
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
      } catch (err) {
        // Clear session if refresh cookie is invalid or expired
        clearAccessToken();
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      }
    }
    restoreSession();

    // Check system maintenance mode
    async function checkSystemStatus() {
      try {
        const { data } = await api.get("/api/system/public-config");
        if (data && data.success) {
          setSystemConfig({
            maintenanceMode: data.maintenanceMode || false,
            maintenanceNotice: data.maintenanceNotice || "",
            pricePerCreditInr: data.pricePerCreditInr !== undefined ? data.pricePerCreditInr : 2,
            proPlanPrice: data.proPlanPrice !== undefined ? data.proPlanPrice : 499,
            enterprisePlanPrice: data.enterprisePlanPrice !== undefined ? data.enterprisePlanPrice : 1999,
          });
        }
      } catch (err) {
        // Fail open if system config route fails
      }
    }
    checkSystemStatus();
  }, []);

  // Sync user profile & credits from API whenever view changes or on mount
  useEffect(() => {
    if (!user) return;
    async function syncUserCredits() {
      try {
        const { data } = await api.get("/api/user/profile");
        if (data && data.success && data.profile) {
          setUser((prev) => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              name: data.profile.name || prev.name,
              aiCredits: data.profile.aiCredits,
              subscription: data.profile.subscription,
              role: data.profile.role,
              status: data.profile.status,
            };
            localStorage.setItem("user", JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        // Silent catch if offline or unauthenticated
      }
    }
    syncUserCredits();
  }, [view]);

  // Detect password reset token OR email verification result in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetTok = params.get("reset_token");
    const verified = params.get("verified");
    const verifyError = params.get("verify_error");

    if (resetTok) {
      setResetToken(resetTok);
      setView("reset-password");
    } else if (verified === "true") {
      toast.success("Email verified successfully! You can now log in.", { id: "email-verified" });
      setView("login");
    } else if (verifyError) {
      toast.error("Verification link is invalid or expired.", { id: "email-verify-error" });
      setView("login");
    }

    // Clean query params from URL bar
    if (resetTok || verified || verifyError) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const scrollToTop = () => window.scrollTo(0, 0);

  const preloadRoute = (to) => {
    if (to === "builder") import("./pages/ResumeBuilder");
    else if (to === "analyzer") import("./pages/ResumeAnalyzer");
    else if (to === "login") import("./pages/Auth");
    else if (to === "profile") import("./pages/Profile");
  };

  const navigate = (to) => {
    setMobileMenuOpen(false);
    if ((to === "builder" || to === "analyzer" || to === "profile") && !isAuthenticated) {
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
      {systemConfig.maintenanceMode && (
        <MaintenanceScreen notice={systemConfig.maintenanceNotice} />
      )}

      <ImpersonationBanner user={user} onExit={handleLogout} />

      {/* Global Toast Container */}
      <Toaster
        position={typeof window !== "undefined" && window.innerWidth < 640 ? "top-center" : "top-right"}
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--bg-dark, #2e2520)",
            color: "#ffffff",
            borderRadius: "14px",
            border: "1px solid rgba(217, 119, 6, 0.3)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
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

      {/* ===== NAVBAR ===== */}
      <Header
        view={view}
        user={user}
        onNavigate={navigate}
        onPreloadRoute={preloadRoute}
        onLogout={handleLogout}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenSupport={() => setShowSupportModal(true)}
        onOpenBuyCredits={handleOpenBuyCredits}
      />

      {/* ── Email Verification Toast ── */}
      <AnimatePresence>
        {verifiedToast && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              background: verifiedToast === "success"
                ? "linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))"
                : "linear-gradient(135deg, rgba(225,29,72,0.95), rgba(190,18,60,0.95))",
              color: "white",
              padding: "0.9rem 1.5rem",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              backdropFilter: "blur(12px)",
              fontSize: "0.9rem",
              fontWeight: 600,
              maxWidth: "460px",
              width: "calc(100% - 2rem)",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{verifiedToast === "success" ? "" : ""}</span>
            <span style={{ flex: 1 }}>
              {verifiedToast === "success"
                ? "Email verified! You can now log in to your account."
                : "Verification link is invalid or expired. Please request a new one."}
            </span>
            <button
              onClick={() => setVerifiedToast("")}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", color: "white", cursor: "pointer", padding: "2px 8px", fontSize: "0.8rem" }}
            >
              
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== VIEWS ===== */}
      <Suspense fallback={<ViewLoader />}>
        {view === "home" && <HeroPage navigate={navigate} />}
        {view === "builder" && <ResumeBuilder form={form} setForm={setForm} />}
        {view === "analyzer" && <ResumeAnalyzer form={form} setForm={setForm} setView={setView} />}
        {view === "profile" && (
          <Profile
            user={user}
            setUser={setUser}
            navigate={navigate}
            setForm={setForm}
            handleLogout={handleLogout}
            onOpenSupport={() => setShowSupportModal(true)}
            onOpenBuyCredits={handleOpenBuyCredits}
          />
        )}
        {view === "login" && <Auth onAuthSuccess={handleAuthSuccess} />}
        {view === "reset-password" && (
          <ResetPassword
            token={resetToken}
            onGoToLogin={() => {
              setResetToken(null);
              setView("login");
              scrollToTop();
            }}
          />
        )}
      </Suspense>

      <NotificationCenterModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />

      <SupportTicketsModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      <BuyCreditsModal
        isOpen={buyCreditsModalProps.isOpen}
        onClose={() => setBuyCreditsModalProps((prev) => ({ ...prev, isOpen: false }))}
        user={user}
        initialMode={buyCreditsModalProps.mode}
        initialPlan={buyCreditsModalProps.plan}
        proPrice={systemConfig.proPlanPrice}
        enterprisePrice={systemConfig.enterprisePlanPrice}
        pricePerCreditInr={systemConfig.pricePerCreditInr}
        onCreditsPurchased={(newCredits, newSubscription) => {
          setUser((prev) => {
            const updated = {
              ...prev,
              aiCredits: newCredits !== undefined ? newCredits : prev?.aiCredits,
              subscription: newSubscription || prev?.subscription,
            };
            localStorage.setItem("user", JSON.stringify(updated));
            return updated;
          });
        }}
      />

      <Footer onNavigate={navigate} />
    </div>
  );
}

/* ===== HERO PAGE ===== */
function HeroPage({ navigate }) {
  const [analyzingState, setAnalyzingState] = useState(false);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-bg-glow" />
        <div className="hero-bg-glow-2" />

        <div className="hero-grid-split">
          {/* LEFT CONTENT */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-content"
          >
            <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", borderRadius: "20px", background: "rgba(217, 119, 6, 0.08)", border: "1px solid rgba(217, 119, 6, 0.25)", color: "var(--accent)", fontSize: "0.85rem", fontWeight: 700 }}>
              <Sparkles size={16} color="var(--accent)" />
              <span>AI-Powered Resume & ATS Intelligence</span>
            </div>

            <h1 className="hero-title" style={{ fontSize: "3.2rem", fontWeight: 800, lineHeight: 1.15, margin: "1rem 0" }}>
              Build Resumes That<br />
              <span className="gradient-text" style={{ background: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #b45309 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Actually Get You Hired
              </span>
            </h1>

            <p className="hero-subtitle" style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "560px" }}>
              Create professional, ATS-optimized resumes in minutes — then let our AI analyze every detail and give you a real ATS compatibility score before you apply.
            </p>

            <div className="hero-actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <button 
                className="glow-btn" 
                style={{ padding: "0.85rem 2rem", fontSize: "1rem", borderRadius: "14px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.5rem" }} 
                onClick={() => navigate("builder")}
              >
                 Build My Resume
              </button>

              <Suspense fallback={
                <button className="nav-secondary-btn" style={{ padding: "0.85rem 1.8rem", fontSize: "1rem", borderRadius: "14px" }} onClick={() => navigate("analyzer")}>
                   Analyze Resume
                </button>
              }>
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
              </Suspense>
            </div>

            {analyzingState && (
              <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <LottieIcon type="spinner" width={24} height={24} />
                <span className="dots-typing" style={{ fontSize: "0.9rem", color: "var(--accent)", fontWeight: 600 }}>
                  AI scanner inspecting keywords <span></span><span></span><span></span>
                </span>
              </div>
            )}

            <div className="hero-stats" style={{ marginTop: "2.5rem", display: "flex", gap: "2rem" }}>
              <div className="stat-item">
                <div className="stat-number" style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)" }}>
                  <CountUp end={98} duration={2} suffix="%" />
                </div>
                <div className="stat-label" style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>ATS Pass Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-number" style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)" }}>
                  <CountUp end={2} duration={1.5} suffix=" min" />
                </div>
                <div className="stat-label" style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>Avg. Build Time</div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-ai" style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span>AI</span>
                  <LottieIcon type="success" width={22} height={22} loop={false} />
                </div>
                <div className="stat-label" style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>Smart Audit</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT 3D CANVAS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="hero-3d-container"
            style={{ position: "relative", width: "100%", height: "520px", minHeight: "520px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "24px" }}
          >
            <div style={{ height: "520px", width: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "24px" }}>
              <Suspense fallback={
                <div style={{ width: "100%", height: "520px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "24px", background: "rgba(248, 250, 252, 0.6)", border: "1px solid var(--border)" }}>
                  <LottieIcon type="spinner" width={48} height={48} />
                </div>
              }>
                <HeroMockup />
              </Suspense>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" style={{ padding: "4.5rem 1.5rem", background: "transparent" }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-label" style={{ color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800, fontSize: "0.8rem" }}>What We Offer</span>
            <h2 className="section-title" style={{ fontSize: "2.2rem", marginTop: "0.4rem" }}>Everything You Need to Land the Job</h2>
            <p className="section-subtitle" style={{ maxWidth: "600px", margin: "0.5rem auto 0" }}>
              From live real-time building to instant AI resume scoring, we have every step covered.
            </p>
          </div>

          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            <motion.div whileHover={{ y: -6 }} className="feature-card glass-panel" style={{ padding: "1.75rem", borderRadius: "18px" }}>
              <div className="feature-icon" style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(217, 119, 6, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Sparkles size={22} color="var(--accent)" />
              </div>
              <h3 className="feature-title" style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Smart Resume Builder</h3>
              <p className="feature-desc" style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Fill in your details and watch a beautiful, professional resume come to life in real-time. Download as a clean, ATS-readable PDF.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="feature-card glass-panel" style={{ padding: "1.75rem", borderRadius: "18px" }}>
              <div className="feature-icon" style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(217, 119, 6, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Cpu size={22} color="var(--accent)" />
              </div>
              <h3 className="feature-title" style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>AI-Powered Analysis</h3>
              <p className="feature-desc" style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Upload any resume and get an instant AI-generated score, ATS rating, strengths, weaknesses, and personalized improvement tips.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="feature-card glass-panel" style={{ padding: "1.75rem", borderRadius: "18px" }}>
              <div className="feature-icon" style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(217, 119, 6, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Target size={22} color="var(--accent)" />
              </div>
              <h3 className="feature-title" style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Job Description Matching</h3>
              <p className="feature-desc" style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Paste a job description and our AI compares your resume against it — showing you exactly what keywords are missing and how to fix them.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="feature-card glass-panel" style={{ padding: "1.75rem", borderRadius: "18px" }}>
              <div className="feature-icon" style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(217, 119, 6, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Gauge size={22} color="var(--accent)" />
              </div>
              <h3 className="feature-title" style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Instant ATS Score</h3>
              <p className="feature-desc" style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Get a real-time ATS compatibility score so you know your resume will actually pass automated screening systems before you even apply.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="feature-card glass-panel" style={{ padding: "1.75rem", borderRadius: "18px" }}>
              <div className="feature-icon" style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(217, 119, 6, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <CheckCircle2 size={22} color="var(--accent)" />
              </div>
              <h3 className="feature-title" style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Keyword Suggestions</h3>
              <p className="feature-desc" style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                One-click missing keyword additions from your analysis — seamlessly add important skills to your builder profile instantly.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="feature-card glass-panel" style={{ padding: "1.75rem", borderRadius: "18px" }}>
              <div className="feature-icon" style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(217, 119, 6, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Cloud size={22} color="var(--accent)" />
              </div>
              <h3 className="feature-title" style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Cloud Save</h3>
              <p className="feature-desc" style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Save your resume to our database and access it anytime. Your data is always secure and ready to update whenever you need.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS PROCESS */}
      <section style={{ padding: "4.5rem 1.5rem 5rem", background: "var(--surface-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-label" style={{ color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800, fontSize: "0.8rem" }}>Simple Process</span>
            <h2 className="section-title" style={{ fontSize: "2.2rem", marginTop: "0.4rem" }}>How ResumeAI Works in 3 Steps</h2>
            <p className="section-subtitle" style={{ maxWidth: "560px", margin: "0.5rem auto 0" }}>
              From raw draft to recruiter-ready resume in less than two minutes.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
            <motion.div whileHover={{ y: -6 }} className="card glass-panel" style={{ padding: "2rem", textAlign: "center", borderRadius: "20px" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1.25rem", margin: "0 auto 1.25rem", boxShadow: "0 4px 15px rgba(217, 119, 6, 0.3)" }}>1</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Enter Your Background</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Fill in your education, experience, and skills in our intuitive builder — or upload an existing resume file directly.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="card glass-panel" style={{ padding: "2rem", textAlign: "center", borderRadius: "20px" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1.25rem", margin: "0 auto 1.25rem", boxShadow: "0 4px 15px rgba(46, 37, 32, 0.2)" }}>2</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Instant AI Score & Audit</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Our AI inspects formatting, ATS compatibility, bullet impact, and job keyword alignment in seconds.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="card glass-panel" style={{ padding: "2rem", textAlign: "center", borderRadius: "20px" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#10b981", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1.25rem", margin: "0 auto 1.25rem", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)" }}>3</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>1-Click Tailor & Export</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Apply AI suggestions with a single click and download a clean, text-readable PDF engineered to pass screening filters.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)", padding: "4.5rem 1.5rem", borderRadius: "0" }}>
        <div className="cta-content" style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "1rem" }}>
            <LottieIcon type="upload" width={110} height={110} />
          </div>
          <h2 className="cta-title" style={{ fontSize: "2.3rem", color: "#ffffff", fontWeight: 800, marginBottom: "0.8rem" }}>
            Ready to Land Your Dream Job?
          </h2>
          <p className="cta-subtitle" style={{ fontSize: "1.05rem", color: "#e7e5e4", marginBottom: "2rem", lineHeight: 1.6 }}>
            Join thousands of job seekers who've improved their resume with ResumeAI. Start for free today.
          </p>
          <button 
            className="cta-btn" 
            style={{ background: "#ffffff", color: "var(--primary)", border: "none", padding: "0.85rem 2.2rem", fontSize: "1rem", fontWeight: 800, borderRadius: "14px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }} 
            onClick={() => navigate("builder")}
          >
            Start Building Now <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </>
  );
}
