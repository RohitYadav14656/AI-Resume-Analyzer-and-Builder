import React, { useState, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Sparkles, Cpu, Target, Gauge, CheckCircle2, Cloud, ArrowRight } from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import MobileLazyLoad from "../components/MobileLazyLoad";

const HeroMockup = lazy(() => import("../components/HeroMockup"));
const RiveCTA = lazy(() => import("../components/RiveCTA"));

// Local robust CountUp component
function CountUp({ end, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(0);
  React.useEffect(() => {
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

export default function Home({ navigate }) {
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

      <MobileLazyLoad>
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
      </MobileLazyLoad>
    </>
  );
}
