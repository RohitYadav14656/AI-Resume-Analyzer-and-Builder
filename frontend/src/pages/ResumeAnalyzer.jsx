import { useState, useRef } from "react";
import axios from "axios";
import { AnalysisResultSkeleton } from "../components/Skeleton";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ResumeAnalyzer({ form, setForm, setView }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(""); // "analyze" | "tailor"
  const [result, setResult] = useState(null);
  const [tailoredResult, setTailoredResult] = useState(null);
  const [error, setError] = useState("");
  const [downloadingTailored, setDownloadingTailored] = useState(false);
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
        margin: [10, 10, 10, 10],
        filename: `${name.replace(/\s+/g, "_")}_Tailored_Resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
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
          <div className="section-chip" style={{ marginBottom: "1.25rem" }}>📤 Upload Resume</div>

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
                accept=".pdf,.docx"
                onChange={(e) => { setFile(e.target.files[0]); setResult(null); setError(""); }}
                style={{ display: "none" }}
              />
              <label htmlFor="resume-file-input" style={{ cursor: "pointer", display: "block" }}>
                {file ? (
                  <>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
                    <div style={{ fontWeight: 600, color: "var(--primary)", marginBottom: "0.25rem" }}>{file.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {(file.size / 1024).toFixed(1)} KB — Click to change
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📄</div>
                    <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>
                      Click to upload your resume
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Supports .pdf and .docx files
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Job Description <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional — improves matching accuracy)</span></label>
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to get tailored keyword analysis and match score..."
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
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
                "🔍 Analyze Resume"
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
                "🎯 Tailor Resume"
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
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && <AnalysisResultSkeleton />}

        {/* Results */}
        {result && !loading && (
          <div className="card animate-in" style={{ maxWidth: 760, margin: "0 auto 2rem" }}>
            {result.rawResponse ? (
              <>
                <div className="section-chip" style={{ marginBottom: "1rem" }}>📊 Analysis Result</div>
                <pre style={{ whiteSpace: "pre-wrap", background: "var(--surface-2)", padding: "1.25rem", borderRadius: "var(--radius)", fontSize: "0.875rem", lineHeight: "1.6", overflowX: "auto", border: "1px solid var(--border)" }}>
                  {result.rawResponse}
                </pre>
              </>
            ) : (
              <>
                {/* Score Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "2rem", marginBottom: "1.75rem", paddingBottom: "1.75rem", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div className="section-chip" style={{ marginBottom: "0.75rem" }}>📊 Analysis Complete</div>
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
                    <h4 style={{ color: "var(--primary)", marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>✅ Strengths</h4>
                    <ul style={{ paddingLeft: "1.2rem", color: "var(--text-main)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                      {result.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                    <h4 style={{ color: "var(--text-muted)", marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>❌ Weaknesses</h4>
                    <ul style={{ paddingLeft: "1.2rem", color: "var(--text-main)", fontSize: "0.9rem", lineHeight: "1.7" }}>
                      {result.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Missing Keywords */}
                {result.missingKeywords?.length > 0 && (
                  <div style={{ marginBottom: "1.5rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                    <h4 style={{ color: "var(--primary)", marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>🔑 Missing Keywords</h4>
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
                    <h4 style={{ color: "var(--primary)", marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>💡 Suggestions for Improvement</h4>
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
          <div className="card animate-in" style={{ maxWidth: 760, margin: "0 auto 2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div className="section-chip" style={{ marginBottom: "0.5rem" }}>🎯 AI Tailored Resume</div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                  This tailored version is fully optimized for the job description.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={downloadTailoredPDF}
                  disabled={downloadingTailored}
                  style={{
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid var(--accent)",
                    color: "var(--accent-light, #c084fc)"
                  }}
                >
                  {downloadingTailored ? "⏳ Generating..." : "⬇️ Download PDF"}
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
                  ✏️ Open in Resume Builder
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.25rem", background: "var(--surface-2)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
              {/* Summary */}
              {tailoredResult.summary && (
                <div>
                  <h4 style={{ color: "var(--primary)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem 0" }}>Summary</h4>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-main)", margin: 0, lineHeight: 1.6 }}>{tailoredResult.summary}</p>
                </div>
              )}

              {/* Skills */}
              {tailoredResult.skills && (
                <div>
                  <h4 style={{ color: "var(--primary)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem 0" }}>Skills</h4>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-main)", margin: 0, lineHeight: 1.6 }}>{tailoredResult.skills}</p>
                </div>
              )}

              {/* Experience */}
              {tailoredResult.experience && tailoredResult.experience.length > 0 && (
                <div>
                  <h4 style={{ color: "var(--primary)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem 0" }}>Experience</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {tailoredResult.experience.map((exp, idx) => (
                      <div key={idx} style={{ paddingLeft: "0.5rem", borderLeft: "2px solid var(--border)" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>
                          {exp.role} {exp.company ? `at ${exp.company}` : ""}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{exp.duration}</div>
                        {exp.description && (
                          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                            {exp.description.split("\n").filter(Boolean).map((line, lIdx) => (
                              <li key={lIdx}>{line.trim()}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {tailoredResult.projects && tailoredResult.projects.length > 0 && (
                <div>
                  <h4 style={{ color: "var(--primary)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem 0" }}>Projects</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {tailoredResult.projects.map((proj, idx) => (
                      <div key={idx} style={{ paddingLeft: "0.5rem", borderLeft: "2px solid var(--border)" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>
                          {proj.name} {proj.techStack ? `| Tech: ${proj.techStack}` : ""}
                        </div>
                        {proj.description && (
                          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                            {proj.description.split("\n").filter(Boolean).map((line, lIdx) => (
                              <li key={lIdx}>{line.trim()}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Off-screen/hidden A4 container for PDF generation */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
              <div
                ref={tailoredPreviewRef}
                style={{
                  background: "#fff",
                  color: "#1a1a1a",
                  padding: "40px 48px",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  width: "794px",
                  minHeight: "1123px",
                  boxSizing: "border-box",
                  fontSize: "10pt",
                  lineHeight: "1.4",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "2px solid #1a1a1a" }}>
                  <h1 style={{ margin: "0 0 6px 0", fontSize: "22pt", color: "#111", textTransform: "uppercase", letterSpacing: "2px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 }}>
                    {tailoredResult.userName || "YOUR NAME"}
                  </h1>
                  <p style={{ margin: 0, fontSize: "9pt", color: "#444", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                    {[tailoredResult.email, tailoredResult.phone, tailoredResult.linkedin, tailoredResult.github].filter(Boolean).join("  |  ")}
                  </p>
                </div>

                {tailoredResult.summary && (
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: "#111", letterSpacing: "1.5px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 }}>Summary</h3>
                    <div style={{ borderBottom: "1.5px solid #333", marginBottom: "8px" }} />
                    <p style={{ margin: 0, fontSize: "9.5pt", lineHeight: "1.5", color: "#222", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{tailoredResult.summary}</p>
                  </div>
                )}

                {tailoredResult.skills && (
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: "#111", letterSpacing: "1.5px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 }}>Skills</h3>
                    <div style={{ borderBottom: "1.5px solid #333", marginBottom: "8px" }} />
                    <p style={{ margin: 0, fontSize: "9.5pt", lineHeight: "1.5", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: "#222" }}>
                      {tailoredResult.skills.split(",").map(s => s.trim()).join("  •  ")}
                    </p>
                  </div>
                )}

                {tailoredResult.experience && tailoredResult.experience.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: "#111", letterSpacing: "1.5px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 }}>Professional Experience</h3>
                    <div style={{ borderBottom: "1.5px solid #333", marginBottom: "8px" }} />
                    {tailoredResult.experience.map((exp, idx) => (
                      <div key={idx} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                          <div>
                            <strong style={{ fontSize: "10pt", color: "#111", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{exp.role}</strong>
                            {exp.company && <span style={{ fontSize: "9.5pt", color: "#333", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}> — {exp.company}</span>}
                          </div>
                          {exp.duration && <em style={{ fontSize: "9pt", color: "#555", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{exp.duration}</em>}
                        </div>
                        {exp.description && (
                          <ul style={{ margin: "0", paddingLeft: "18px", fontSize: "9.5pt", lineHeight: "1.5", color: "#333", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                            {exp.description.split("\n").filter((l) => l.trim()).map((line, idx2) => (
                              <li key={idx2} style={{ marginBottom: "2px" }}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {tailoredResult.education && tailoredResult.education.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: "#111", letterSpacing: "1.5px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 }}>Education</h3>
                    <div style={{ borderBottom: "1.5px solid #333", marginBottom: "8px" }} />
                    {tailoredResult.education.map((edu, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                        <div>
                          <strong style={{ fontSize: "10pt", color: "#111", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{edu.school || edu.institution}</strong>
                          {edu.degree && <span style={{ fontSize: "9.5pt", color: "#333", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}> — {edu.degree}</span>}
                        </div>
                        {edu.year && <span style={{ fontSize: "9pt", color: "#555", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{edu.year}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {tailoredResult.projects && tailoredResult.projects.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: "#111", letterSpacing: "1.5px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 }}>Projects</h3>
                    <div style={{ borderBottom: "1.5px solid #333", marginBottom: "8px" }} />
                    {tailoredResult.projects.map((proj, idx) => (
                      <div key={idx} style={{ marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                          <div>
                            <strong style={{ fontSize: "10pt", color: "#111", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{proj.name}</strong>
                            {proj.techStack && <span style={{ fontSize: "9pt", color: "#444", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}> | {proj.techStack}</span>}
                          </div>
                          {proj.link && <span style={{ fontSize: "8.5pt", color: "#555", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{proj.link}</span>}
                        </div>
                        {proj.description && (
                          <ul style={{ margin: "0", paddingLeft: "18px", fontSize: "9.5pt", lineHeight: "1.5", color: "#333", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                            {proj.description.split("\n").filter((l) => l.trim()).map((line, idx2) => (
                              <li key={idx2} style={{ marginBottom: "2px" }}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {tailoredResult.extra && (
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: "#111", letterSpacing: "1.5px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 }}>Additional Information</h3>
                    <div style={{ borderBottom: "1.5px solid #333", marginBottom: "8px" }} />
                    <p style={{ margin: 0, fontSize: "9.5pt", lineHeight: "1.5", whiteSpace: "pre-wrap", color: "#222", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
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
