import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import LottieIcon from "./components/LottieIcon";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import api, { setAccessToken, clearAccessToken, registerLogoutCallback } from "./api";
import WebsiteLogo from "./components/WebsiteLogo";
import { Sparkles, Cpu, Target, Gauge, CheckCircle2, Cloud, ArrowRight, ShieldCheck, Zap, Award, Star, Bell } from "lucide-react";

// Lazy-loaded components for optimal initial bundle performance
import Home from "./pages/Home";
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
import CookieConsent from "./components/CookieConsent";
const NotFound = lazy(() => import("./pages/NotFound"));

// Lightweight Suspense fallback skeleton loader
const ViewLoader = () => (
  <div className="container" style={{ minHeight: "80vh", paddingTop: "4rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
    <div className="skeleton skeleton-title" style={{ width: "40%", minWidth: "200px", height: "2.5rem", marginBottom: "3rem", borderRadius: "8px" }}></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
      <div className="skeleton" style={{ height: "20rem", borderRadius: "var(--radius-lg)" }}></div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="skeleton skeleton-title" style={{ width: "60%" }}></div>
        <div className="skeleton skeleton-text" style={{ width: "100%" }}></div>
        <div className="skeleton skeleton-text" style={{ width: "90%" }}></div>
        <div className="skeleton skeleton-text" style={{ width: "95%" }}></div>
        <div className="skeleton skeleton-text" style={{ width: "80%" }}></div>
        <div className="skeleton skeleton-text" style={{ width: "85%" }}></div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <div className="skeleton" style={{ width: "120px", height: "45px", borderRadius: "8px" }}></div>
          <div className="skeleton" style={{ width: "120px", height: "45px", borderRadius: "8px" }}></div>
        </div>
      </div>
    </div>
  </div>
);

const emptyExperience = { company: "", role: "", duration: "", description: "" };
const emptyEducation = { school: "", degree: "", year: "" };

export default function App() {
  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path !== '/' && path !== '/index.html') {
        return "404";
      }
    }
    return "home";
  }); // "home" | "builder" | "analyzer" | "login" | "profile" | "404"
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
        {view === "home" && <Home navigate={navigate} user={user} />}
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
        {view === "404" && <NotFound navigate={navigate} />}
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
      {/* Only show CookieConsent banner on non-mobile screens */}
      <div className="desktop-only-cookie-consent">
        <CookieConsent />
      </div>
      <style>{`
        @media (max-width: 768px) {
          .desktop-only-cookie-consent {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

