import { useState, useRef } from "react";
import axios from "axios";
import api from "../api";
import { AnalysisResultSkeleton } from "../components/Skeleton";
import { RESUME_THEMES, RESUME_FONTS } from "./ResumeBuilder";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ResumeAnalyzer({ form, setForm, setView }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [suggestingJobDesc, setSuggestingJobDesc] = useState(false);
  const [checkingGrammar, setCheckingGrammar] = useState(false);
  const [grammarNotice, setGrammarNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(""); // "analyze" | "tailor"
  const [result, setResult] = useState(null);
  const [tailoredResult, setTailoredResult] = useState(null);
  const [error, setError] = useState("");
  const [downloadingTailored, setDownloadingTailored] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(RESUME_THEMES[0]);
  const [selectedFont, setSelectedFont] = useState(RESUME_FONTS[0]);
  const tailoredPreviewRef = useRef(null);

  const downloadTailoredPDF = async () => {
    if (!tailoredResult || !tailoredPreviewRef.current) return;
    setDownloadingTailored(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const name = tailoredResult.userName?.trim() || "Resume";

      // Construct plain text representation for the invisible layer
      const textParts = [];
      if (tailoredResult.userName) textParts.push(tailoredResult.userName);
      if (tailoredResult.email) textParts.push(`Email: ${tailoredResult.email}`);
      if (tailoredResult.phone) textParts.push(`Phone: ${tailoredResult.phone}`);
      if (tailoredResult.linkedin) textParts.push(`LinkedIn: ${tailoredResult.linkedin}`);
      if (tailoredResult.github) textParts.push(`GitHub: ${tailoredResult.github}`);
      if (tailoredResult.summary) textParts.push(`Summary: ${tailoredResult.summary}`);
      if (tailoredResult.skills) textParts.push(`Skills: ${tailoredResult.skills}`);

      if (tailoredResult.experience && tailoredResult.experience.length > 0) {
        textParts.push("Experience:");
        tailoredResult.experience.forEach((exp) => {
          if (exp.company || exp.role) {
            textParts.push(`${exp.role || ""} at ${exp.company || ""} (${exp.duration || ""})`);
            if (exp.description) textParts.push(exp.description);
          }
        });
      }

      if (tailoredResult.education && tailoredResult.education.length > 0) {
        textParts.push("Education:");
        tailoredResult.education.forEach((edu) => {
          if (edu.school || edu.degree) {
            textParts.push(`${edu.degree || ""} from ${edu.school || ""} (${edu.year || ""})`);
          }
        });
      }

      if (tailoredResult.projects && tailoredResult.projects.length > 0) {
        textParts.push("Projects:");
        tailoredResult.projects.forEach((proj) => {
          if (proj.name) {
            textParts.push(`${proj.name || ""} - Tech: ${proj.techStack || ""}`);
            if (proj.description) textParts.push(proj.description);
          }
        });
      }

      if (tailoredResult.extra) textParts.push(tailoredResult.extra);
      const fullText = textParts.join("\n");

      const opt = {
        margin: 0,
        filename: `${name.replace(/\s+/g, "_")}_Tailored_Resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css"] },
      };

      await html2pdf()
        .set(opt)
        .from(tailoredPreviewRef.current)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          pdf.setPage(1);
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(1);
          const splitText = pdf.splitTextToSize(fullText, 180);
          pdf.text(splitText, 10, 10);
        })
        .save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingTailored(false);
    }
  };

  const handleSuggestJobDesc = async (roleName = "Full Stack Software Engineer") => {
    setSuggestingJobDesc(true);
    try {
      const res = await api.post("/api/analyze/suggest-job-description", { role: roleName });
      if (res.data.jobDescription) {
        setJobDescription(res.data.jobDescription);
      }
    } catch (err) {
      console.error("AI Job Suggestion error:", err);
      setJobDescription(
        `Target Role: ${roleName}\nKey Responsibilities:\n• Design, develop, and maintain high-performance scalable web applications.\n• Write clean, robust, and well-tested code using modern tech stack.\n• Collaborate with product and design teams to launch innovative user experiences.\n• Optimize database queries and backend APIs for maximum speed and security.`
      );
    } finally {
      setSuggestingJobDesc(false);
    }
  };

  const handleCheckGrammar = async () => {
    if (!tailoredResult) return;
    setCheckingGrammar(true);
    setGrammarNotice("");
    try {
      const res = await api.post("/api/analyze/check-grammar", { resumeData: tailoredResult });
      if (res.data.correctedData) {
        setTailoredResult(res.data.correctedData);
      }
      const improvementsText = res.data.improvements?.join("\n• ") || "Grammar, punctuation, and executive action verbs polished!";
      setGrammarNotice(improvementsText);
    } catch (err) {
      console.error("Grammar check error:", err);
      alert("Grammar check failed. Please try again.");
    } finally {
      setCheckingGrammar(false);
    }
  };


  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume file (.pdf or .docx).");
      return;
    }
    setError("");
    setLoading(true);
    setActiveAction("analyze");
    setResult(null);
    setTailoredResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const res = await axios.post(`${API_BASE}/api/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.analysis);
      setTimeout(() => {
        const el = document.getElementById("analysis-result-section");
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 150);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Something went wrong analyzing your resume.");
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  };

  const handleTailorFile = async () => {
    if (!file) {
      setError("Please upload a resume file (.pdf or .docx).");
      return;
    }
    if (!jobDescription || !jobDescription.trim()) {
      setError("Please provide a job description to tailor your resume.");
      return;
    }
    setError("");
    setLoading(true);
    setActiveAction("tailor");
    setResult(null);
    setTailoredResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const res = await axios.post(`${API_BASE}/api/analyze/tailor-file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data && res.data.success && res.data.tailoredResume) {
        setTailoredResult(res.data.tailoredResume);
        setTimeout(() => {
          const el = document.getElementById("tailored-result-section");
          if (el) {
            const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 150);
      } else {
        setError("Unexpected response from tailoring service.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to tailor your resume. Please check backend connection.");
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  };


  const handleAddSkill = (skill) => {
    if (!form || !setForm) return;
    const currentSkills = form.skills
      ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    if (!currentSkills.includes(skill)) {
      const newSkills = [...currentSkills, skill].join(", ");
      setForm({ ...form, skills: newSkills });
    }
  };

  const scoreColor = (score) => {
    if (score >= 75) return "#2D3748";
    if (score >= 50) return "#8F8F8F";
    return "#C6C6C6";
  };

  const ScoreRing = ({ score, label }) => {
    const color = scoreColor(score);
    const pct = Math.round(score);
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: `conic-gradient(${color} ${pct * 3.6}deg, var(--border) 0deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 0.5rem",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            inset: 8,
            background: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color }}>{pct}</span>
          </div>
        </div>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      </div>
    );
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>AI Resume Analyzer</h1>
        <p>Upload your resume and get instant AI-powered feedback and ATS score</p>
      </div>

      <div className="container" style={{ paddingTop: 0 }}>
        {/* Upload Card */}
        <div className="card" style={{ maxWidth: 760, margin: "0 auto 2rem" }}>
          <div className="section-chip" style={{ marginBottom: "1.25rem" }}> Upload Resume</div>

          <div className="form-group">
            <label>Resume File (.pdf or .docx)</label>
            <div style={{
              border: "2px dashed var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              textAlign: "center",
              background: file ? "var(--primary-light)" : "var(--surface-2)",
              transition: "var(--transition)",
              cursor: "pointer",
              borderColor: file ? "var(--primary)" : "var(--border)",
            }}>
              <input
                type="file"
                id="resume-file-input"
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  const selected = e.target.files[0];
                  if (selected) {
                    if (selected.size > 5 * 1024 * 1024) {
                      setError("File size exceeds 5 MB limit. Please select a smaller PDF or DOCX file.");
                      setFile(null);
                      return;
                    }
                    const ext = selected.name.split(".").pop().toLowerCase();
                    if (!["pdf", "docx", "txt"].includes(ext)) {
                      setError("Invalid file format. Only .pdf, .docx, and .txt files are allowed.");
                      setFile(null);
                      return;
                    }
                  }
                  setFile(selected);
                  setResult(null);
                  setError("");
                }}
                style={{ display: "none" }}
              />
              <label htmlFor="resume-file-input" style={{ cursor: "pointer", display: "block" }}>
                {file ? (
                  <>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}></div>
                    <div style={{ fontWeight: 600, color: "var(--primary)", marginBottom: "0.25rem" }}>{file.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {(file.size / 1024).toFixed(1)} KB — Click to change
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}></div>
                    <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                      Click to upload your resume
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Supports .pdf, .docx, and .txt files (Max 5MB)
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <label style={{ margin: 0 }}>Job Description <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional — improves matching accuracy)</span></label>
              <button
                type="button"
                onClick={() => handleSuggestJobDesc("Full Stack Software Engineer")}
                disabled={suggestingJobDesc}
                style={{
                  background: "rgba(217, 119, 6, 0.12)",
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  padding: "0.25rem 0.6rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                {suggestingJobDesc ? " Generating..." : " AI Suggest Job Description"}
              </button>
            </div>

            {/* Role Preset Chips (Scrollable on Mobile) */}
            <div className="preset-chip-scroll">
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 }}>Quick Presets:</span>
              {[
                "Full Stack Developer",
                "Frontend React Engineer",
                "Backend Node.js Architect",
                "Data Scientist / AI",
                "DevOps & Cloud Specialist"
              ].map((role) => (
                <button
                  key={role}
                  type="button"
                  className="chip-btn"
                  onClick={() => handleSuggestJobDesc(role)}
                  disabled={suggestingJobDesc}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-main)",
                    fontSize: "0.72rem",
                    borderRadius: "6px",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  + {role}
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here or click ' AI Suggest Job Description' above..."
            />
          </div>

          <div className="btn-group-responsive">
            <button
              style={{ flex: 1, padding: "0.9rem", fontSize: "1rem" }}
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading && activeAction === "analyze" ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Analyzing...
                </span>
              ) : (
                " Analyze Resume"
              )}
            </button>
            <button
              className="secondary"
              style={{
                flex: 1,
                padding: "0.9rem",
                fontSize: "1rem",
                border: "1px solid var(--accent)",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
                color: "var(--accent-light, #c084fc)"
              }}
              onClick={handleTailorFile}
              disabled={loading}
            >
              {loading && activeAction === "tailor" ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Tailoring...
                </span>
              ) : (
                " Tailor Resume"
              )}
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: "1rem",
              padding: "0.9rem 1.25rem",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "var(--radius)",
              color: "#DC2626",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}>
               {error}
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && <AnalysisResultSkeleton />}

        {/* Results */}
        {result && !loading && (
          <div id="analysis-result-section" className="card animate-in" style={{ maxWidth: 760, margin: "0 auto 2rem" }}>
            {result.rawResponse ? (
              <>
                <div className="section-chip" style={{ marginBottom: "1rem" }}> Analysis Result</div>
                <pre style={{ whiteSpace: "pre-wrap", background: "var(--surface-2)", padding: "1.25rem", borderRadius: "var(--radius)", fontSize: "0.875rem", lineHeight: "1.6", overflowX: "auto", border: "1px solid var(--border)" }}>
                  {result.rawResponse}
                </pre>
              </>
            ) : (
              <>
                {/* Score Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "2rem", marginBottom: "1.75rem", paddingBottom: "1.75rem", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div className="section-chip" style={{ marginBottom: "0.75rem" }}> Analysis Complete</div>
                    <p style={{ fontSize: "1rem", color: "var(--text-main)", lineHeight: "1.6", margin: 0 }}>{result.summary}</p>
                  </div>
                  <div className="score-rings-row" style={{ display: "flex", gap: "2rem" }}>
                    <ScoreRing score={result.overallScore ?? 0} label="Overall" />
                    <ScoreRing score={result.atsScore ?? 0} label="ATS Score" />
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="strengths-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                    <h4 style={{ color: "var(--primary)", marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}> Strengths</h4>
                    <ul style={{ paddingLeft: "1.2rem", color: "var(--text-main)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                      {result.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                    <h4 style={{ color: "var(--text-muted)", marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}> Weaknesses</h4>
                    <ul style={{ paddingLeft: "1.2rem", color: "var(--text-main)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                      {result.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Missing Keywords */}
                {result.missingKeywords?.length > 0 && (
                  <div style={{ marginBottom: "1.5rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                    <h4 style={{ color: "var(--primary)", marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}> Missing Keywords</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Click any keyword to add it to your Resume Builder</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {result.missingKeywords.map((kw, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddSkill(kw)}
                          className="secondary"
                          style={{ padding: "0.3rem 0.8rem", borderRadius: "999px", fontSize: "0.8rem", background: "white" }}
                        >
                          + {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {result.suggestions?.length > 0 && (
                  <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                    <h4 style={{ color: "var(--primary)", marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}> Suggestions for Improvement</h4>
                    <ul style={{ paddingLeft: "1.2rem", color: "var(--text-main)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                      {result.suggestions.map((s, i) => <li key={i} style={{ marginBottom: "0.4rem" }}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tailored Result Card */}
        {tailoredResult && !loading && (
          <div id="tailored-result-section" className="card animate-in" style={{ maxWidth: 760, margin: "0 auto 2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div className="section-chip" style={{ marginBottom: "0.5rem" }}> AI Tailored Resume</div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                  This tailored version is fully optimized for the job description.
                </p>
              </div>
              <div className="btn-group-responsive">
                <button
                  onClick={handleCheckGrammar}
                  disabled={checkingGrammar}
                  style={{
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid #10b981",
                    color: "#10b981",
                    fontWeight: 600
                  }}
                >
                  {checkingGrammar ? " Proofreading..." : " Check Grammar & Polish"}
                </button>
                <button
                  onClick={downloadTailoredPDF}
                  disabled={downloadingTailored}
                  style={{
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid var(--accent)",
                    color: "var(--accent-light, #c084fc)"
                  }}
                >
                  {downloadingTailored ? "⏳ Generating..." : "⬇ Download PDF"}
                </button>
                <button
                  onClick={() => {
                    setForm(tailoredResult);
                    setView("builder");
                    alert("Successfully imported tailored data into Resume Builder!");
                  }}
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, #d97706 100%)",
                    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.25)"
                  }}
                >
                   Open in Resume Builder
                </button>
              </div>
            </div>

            {grammarNotice && (
              <div style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "var(--radius)",
                padding: "0.85rem 1.1rem",
                marginBottom: "1rem",
                fontSize: "0.85rem",
                color: "#10b981",
                whiteSpace: "pre-line",
                lineHeight: "1.5"
              }}>
                <strong> AI Grammar & Style Polish Applied:</strong>
                <br />
                {grammarNotice}
              </div>
            )}

            {/* Theme & Palette Customization Bar for Export */}
            <div style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "0.8rem 1.25rem",
              marginBottom: "1rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Export Theme</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  {RESUME_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme)}
                      title={theme.name}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: theme.accent,
                        border: selectedTheme.id === theme.id ? "2px solid var(--text-main)" : "2px solid #fff",
                        boxShadow: selectedTheme.id === theme.id ? `0 0 0 2px ${theme.accent}` : "0 2px 4px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                        padding: 0,
                        transition: "all 0.15s ease",
                        transform: selectedTheme.id === theme.id ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Font</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  {RESUME_FONTS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSelectedFont(font)}
                      style={{
                        padding: "0.2rem 0.55rem",
                        fontSize: "0.75rem",
                        borderRadius: "6px",
                        fontWeight: 600,
                        fontFamily: font.value,
                        background: selectedFont.id === font.id ? "var(--accent)" : "var(--surface)",
                        color: selectedFont.id === font.id ? "white" : "var(--text-main)",
                        border: "1px solid var(--border)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live A4 Tailored Resume Preview Paper */}
            <div className="resume-preview-wrapper" style={{ display: "flex", justifyContent: "center", width: "100%", overflowX: "auto", padding: "1rem 0" }}>
              <div
                id="tailored-resume-preview"
                ref={tailoredPreviewRef}
                style={{
                  background: "#fff",
                  color: "#1a1a1a",
                  padding: "32px 42px",
                  fontFamily: selectedFont.value,
                  width: "794px",
                  minHeight: "1123px",
                  maxHeight: "1123px",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  fontSize: "9.5pt",
                  lineHeight: "1.38",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  borderRadius: "4px"
                }}
              >
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "14px", paddingBottom: "12px", borderBottom: `2.5px solid ${selectedTheme.accent}` }}>
                  <h1 style={{ margin: "0 0 4px 0", fontSize: "20pt", color: selectedTheme.header, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: selectedFont.value, fontWeight: 700 }}>
                    {tailoredResult.userName || "YOUR NAME"}
                  </h1>
                  <p style={{ margin: 0, fontSize: "9pt", color: "#444", fontFamily: selectedFont.value }}>
                    {[tailoredResult.email, tailoredResult.phone, tailoredResult.linkedin, tailoredResult.github].filter(Boolean).join("  |  ")}
                  </p>
                </div>

                {/* Summary */}
                {tailoredResult.summary && (
                  <div style={{ marginBottom: "12px" }}>
                    <h3 style={{ margin: "0 0 3px 0", fontSize: "9.5pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.2px", fontFamily: selectedFont.value, fontWeight: 700 }}>Summary</h3>
                    <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "6px" }} />
                    <p style={{ margin: 0, fontSize: "9pt", lineHeight: "1.38", color: "#222", fontFamily: selectedFont.value }}>{tailoredResult.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {tailoredResult.skills && (
                  <div style={{ marginBottom: "12px" }}>
                    <h3 style={{ margin: "0 0 3px 0", fontSize: "9.5pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.2px", fontFamily: selectedFont.value, fontWeight: 700 }}>Skills</h3>
                    <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "6px" }} />
                    <p style={{ margin: 0, fontSize: "9pt", lineHeight: "1.38", fontFamily: selectedFont.value, color: "#222" }}>
                      {typeof tailoredResult.skills === "string" ? tailoredResult.skills.split(",").map(s => s.trim()).join("  •  ") : tailoredResult.skills}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {tailoredResult.experience && tailoredResult.experience.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <h3 style={{ margin: "0 0 3px 0", fontSize: "9.5pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.2px", fontFamily: selectedFont.value, fontWeight: 700 }}>Professional Experience</h3>
                    <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "6px" }} />
                    {tailoredResult.experience.map((exp, idx) => (
                      <div key={idx} style={{ marginBottom: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                          <div>
                            <strong style={{ fontSize: "9.5pt", color: selectedTheme.header, fontFamily: selectedFont.value }}>{exp.role}</strong>
                            {exp.company && <span style={{ fontSize: "9pt", color: "#333", fontFamily: selectedFont.value }}> — {exp.company}</span>}
                          </div>
                          {exp.duration && <em style={{ fontSize: "8.5pt", color: "#555", fontFamily: selectedFont.value }}>{exp.duration}</em>}
                        </div>
                        {exp.description && (
                          <ul style={{ margin: "0", paddingLeft: "16px", fontSize: "9pt", lineHeight: "1.35", color: "#333", fontFamily: selectedFont.value }}>
                            {exp.description.split("\n").filter((l) => l.trim()).map((line, idx2) => (
                              <li key={idx2} style={{ marginBottom: "1.5px" }}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {tailoredResult.education && tailoredResult.education.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.5px", fontFamily: selectedFont.value, fontWeight: 700 }}>Education</h3>
                    <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "8px" }} />
                    {tailoredResult.education.map((edu, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                        <div>
                          <strong style={{ fontSize: "10pt", color: selectedTheme.header, fontFamily: selectedFont.value }}>{edu.school || edu.institution}</strong>
                          {edu.degree && <span style={{ fontSize: "9.5pt", color: "#333", fontFamily: selectedFont.value }}> — {edu.degree}</span>}
                        </div>
                        {edu.year && <span style={{ fontSize: "9pt", color: "#555", fontFamily: selectedFont.value }}>{edu.year}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {tailoredResult.projects && tailoredResult.projects.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <h3 style={{ margin: "0 0 3px 0", fontSize: "9.5pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.2px", fontFamily: selectedFont.value, fontWeight: 700 }}>Projects</h3>
                    <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "6px" }} />
                    {tailoredResult.projects.map((proj, idx) => (
                      <div key={idx} style={{ marginBottom: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                          <div>
                            <strong style={{ fontSize: "9.5pt", color: selectedTheme.header, fontFamily: selectedFont.value }}>{proj.name}</strong>
                            {proj.techStack && <span style={{ fontSize: "9pt", color: "#444", fontFamily: selectedFont.value }}> | {proj.techStack}</span>}
                          </div>
                        </div>
                        {proj.link && (
                          <div style={{ fontSize: "8.5pt", color: selectedTheme.accent, marginBottom: "2px", fontFamily: selectedFont.value, fontWeight: 500 }}>
                             <a href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" style={{ color: selectedTheme.accent, textDecoration: "underline" }}>{proj.link}</a>
                          </div>
                        )}
                        {proj.description && (
                          <ul style={{ margin: "0", paddingLeft: "16px", fontSize: "9pt", lineHeight: "1.35", color: "#333", fontFamily: selectedFont.value }}>
                            {proj.description.split("\n").filter((l) => l.trim()).map((line, idx2) => (
                              <li key={idx2} style={{ marginBottom: "1.5px" }}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Extra */}
                {tailoredResult.extra && (
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.5px", fontFamily: selectedFont.value, fontWeight: 700 }}>Additional Information</h3>
                    <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "8px" }} />
                    <p style={{ margin: 0, fontSize: "9.5pt", lineHeight: "1.5", whiteSpace: "pre-wrap", color: "#222", fontFamily: selectedFont.value }}>
                      {tailoredResult.extra}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
