import React, { useState } from "react";
import {
  FileText,
  Award,
  Layers,
  Calendar,
  User,
  Eye,
  Download,
  Copy,
  RefreshCcw,
  Search,
  Filter,
  X,
  Trash2,
  CheckCircle,
} from "lucide-react";
import axios from "axios";

export default function ResumesView({ resumes, setResumes, stats, token }) {
  const [search, setSearch] = useState("");
  const [minAts, setMinAts] = useState("all");
  const [previewResume, setPreviewResume] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState(null);

  const handleRecalculateAts = async (r) => {
    setLoadingId(r._id);
    try {
      if (token && token !== "demo-admin-token") {
        const res = await axios.post(
          `/api/admin/resumes/${r._id}/recalculate-ats`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.success && res.data.resume) {
          setResumes(resumes.map((item) => (item._id === r._id ? res.data.resume : item)));
          if (previewResume?._id === r._id) setPreviewResume(res.data.resume);
          setMessage(`Recalculated ATS Score: ${res.data.resume.atsScore}%`);
        }
      } else {
        const updated = { ...r, atsScore: Math.min((r.atsScore || 75) + 5, 96) };
        setResumes(resumes.map((item) => (item._id === r._id ? updated : item)));
        if (previewResume?._id === r._id) setPreviewResume(updated);
        setMessage(`Demo Recalculated ATS Score: ${updated.atsScore}%`);
      }
    } catch (err) {
      alert("Recalculation failed.");
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleDuplicate = async (r) => {
    setLoadingId(r._id);
    try {
      if (token && token !== "demo-admin-token") {
        const res = await axios.post(
          `/api/admin/resumes/${r._id}/duplicate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.success && res.data.resume) {
          setResumes([res.data.resume, ...resumes]);
          setMessage("Resume duplicated successfully!");
        }
      } else {
        const dup = { ...r, _id: `dup-${Date.now()}`, title: `${r.title || "Resume"} (Copy)` };
        setResumes([dup, ...resumes]);
        setMessage("Demo resume duplicated!");
      }
    } catch (err) {
      alert("Duplicate failed.");
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete resume '${r.title}'?`)) return;
    setLoadingId(r._id);
    try {
      if (token && token !== "demo-admin-token") {
        await axios.delete(`/api/admin/resumes/${r._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setResumes(resumes.filter((item) => item._id !== r._id));
      if (previewResume?._id === r._id) setPreviewResume(null);
      setMessage("Resume deleted.");
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleDownloadJSON = (r) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(r, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `resume-${r._id}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  const handleDownloadPDFSim = (r) => {
    alert(`Initiated ATS PDF Generation & Download for "${r.title || "Resume"}"`);
  };

  const filteredResumes = resumes.filter((r) => {
    const q = search.toLowerCase();
    const titleMatch = (r.title || "").toLowerCase().includes(q);
    const userMatch = (r.userName || r.userId?.name || r.userId?.email || "").toLowerCase().includes(q);
    const jobMatch = (r.targetJob || "").toLowerCase().includes(q);
    const matchesSearch = titleMatch || userMatch || jobMatch;

    let matchesAts = true;
    const score = r.atsScore || 85;
    if (minAts === "90") matchesAts = score >= 90;
    else if (minAts === "80") matchesAts = score >= 80 && score < 90;
    else if (minAts === "70") matchesAts = score >= 70 && score < 80;

    return matchesSearch && matchesAts;
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>Resume Management & Storage</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Inspect user resume documents, ATS compatibility scores, duplicate or recalculate suggestions.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", width: "220px" }}>
            <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search resumes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "32px", fontSize: "0.8rem" }}
            />
          </div>

          <select
            value={minAts}
            onChange={(e) => setMinAts(e.target.value)}
            style={{
              background: "#ffffff",
              border: "1.5px solid var(--border-color)",
              borderRadius: "8px",
              padding: "6px 12px",
              color: "var(--text-main)",
              fontSize: "0.8rem",
              outline: "none",
            }}
          >
            <option value="all">All ATS Scores</option>
            <option value="90">90%+ ATS Score</option>
            <option value="80">80% - 89% ATS Score</option>
            <option value="70">70% - 79% ATS Score</option>
          </select>
        </div>
      </div>

      {/* Alert Toast */}
      {message && (
        <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#047857", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle size={16} /> {message}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="glass-panel" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Total Resumes Stored</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>{resumes.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>System ATS Compliance</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#059669", marginTop: "4px" }}>{stats?.averageAtsScore || 88}%</div>
        </div>
        <div className="glass-panel" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Top ATS Match Template</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#d97706", marginTop: "4px" }}>Modern AI Warm</div>
        </div>
      </div>

      {/* Resumes Table */}
      <div className="glass-panel" style={{ padding: "8px" }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Resume Title & Owner</th>
                <th>Target Job Title</th>
                <th>ATS Score</th>
                <th>Skills Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResumes.length > 0 ? (
                filteredResumes.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FileText size={18} color="#d97706" />
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{r.title || "Untitled Resume"}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                            <User size={12} /> {r.userName || r.userId?.name || r.userId?.email || "User Account"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                      {r.targetJob || "Software Engineer"}
                    </td>

                    <td>
                      <span className={`badge ${ (r.atsScore || 85) >= 85 ? "badge-emerald" : "badge-amber" }`}>
                        <Award size={12} /> ATS {r.atsScore || 85}%
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-indigo">
                        <Layers size={12} /> {Array.isArray(r.skills) ? r.skills.length : 4} Skills
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button onClick={() => setPreviewResume(r)} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.75rem" }} title="Preview Resume">
                          <Eye size={14} /> Preview
                        </button>
                        <button onClick={() => handleRecalculateAts(r)} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.75rem" }} title="Recalculate ATS Score">
                          <RefreshCcw size={14} /> ATS
                        </button>
                        <button onClick={() => handleDuplicate(r)} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.75rem" }} title="Duplicate Resume">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => handleDelete(r)} style={{ background: "rgba(225, 29, 72, 0.12)", border: "1px solid rgba(225, 29, 72, 0.3)", color: "#be123c", padding: "6px 10px", borderRadius: "8px", cursor: "pointer" }} title="Delete Resume">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
                    No resumes matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resume Preview Modal */}
      {previewResume && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(46, 37, 32, 0.45)",
            backdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setPreviewResume(null)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: "100%",
              maxWidth: "640px",
              maxHeight: "85vh",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              overflowY: "auto",
              background: "#ffffff",
              border: "1px solid var(--border-color)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={22} color="#d97706" />
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)" }}>
                  {previewResume.title || "Resume Preview"}
                </h2>
              </div>
              <button onClick={() => setPreviewResume(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <span className="badge badge-emerald">ATS Score: {previewResume.atsScore || 85}%</span>
              <span className="badge badge-indigo">Target: {previewResume.targetJob || "Software Engineer"}</span>
            </div>

            <div style={{ padding: "16px", borderRadius: "12px", background: "var(--surface-2)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontSize: "0.85rem", color: "#d97706", fontWeight: 700 }}>Summary</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: "1.5" }}>
                {previewResume.summary || "Fullstack Software Developer with experience in React, Node.js, Express, and MongoDB."}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontSize: "0.85rem", color: "#d97706", fontWeight: 700 }}>Skills & Technologies</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(previewResume.skills || ["React", "Node.js", "MongoDB", "Express", "TailwindCSS"]).map((s, idx) => (
                  <span key={idx} className="badge badge-indigo">{s}</span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
              <button onClick={() => handleDownloadJSON(previewResume)} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                <Download size={16} /> Download JSON
              </button>
              <button onClick={() => handleDownloadPDFSim(previewResume)} className="glow-btn" style={{ flex: 1, justifyContent: "center" }}>
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
