import { useState, useRef, useEffect, useMemo } from "react";
import { Edit3, Eye } from "lucide-react";
import api from "../api";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const emptyExperience = { company: "", role: "", duration: "", description: "" };
const emptyEducation = { school: "", degree: "", year: "" };
const emptyProject = { name: "", description: "", techStack: "", link: "" };

// ─── AI Suggestion Helper Component ──────────────────────────────────────────
function AISuggestionButton({ field, currentText, role, skills, onSelect }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [show, setShow] = useState(false);

  const getSuggestions = async () => {
    setLoading(true);
    setSuggestions(null);
    setShow(true);
    try {
      const res = await api.post("/api/analyze/suggest", {
        field,
        currentText,
        role,
        skills,
      });
      setSuggestions(res.data.suggestions);
    } catch (err) {
      console.error(err);
      alert("Failed to get suggestions. Please verify you are logged in.");
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="secondary"
        onClick={getSuggestions}
        style={{
          padding: "3px 8px",
          fontSize: "0.75rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)",
          border: "1px dashed var(--accent)",
          borderRadius: "6px",
          color: "var(--accent)",
          cursor: "pointer",
          fontWeight: "600",
          boxShadow: "none",
          transform: "none",
        }}
      >
         AI Suggest
      </button>

      {show && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
          borderRadius: "16px",
          padding: "1.5rem",
          zIndex: 10000,
          maxWidth: "500px",
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
               AI Suggestions
            </span>
            <button
              type="button"
              onClick={() => setShow(false)}
              style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}
            >
              
            </button>
          </div>

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "2rem 0" }}>
              <div style={{
                border: "3px solid var(--surface-2)",
                borderTop: "3px solid var(--accent)",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                animation: "spin 1s linear infinite"
              }} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Generating suggestions...</span>
            </div>
          )}

          {!loading && suggestions && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: "400px", overflowY: "auto" }}>
              {suggestions.map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelect(option);
                    setShow(false);
                  }}
                  style={{
                    padding: "1rem",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    whiteSpace: "pre-line",
                    textAlign: "left",
                    color: "var(--text-main)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.background = "var(--surface)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--surface-2)";
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {show && <div onClick={() => setShow(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999 }} />}
    </div>
  );
}

// ─── AI Grammar Check Helper Component ──────────────────────────────────────────
function AIGrammarFixButton({ currentText, onSelect }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [show, setShow] = useState(false);

  const checkGrammar = async () => {
    if (!currentText || !currentText.trim()) {
      alert("Please enter some text first.");
      return;
    }
    setLoading(true);
    setResult(null);
    setShow(true);
    try {
      const res = await api.post("/api/analyze/fix-grammar", { text: currentText });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to run grammar check. Please verify you are logged in.");
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="secondary"
        onClick={checkGrammar}
        style={{
          padding: "3px 8px",
          fontSize: "0.75rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)",
          border: "1px dashed #10b981",
          borderRadius: "6px",
          color: "#10b981",
          cursor: "pointer",
          fontWeight: "600",
          boxShadow: "none",
          transform: "none",
        }}
      >
         Fix Grammar
      </button>

      {show && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
          borderRadius: "16px",
          padding: "1.5rem",
          zIndex: 10000,
          maxWidth: "500px",
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
               Grammar & Spell Checker
            </span>
            <button
              type="button"
              onClick={() => setShow(false)}
              style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}
            >
              
            </button>
          </div>

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "2rem 0" }}>
              <div style={{
                border: "3px solid var(--surface-2)",
                borderTop: "3px solid #10b981",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                animation: "spin 1s linear infinite"
              }} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Analyzing text...</span>
            </div>
          )}

          {!loading && result && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {!result.hasErrors ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}></div>
                  <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>Looks Perfect!</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No grammatical or spelling errors found.</div>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Corrections Identified:</div>
                    {result.corrections && result.corrections.map((corr, idx) => (
                      <div key={idx} style={{ padding: "0.75rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.85rem" }}>
                        <div style={{ textDecoration: "line-through", color: "#ef4444", marginBottom: "0.25rem", textAlign: "left" }}>
                          {corr.original}
                        </div>
                        <div style={{ color: "#10b981", fontWeight: 600, marginBottom: "0.25rem", textAlign: "left" }}>
                          {corr.corrected}
                        </div>
                        {corr.explanation && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "left" }}>
                            {corr.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", textAlign: "left" }}>Corrected Text:</div>
                    <div style={{
                      padding: "0.75rem",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      whiteSpace: "pre-line",
                      maxHeight: "80px",
                      overflowY: "auto",
                      color: "var(--text-main)",
                      textAlign: "left"
                    }}>
                      {result.correctedText}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(result.correctedText);
                        setShow(false);
                      }}
                      style={{ flex: 1, background: "#10b981", borderColor: "#10b981", color: "#fff" }}
                    >
                      Apply Fixes
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setShow(false)}
                      style={{ flex: 0.5 }}
                    >
                      Dismiss
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      {show && <div onClick={() => setShow(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999 }} />}
    </div>
  );
}

export const RESUME_THEMES = [
  { id: "amber", name: "Warm Amber", accent: "#d97706", header: "#2e2520", border: "#f59e0b" },
  { id: "navy", name: "Executive Navy", accent: "#1e40af", header: "#0f172a", border: "#3b82f6" },
  { id: "emerald", name: "Emerald Tech", accent: "#059669", header: "#064e3b", border: "#10b981" },
  { id: "slate", name: "Minimal Slate", accent: "#475569", header: "#1e293b", border: "#64748b" },
  { id: "crimson", name: "Crimson Ruby", accent: "#be123c", header: "#4c0519", border: "#f43f5e" },
  { id: "amethyst", name: "Royal Violet", accent: "#7c3aed", header: "#3b0764", border: "#8b5cf6" },
];

export const RESUME_FONTS = [
  { id: "sans", name: "Classic Sans", value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: "inter", name: "Modern Inter", value: "'Inter', system-ui, -apple-system, sans-serif" },
  { id: "serif", name: "Executive Serif", value: "Georgia, 'Times New Roman', Times, serif" },
];

export default function ResumeBuilder({ form, setForm }) {
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [checkingGrammar, setCheckingGrammar] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(RESUME_THEMES[0]);
  const [selectedFont, setSelectedFont] = useState(RESUME_FONTS[0]);
  const previewRef = useRef(null);

  // Mobile mode de-congestion states
  const [mobileTab, setMobileTab] = useState("all"); // "all" | "personal" | "summary" | "skills" | "experience" | "education" | "projects" | "extra"
  const [mobileMode, setMobileMode] = useState("edit"); // "edit" | "preview"

  useEffect(() => {
    if (mobileMode === "preview") {
      const timer = setTimeout(() => {
        const el = document.getElementById("resume-preview-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mobileMode]);

  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [tailoring, setTailoring] = useState(false);
  const [tailoredPreview, setTailoredPreview] = useState(null);

  const handleTailorResume = async () => {
    if (!jobDescription.trim()) return;
    setTailoring(true);
    try {
      const res = await api.post("/api/analyze/tailor", {
        resume: form,
        jobDescription,
      });
      if (res.data && res.data.success && res.data.tailoredResume) {
        setTailoredPreview(res.data.tailoredResume);
      } else {
        alert("Unexpected response from server. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to tailor resume. Please make sure backend is running.");
    } finally {
      setTailoring(false);
    }
  };

  const applyTailoredResume = () => {
    if (tailoredPreview) {
      const updatedForm = {
        ...form,
        summary: tailoredPreview.summary || form.summary,
        skills: tailoredPreview.skills || form.skills,
        experience: tailoredPreview.experience || form.experience,
        projects: tailoredPreview.projects || form.projects,
      };
      setForm(updatedForm);
      setIsTailorModalOpen(false);
      setTailoredPreview(null);
      setJobDescription("");
      alert("Resume tailored successfully!");

      // Auto-save the tailored version to the database
      api.post("/api/resume", {
        ...updatedForm,
        skills: updatedForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
      }).catch(err => console.error("Auto-saving tailored resume failed:", err));
    }
  };


  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const updateArrayField = (arrName, index, field, value) => {
    setForm((f) => {
      const arr = [...f[arrName]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...f, [arrName]: arr };
    });
  };

  const addRow = (arrName, empty) =>
    setForm((f) => ({ ...f, [arrName]: [...f[arrName], empty] }));

  const removeRow = (arrName, index) =>
    setForm((f) => ({
      ...f,
      [arrName]: f[arrName].filter((_, i) => i !== index),
    }));

  /** 
   * Uses html2pdf.js to generate a REAL text-based PDF
   * (not a browser print screenshot — fully ATS-readable)
   */
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const name = form.userName?.trim() || "Resume";

      // Construct a clean plain text representation of all resume data
      const textParts = [];
      if (form.userName) textParts.push(form.userName);
      if (form.email) textParts.push(`Email: ${form.email}`);
      if (form.phone) textParts.push(`Phone: ${form.phone}`);
      if (form.linkedin) textParts.push(`LinkedIn: ${form.linkedin}`);
      if (form.github) textParts.push(`GitHub: ${form.github}`);
      if (form.summary) textParts.push(`Summary: ${form.summary}`);
      if (form.skills) textParts.push(`Skills: ${form.skills}`);

      if (form.experience && form.experience.length > 0) {
        textParts.push("Experience:");
        form.experience.forEach((exp) => {
          if (exp.company || exp.role) {
            textParts.push(`${exp.role || ""} at ${exp.company || ""} (${exp.duration || ""})`);
            if (exp.description) textParts.push(exp.description);
          }
        });
      }

      if (form.education && form.education.length > 0) {
        textParts.push("Education:");
        form.education.forEach((edu) => {
          if (edu.school || edu.degree) {
            textParts.push(`${edu.degree || ""} from ${edu.school || ""} (${edu.year || ""})`);
          }
        });
      }

      if (form.projects && form.projects.length > 0) {
        textParts.push("Projects:");
        form.projects.forEach((proj) => {
          if (proj.name) {
            textParts.push(`${proj.name || ""} - Tech: ${proj.techStack || ""}`);
            if (proj.description) textParts.push(proj.description);
          }
        });
      }

      if (form.extra) textParts.push(form.extra);
      const fullText = textParts.join("\n");

      const opt = {
        margin: 0,
        filename: `${name.replace(/\s+/g, "_")}_Resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css"] },
      };

      await html2pdf()
        .set(opt)
        .from(previewRef.current)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          // Add invisible text layer on the first page
          pdf.setPage(1);
          pdf.setTextColor(255, 255, 255); // white text color
          pdf.setFontSize(1); // 1 pt font size
          
          // Split text to fit width (180mm)
          const splitText = pdf.splitTextToSize(fullText, 180);
          pdf.text(splitText, 10, 10);
        })
        .save();

      // Auto-save to database in the background when downloading PDF
      saveToDB(true);
      api.post("/api/user/activity", {
        action: "Resume Downloaded",
        description: `Exported PDF copy of resume "${form.userName || "Untitled"}"`
      }).catch(() => {});
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCheckGrammar = async () => {
    setCheckingGrammar(true);
    try {
      const res = await api.post("/api/analyze/check-grammar", { resumeData: form });
      if (res.data.correctedData) {
        setForm((prev) => ({
          ...prev,
          ...res.data.correctedData,
        }));
      }
      const fixes = res.data.improvements?.join("\n• ") || "Polished spelling, grammar, and action verbs!";
      alert(` Grammar & Tone Check Completed!\n\nImprovements applied:\n• ${fixes}`);
    } catch (err) {
      console.error(err);
      alert("Grammar check failed. Please try again.");
    } finally {
      setCheckingGrammar(false);
    }
  };

  const saveToDB = async (silent = false) => {
    if (!silent) setSaving(true);
    try {
      await api.post("/api/resume", {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      if (!silent) alert("Resume saved!");
    } catch (err) {
      if (!silent) alert("Failed to save resume.");
      console.error(err);
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const skillsList = useMemo(() => {
    return (form.skills || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [form.skills]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>Resume Builder</h1>
        <p>Fill in your details and preview your resume in real time</p>
        <button
          className="secondary mobile-only-btn"
          onClick={() => {
            setMobileMode("preview");
            const el = document.getElementById("resume-preview-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          style={{ marginTop: "0.75rem", padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "999px" }}
        >
           Check Resume ↓
        </button>
      </div>

      <div className="container builder-layout" style={{ display: "flex", gap: "2rem", alignItems: "flex-start", paddingTop: 0 }}>
        {/* ===== FORM PANEL ===== */}
        <div className={`card builder-form-panel ${mobileMode === "preview" ? "mobile-panel-hidden" : ""}`} style={{ flex: 1, minWidth: 0 }}>
          {/* Mobile Section Nav Tabs */}
          <div className="mobile-section-nav">
            {[
              { id: "all", label: " All Sections" },
              { id: "personal", label: " Personal" },
              { id: "summary", label: " Summary" },
              { id: "skills", label: " Skills" },
              { id: "experience", label: " Experience" },
              { id: "education", label: " Education" },
              { id: "projects", label: " Projects" },
              { id: "extra", label: " Extra" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={mobileTab === tab.id ? "active" : ""}
                onClick={() => setMobileTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contact Info */}
          {(mobileTab === "all" || mobileTab === "personal") && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="section-chip"> Personal Info</div>
              <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Full Name</label>
                  <input placeholder="John Doe" value={form.userName} onChange={(e) => update("userName", e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Email</label>
                  <input placeholder="john@example.com" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Phone</label>
                  <input placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>LinkedIn URL</label>
                  <input placeholder="linkedin.com/in/johndoe" value={form.linkedin || ""} onChange={(e) => update("linkedin", e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
                  <label>GitHub URL</label>
                  <input placeholder="github.com/johndoe" value={form.github || ""} onChange={(e) => update("github", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {(mobileTab === "all" || mobileTab === "summary") && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="section-chip"> Summary</div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <label style={{ margin: 0 }}>Professional Summary</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <AIGrammarFixButton
                      currentText={form.summary}
                      onSelect={(val) => update("summary", val)}
                    />
                    <AISuggestionButton
                      field="summary"
                      currentText={form.summary}
                      skills={form.skills}
                      onSelect={(val) => update("summary", val)}
                    />
                  </div>
                </div>
                <textarea placeholder="Brief overview of your skills and experience..." rows={3} value={form.summary} onChange={(e) => update("summary", e.target.value)} />
              </div>
            </div>
          )}

          {/* Skills */}
          {(mobileTab === "all" || mobileTab === "skills") && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="section-chip"> Skills</div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <label style={{ margin: 0 }}>Technical Skills (comma separated)</label>
                  <AISuggestionButton
                    field="skills"
                    currentText={form.skills}
                    role={form.experience && form.experience[0] ? form.experience[0].role : ""}
                    onSelect={(val) => update("skills", val)}
                  />
                </div>
                <input placeholder="React, Node.js, Python, SQL..." value={form.skills} onChange={(e) => update("skills", e.target.value)} />
              </div>
            </div>
          )}

          {/* Experience */}
          {(mobileTab === "all" || mobileTab === "experience") && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="section-chip"> Experience</div>
              {form.experience.map((exp, i) => (
                <div key={i} style={{ border: "1px solid var(--border)", padding: "1rem", borderRadius: "10px", background: "var(--surface-2)", marginBottom: "0.75rem" }}>
                  <div className="form-2col" style={{ marginBottom: "0.5rem" }}>
                    <input placeholder="Company" value={exp.company} onChange={(e) => updateArrayField("experience", i, "company", e.target.value)} />
                    <input placeholder="Role / Title" value={exp.role} onChange={(e) => updateArrayField("experience", i, "role", e.target.value)} />
                  </div>
                  <input placeholder="Duration (e.g. Jan 2023 – Dec 2024)" style={{ marginBottom: "0.5rem" }} value={exp.duration} onChange={(e) => updateArrayField("experience", i, "duration", e.target.value)} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <label style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>Job Description</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <AIGrammarFixButton
                        currentText={exp.description}
                        onSelect={(val) => updateArrayField("experience", i, "description", val)}
                      />
                      <AISuggestionButton
                        field="experience"
                        currentText={exp.description}
                        role={exp.role}
                        onSelect={(val) => updateArrayField("experience", i, "description", val)}
                      />
                    </div>
                  </div>
                  <textarea placeholder="Description (each new line = a bullet point)" rows={3} value={exp.description} onChange={(e) => updateArrayField("experience", i, "description", e.target.value)} style={{ marginBottom: "0.5rem" }} />
                  <button className="secondary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }} onClick={() => removeRow("experience", i)}> Remove</button>
                </div>
              ))}
              <button className="secondary" onClick={() => addRow("experience", emptyExperience)}>+ Add Experience</button>
            </div>
          )}

          {/* Education */}
          {(mobileTab === "all" || mobileTab === "education") && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="section-chip"> Education</div>
              {form.education.map((edu, i) => (
                <div key={i} style={{ border: "1px solid var(--border)", padding: "1rem", borderRadius: "10px", background: "var(--surface-2)", marginBottom: "0.75rem" }}>
                  <div className="form-2col" style={{ marginBottom: "0.5rem" }}>
                    <input placeholder="School / University" value={edu.school} onChange={(e) => updateArrayField("education", i, "school", e.target.value)} />
                    <input placeholder="Degree" value={edu.degree} onChange={(e) => updateArrayField("education", i, "degree", e.target.value)} />
                  </div>
                  <input placeholder="Graduation Year (e.g. 2024)" style={{ marginBottom: "0.5rem" }} value={edu.year} onChange={(e) => updateArrayField("education", i, "year", e.target.value)} />
                  <button className="secondary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }} onClick={() => removeRow("education", i)}> Remove</button>
                </div>
              ))}
              <button className="secondary" onClick={() => addRow("education", emptyEducation)}>+ Add Education</button>
            </div>
          )}

          {/* Projects */}
          {(mobileTab === "all" || mobileTab === "projects") && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="section-chip"> Projects</div>
              {form.projects && form.projects.map((proj, i) => (
                <div key={i} style={{ border: "1px solid var(--border)", padding: "1rem", borderRadius: "10px", background: "var(--surface-2)", marginBottom: "0.75rem" }}>
                  <div className="form-2col" style={{ marginBottom: "0.5rem" }}>
                    <input placeholder="Project Name" value={proj.name} onChange={(e) => updateArrayField("projects", i, "name", e.target.value)} />
                    <input placeholder="Tech Stack" value={proj.techStack} onChange={(e) => updateArrayField("projects", i, "techStack", e.target.value)} />
                  </div>
                  <input placeholder="Project Link / URL" style={{ marginBottom: "0.5rem" }} value={proj.link} onChange={(e) => updateArrayField("projects", i, "link", e.target.value)} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <label style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>Project Description</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <AIGrammarFixButton
                        currentText={proj.description}
                        onSelect={(val) => updateArrayField("projects", i, "description", val)}
                      />
                      <AISuggestionButton
                        field="project"
                        currentText={proj.description}
                        role={proj.name}
                        skills={proj.techStack}
                        onSelect={(val) => updateArrayField("projects", i, "description", val)}
                      />
                    </div>
                  </div>
                  <textarea placeholder="Description (each line = bullet point)" rows={3} value={proj.description} onChange={(e) => updateArrayField("projects", i, "description", e.target.value)} style={{ marginBottom: "0.5rem" }} />
                  <button className="secondary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }} onClick={() => removeRow("projects", i)}> Remove</button>
                </div>
              ))}
              <button className="secondary" onClick={() => addRow("projects", emptyProject)}>+ Add Project</button>
            </div>
          )}

          {/* Extra */}
          {(mobileTab === "all" || mobileTab === "extra") && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="section-chip"> Extra</div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <label style={{ margin: 0 }}>Awards, Certifications, Languages, etc.</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <AIGrammarFixButton
                      currentText={form.extra || ""}
                      onSelect={(val) => update("extra", val)}
                    />
                    <AISuggestionButton
                      field="extra"
                      currentText={form.extra || ""}
                      role={form.experience && form.experience[0] ? form.experience[0].role : ""}
                      skills={form.skills}
                      onSelect={(val) => update("extra", val)}
                    />
                  </div>
                </div>
                <textarea placeholder="e.g. AWS Certified Developer, Fluent in Spanish, Dean's List 2023..." rows={3} value={form.extra || ""} onChange={(e) => update("extra", e.target.value)} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="builder-actions btn-group-responsive" style={{ paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
            <button onClick={downloadPDF} disabled={downloading} style={{ flex: 1 }}>
              {downloading ? "⏳ Generating PDF..." : "⬇ Download PDF"}
            </button>
            <button className="secondary" onClick={saveToDB} disabled={saving} style={{ flex: 1 }}>
              {saving ? "Saving..." : " Save to Database"}
            </button>
            <button
              className="secondary"
              onClick={handleCheckGrammar}
              disabled={checkingGrammar}
              style={{
                flex: 1,
                border: "1px solid #10b981",
                background: "rgba(16, 185, 129, 0.12)",
                color: "#10b981",
                fontWeight: 600
              }}
            >
              {checkingGrammar ? " Proofreading..." : " Check Grammar"}
            </button>
            <button
              className="secondary"
              onClick={() => setIsTailorModalOpen(true)}
              style={{
                flex: 1,
                border: "1px solid var(--accent)",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
                color: "var(--accent-light, #c084fc)"
              }}
            >
               Tailor to Job
            </button>
          </div>
        </div>

        {/* ===== LIVE PREVIEW PANEL ===== */}
        <div id="resume-preview-section" className={`resume-preview-wrapper ${mobileMode === "edit" ? "mobile-panel-hidden" : ""}`} style={{ flex: 1, minWidth: 0, flexDirection: "column", alignItems: "center" }}>
          {/* Header bar */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", width: "100%", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
               Live Preview
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Updates as you type</span>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setMobileMode("edit");
                  window.scrollTo(0, 0);
                }}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem", borderRadius: "6px" }}
              >
                ↑ Back to Editor
              </button>
            </div>
          </div>

          {/* Theme & Palette Customization Bar */}
          <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "0.9rem 1.25rem",
            width: "100%",
            marginBottom: "1rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem"
          }}>
            {/* Color Palette Swatches */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Theme</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                {RESUME_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    title={theme.name}
                    style={{
                      width: "26px",
                      height: "26px",
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

            {/* Font Selector Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Font</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                {RESUME_FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setSelectedFont(font)}
                    style={{
                      padding: "0.25rem 0.6rem",
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

          {/* The Resume "Paper" — this is what gets converted to PDF */}
          <div
            id="resume-preview"
            ref={previewRef}
            style={{
              background: "#fff",
              color: "#1a1a1a",
              padding: "40px 48px",
              fontFamily: selectedFont.value,
              width: "100%",
              maxWidth: "794px",  /* A4 width at 96dpi */
              minHeight: "1123px", /* A4 height at 96dpi */
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
              boxSizing: "border-box",
              borderRadius: "4px",
              fontSize: "10pt",
              lineHeight: "1.4",
              overflowX: "auto",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: `2.5px solid ${selectedTheme.accent}` }}>
              <h1 style={{ margin: "0 0 6px 0", fontSize: "22pt", color: selectedTheme.header, textTransform: "uppercase", letterSpacing: "2px", fontFamily: selectedFont.value, fontWeight: 700 }}>
                {form.userName || "YOUR NAME"}
              </h1>
              <p style={{ margin: 0, fontSize: "9pt", color: "#444", fontFamily: selectedFont.value }}>
                {[form.email, form.phone, form.linkedin, form.github].filter(Boolean).join("  |  ")}
              </p>
            </div>

            {/* Summary */}
            {form.summary && (
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.5px", fontFamily: selectedFont.value, fontWeight: 700 }}>Summary</h3>
                <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "8px" }} />
                <p style={{ margin: 0, fontSize: "9.5pt", lineHeight: "1.5", color: "#222", fontFamily: selectedFont.value }}>{form.summary}</p>
              </div>
            )}

            {/* Skills */}
            {skillsList.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.5px", fontFamily: selectedFont.value, fontWeight: 700 }}>Skills</h3>
                <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "8px" }} />
                <p style={{ margin: 0, fontSize: "9.5pt", lineHeight: "1.5", fontFamily: selectedFont.value, color: "#222" }}>
                  {skillsList.join("  •  ")}
                </p>
              </div>
            )}

            {/* Experience */}
            {form.experience.some((e) => e.company || e.role) && (
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.5px", fontFamily: selectedFont.value, fontWeight: 700 }}>Professional Experience</h3>
                <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "8px" }} />
                {form.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                      <div>
                        <strong style={{ fontSize: "10pt", color: selectedTheme.header, fontFamily: selectedFont.value }}>{exp.role}</strong>
                        {exp.company && <span style={{ fontSize: "9.5pt", color: "#333", fontFamily: selectedFont.value }}> — {exp.company}</span>}
                      </div>
                      {exp.duration && <em style={{ fontSize: "9pt", color: "#555", fontFamily: selectedFont.value }}>{exp.duration}</em>}
                    </div>
                    {exp.description && (
                      <ul style={{ margin: "0", paddingLeft: "18px", fontSize: "9.5pt", lineHeight: "1.5", color: "#333", fontFamily: selectedFont.value }}>
                        {exp.description.split("\n").filter((l) => l.trim()).map((line, idx) => (
                          <li key={idx} style={{ marginBottom: "2px" }}>{line}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {form.education.some((e) => e.school || e.degree) && (
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.5px", fontFamily: selectedFont.value, fontWeight: 700 }}>Education</h3>
                <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "8px" }} />
                {form.education.map((edu, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                    <div>
                      <strong style={{ fontSize: "10pt", color: selectedTheme.header, fontFamily: selectedFont.value }}>{edu.school}</strong>
                      {edu.degree && <span style={{ fontSize: "9.5pt", color: "#333", fontFamily: selectedFont.value }}> — {edu.degree}</span>}
                    </div>
                    {edu.year && <span style={{ fontSize: "9pt", color: "#555", fontFamily: selectedFont.value }}>{edu.year}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {form.projects && form.projects.some((p) => p.name) && (
              <div style={{ marginBottom: "12px" }}>
                <h3 style={{ margin: "0 0 3px 0", fontSize: "9.5pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.2px", fontFamily: selectedFont.value, fontWeight: 700 }}>Projects</h3>
                <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "6px" }} />
                {form.projects.map((proj, i) => (
                  <div key={i} style={{ marginBottom: "8px" }}>
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
                        {proj.description.split("\n").filter((l) => l.trim()).map((line, idx) => (
                          <li key={idx} style={{ marginBottom: "1.5px" }}>{line}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Extra */}
            {form.extra && (
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "10pt", textTransform: "uppercase", color: selectedTheme.accent, letterSpacing: "1.5px", fontFamily: selectedFont.value, fontWeight: 700 }}>Additional Information</h3>
                <div style={{ borderBottom: `1.5px solid ${selectedTheme.accent}`, marginBottom: "8px" }} />
                <p style={{ margin: 0, fontSize: "9.5pt", lineHeight: "1.5", whiteSpace: "pre-wrap", color: "#222", fontFamily: selectedFont.value }}>
                  {form.extra}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== AI TAILOR MODAL ===== */}
      {isTailorModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="card" style={{
            maxWidth: "650px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            border: "1px solid var(--border)",
            background: "var(--surface-1)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            padding: "1.5rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-main)" }}> Tailor Resume with AI</h3>
              <button className="secondary" style={{ padding: "0.25rem 0.5rem", minWidth: "auto", fontSize: "0.9rem" }} onClick={() => {
                setIsTailorModalOpen(false);
                setTailoredPreview(null);
                setJobDescription("");
              }}></button>
            </div>
            
            {!tailoredPreview ? (
              <>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>
                  Paste the target job description below. Our AI will optimize your summary, technical skills, and experience/project descriptions to best match the job requirements.
                </p>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Target Job Description</label>
                  <textarea
                    placeholder="Paste the job description here..."
                    rows={8}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    onClick={handleTailorResume}
                    disabled={tailoring || !jobDescription.trim()}
                    style={{ flex: 1 }}
                  >
                    {tailoring ? "⏳ Optimizing Resume..." : " Optimize Resume"}
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setIsTailorModalOpen(false)}
                    style={{ flex: 0.5 }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>
                  Here are the suggested AI optimizations. Review the updates and click <strong>Apply Changes</strong> to update your resume builder.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "50vh", overflowY: "auto", paddingRight: "0.25rem" }}>
                  {/* Summary Comparison */}
                  {tailoredPreview.summary !== form.summary && (
                    <div style={{ border: "1px solid var(--border)", borderRadius: "6px", padding: "0.75rem", background: "var(--surface-2)" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--accent)" }}>Summary Update:</strong>
                      <div style={{ fontSize: "0.85rem", textDecoration: "line-through", color: "var(--text-muted)", marginTop: "0.25rem" }}>{form.summary}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-main)", marginTop: "0.25rem", fontWeight: 500 }}>{tailoredPreview.summary}</div>
                    </div>
                  )}

                  {/* Skills Comparison */}
                  {tailoredPreview.skills !== form.skills && (
                    <div style={{ border: "1px solid var(--border)", borderRadius: "6px", padding: "0.75rem", background: "var(--surface-2)" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--accent)" }}>Skills Update:</strong>
                      <div style={{ fontSize: "0.85rem", textDecoration: "line-through", color: "var(--text-muted)", marginTop: "0.25rem" }}>{form.skills}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-main)", marginTop: "0.25rem", fontWeight: 500 }}>{tailoredPreview.skills}</div>
                    </div>
                  )}

                  {/* Experience Comparison */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: "6px", padding: "0.75rem", background: "var(--surface-2)" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--accent)" }}>Experience & Projects Updates:</strong>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.25rem 0" }}>Work and project histories have been aligned to highlight relevant tools/responsibilities.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    onClick={applyTailoredResume}
                    style={{ flex: 1 }}
                  >
                     Apply Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Mode Floating Switcher Bar */}
      <div className="mobile-floating-switcher">
        <button
          type="button"
          className={mobileMode === "edit" ? "active" : ""}
          onClick={() => {
            setMobileMode("edit");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Edit3 size={16} />
          <span>Edit Form</span>
        </button>
        <button
          type="button"
          className={mobileMode === "preview" ? "active" : ""}
          onClick={() => {
            setMobileMode("preview");
            const el = document.getElementById("resume-preview-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>
      </div>
    </div>
  );
}
