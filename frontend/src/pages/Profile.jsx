import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Edit3,
  Camera,
  FileText,
  Search,
  Award,
  Code,
  Download,
  Sparkles,
  ShieldCheck,
  Lock,
  UserCheck,
  Sliders,
  Trash2,
  Copy,
  ExternalLink,
  Plus,
  Check,
  X,
  Key,
  Bell,
  Moon,
  Globe,
  ShieldAlert,
  Eye,
  FileDown,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  LogOut
} from "lucide-react";

import api, {
  fetchUserProfile,
  updateUserProfile,
  changeUserPassword,
  exportUserData,
  deleteUserAccount,
  logUserActivity,
  fetchPricingConfig,
  upgradeUserSubscription,
} from "../api";

export default function Profile({ user, setUser, navigate, setForm, handleLogout, onOpenSupport, onOpenBuyCredits }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // "success" | "error"

  const [pricingConfig, setPricingConfig] = useState({
    normalPlanPrice: 0,
    proPlanPrice: 499,
    enterprisePlanPrice: 1999,
    pricePerCreditInr: 2,
    dailyBonusCredits: 4,
    initialSignupCredits: 10,
  });
  const [upgradingPlan, setUpgradingPlan] = useState(false);

  // User profile state
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    headline: "College Student & Aspiring Developer",
    university: "State University",
    linkedin: "",
    github: "",
    avatar: "",
    aiPersonalization: true,
    notificationPreferences: {
      emailAlerts: true,
      resumeTips: true,
      weeklySummary: false,
    },
    createdAt: user?.createdAt || new Date().toISOString(),
  });

  const [stats, setStats] = useState({
    totalResumes: 0,
    analysesCompleted: 0,
    highestAtsScore: 0,
    projectsAdded: 0,
    resumeDownloads: 0,
  });

  const [profileCompletion, setProfileCompletion] = useState(75);
  const [savedResumes, setSavedResumes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("general"); // "general" | "security" | "notifications" | "privacy"

  // Form states for modals
  const [editForm, setEditForm] = useState({
    name: "",
    headline: "",
    university: "",
    linkedin: "",
    github: "",
    avatar: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Preset avatar styles
  const presetAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
  ];

  // Show floating toast
  const showToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4500);
  };

  // Load profile data from API
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [data, pricingRes] = await Promise.all([
          fetchUserProfile().catch(() => null),
          fetchPricingConfig().catch(() => null),
        ]);

        if (isMounted && pricingRes?.success && pricingRes?.pricing) {
          setPricingConfig(pricingRes.pricing);
        }

        if (isMounted && data?.success) {
          setProfile(data.profile);
          setStats(data.stats);
          setProfileCompletion(data.profileCompletion);
          setSavedResumes(data.savedResumes || []);
          setRecentActivity(data.recentActivity || []);
          setEditForm({
            name: data.profile.name || "",
            headline: data.profile.headline || "",
            university: data.profile.university || "",
            linkedin: data.profile.linkedin || "",
            github: data.profile.github || "",
            avatar: data.profile.avatar || "",
          });

          // Sync top-level user object in App state & localStorage for Navbar display
          if (setUser && data.profile) {
            setUser((prev) => {
              const updatedUser = {
                ...prev,
                name: data.profile.name || prev?.name,
                email: data.profile.email || prev?.email,
                aiCredits: data.profile.aiCredits,
                subscription: data.profile.subscription,
                role: data.profile.role,
                status: data.profile.status,
              };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              return updatedUser;
            });
          }
        }
      } catch (err) {
        // Fallback to local default state if API is offline or initial mount
        if (isMounted) {
          setProfile((prev) => ({
            ...prev,
            name: user?.name || "Student User",
            email: user?.email || "student@university.edu",
          }));
          setEditForm({
            name: user?.name || "Student User",
            headline: "College Student & Aspiring Developer",
            university: "State University",
            linkedin: "",
            github: "",
            avatar: "",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlanUpgrade = async (planName) => {
    try {
      setUpgradingPlan(true);
      const res = await upgradeUserSubscription(planName);
      if (res?.success) {
        setProfile((prev) => ({
          ...prev,
          subscription: res.subscription,
          aiCredits: res.aiCredits,
        }));
        if (setUser) {
          setUser((prev) => {
            const updated = {
              ...prev,
              subscription: res.subscription,
              aiCredits: res.aiCredits,
            };
            localStorage.setItem("user", JSON.stringify(updated));
            return updated;
          });
        }
        showToast(res.message || `Successfully switched to ${planName.toUpperCase()} plan!`);
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to change subscription plan.", "error");
    } finally {
      setUpgradingPlan(false);
    }
  };

  // Toggle AI Personalization
  const handleToggleAIPersonalization = async () => {
    const updatedValue = !profile.aiPersonalization;
    setProfile((prev) => ({ ...prev, aiPersonalization: updatedValue }));
    try {
      await updateUserProfile({ aiPersonalization: updatedValue });
      showToast(
        updatedValue
          ? "AI Personalization enabled! Your AI recommendations are now tailored to your profile."
          : "AI Personalization disabled."
      );
    } catch (err) {
      showToast("Failed to update AI settings.", "error");
    }
  };

  // Toggle Notification Preference
  const handleToggleNotification = async (key) => {
    const updatedPrefs = {
      ...profile.notificationPreferences,
      [key]: !profile.notificationPreferences?.[key],
    };
    setProfile((prev) => ({ ...prev, notificationPreferences: updatedPrefs }));
    try {
      await updateUserProfile({ notificationPreferences: updatedPrefs });
      showToast("Notification preferences updated.");
    } catch (err) {
      showToast("Failed to update notification settings.", "error");
    }
  };

  // Save profile changes (Edit Modal)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateUserProfile(editForm);
      if (res.success) {
        setProfile((prev) => ({ ...prev, ...res.user }));
        setUser((prev) => ({ ...prev, name: res.user.name }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, name: res.user.name })
        );
        setShowEditModal(false);
        showToast("Profile details updated successfully!");

        // Refresh stats/completion
        const freshData = await fetchUserProfile();
        if (freshData.success) {
          setProfileCompletion(freshData.profileCompletion);
          setRecentActivity(freshData.recentActivity || []);
        }
      }
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to update profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    try {
      setSaving(true);
      const res = await changeUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.success) {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        showToast("Password updated successfully!");
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.error || "Failed to change password. Check your current password."
      );
    } finally {
      setSaving(false);
    }
  };

  // Export User Data
  const handleExportData = async () => {
    try {
      showToast("Preparing data export...");
      await exportUserData();
      showToast("Your data has been exported successfully!");
    } catch (err) {
      showToast("Failed to export user data.", "error");
    }
  };

  // Delete Resume
  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`/api/resume/${resumeId}`);
      setSavedResumes((prev) => prev.filter((r) => r._id !== resumeId));
      setStats((prev) => ({ ...prev, totalResumes: Math.max(0, prev.totalResumes - 1) }));
      showToast("Resume deleted.");
      logUserActivity("Resume Deleted", "Removed resume from saved collection");
    } catch (err) {
      showToast("Could not delete resume.", "error");
    }
  };

  // Duplicate Resume
  const handleDuplicateResume = async (resume) => {
    try {
      const copyData = {
        ...resume,
        userName: `${resume.userName} (Copy)`,
      };
      delete copyData._id;
      delete copyData.createdAt;
      delete copyData.updatedAt;

      const { data } = await api.post("/api/resume", copyData);
      if (data.success) {
        setSavedResumes((prev) => [data.data, ...prev]);
        setStats((prev) => ({ ...prev, totalResumes: prev.totalResumes + 1 }));
        showToast("Resume duplicated successfully!");
        logUserActivity("Resume Duplicated", `Created a copy of ${resume.userName}`);
      }
    } catch (err) {
      showToast("Failed to duplicate resume.", "error");
    }
  };

  // Open Resume in Builder
  const handleEditInBuilder = (resume) => {
    if (setForm) {
      setForm({
        userName: resume.userName || "",
        email: resume.email || "",
        phone: resume.phone || "",
        linkedin: resume.linkedin || "",
        github: resume.github || "",
        summary: resume.summary || "",
        skills: Array.isArray(resume.skills) ? resume.skills.join(", ") : resume.skills || "",
        experience: resume.experience?.length ? resume.experience : [{ company: "", role: "", duration: "", description: "" }],
        education: resume.education?.length ? resume.education : [{ school: "", degree: "", year: "" }],
        projects: resume.projects?.length ? resume.projects : [{ name: "", description: "", techStack: "", link: "" }],
        extra: resume.extra || "",
      });
    }
    navigate("builder");
  };

  // Account Deletion
  const handleDeleteAccountSubmit = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete my account") {
      showToast("Please type 'DELETE MY ACCOUNT' to confirm deletion.", "error");
      return;
    }

    try {
      setSaving(true);
      await deleteUserAccount();
      setShowDeleteModal(false);
      handleLogout();
    } catch (err) {
      showToast("Failed to delete account. Please try again.", "error");
      setSaving(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Format time relative
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = Math.abs(now - past);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="profile-page-container container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -40, x: "-50%" }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              top: "84px",
              left: "50%",
              zIndex: 9999,
              background:
                toastType === "success"
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))"
                  : "linear-gradient(135deg, rgba(225, 29, 72, 0.95), rgba(190, 18, 60, 0.95))",
              color: "#ffffff",
              padding: "0.85rem 1.6rem",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
              backdropFilter: "blur(12px)",
              fontSize: "0.9rem",
              fontWeight: 600,
              maxWidth: "520px",
              width: "calc(100% - 2rem)",
            }}
          >
            {toastType === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span style={{ flex: 1 }}>{toastMessage}</span>
            <button
              onClick={() => setToastMessage("")}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                padding: "3px 8px",
                fontSize: "0.8rem",
              }}
            >
              
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. PROFILE HEADER CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card profile-header-card"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, var(--surface-2) 100%)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--border)",
          padding: "2.25rem",
          marginBottom: "2rem",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="profile-header-glow" />

        <div className="profile-header-grid" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.75rem", alignItems: "center" }}>
          {/* Avatar Container with Upload Icon */}
          <div style={{ position: "relative" }}>
            <div
              className="profile-avatar-circle"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.2rem",
                fontWeight: 800,
                color: "#ffffff",
                boxShadow: "0 8px 24px rgba(217, 119, 6, 0.25)",
                border: "4px solid #ffffff",
                overflow: "hidden",
              }}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                profile.name?.charAt(0)?.toUpperCase() || "S"
              )}
            </div>

            <button
              onClick={() => setShowAvatarModal(true)}
              className="avatar-edit-badge"
              title="Change Profile Picture"
              style={{
                position: "absolute",
                bottom: "2px",
                right: "2px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--accent)",
                color: "#ffffff",
                border: "2px solid #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                padding: 0,
              }}
            >
              <Camera size={15} />
            </button>
          </div>

          {/* Identity & Metadata */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                {profile.name}
              </h1>
              <span
                style={{
                  background: profile.isOnline || (profile.lastActiveAt && Date.now() - new Date(profile.lastActiveAt).getTime() < 5 * 60 * 1000)
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(156, 163, 175, 0.12)",
                  color: profile.isOnline || (profile.lastActiveAt && Date.now() - new Date(profile.lastActiveAt).getTime() < 5 * 60 * 1000)
                    ? "#059669"
                    : "#6b7280",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "20px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                {profile.isOnline || (profile.lastActiveAt && Date.now() - new Date(profile.lastActiveAt).getTime() < 5 * 60 * 1000)
                  ? " Online Now"
                  : " Offline"}
              </span>
              <span
                style={{
                  background: "rgba(217, 119, 6, 0.12)",
                  color: "var(--accent)",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "20px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  textTransform: "uppercase"
                }}
              >
                 {profile.subscription || user?.subscription || "Free"} Plan
              </span>
              <span
                style={{
                  background: "rgba(59, 130, 246, 0.12)",
                  color: "#2563eb",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "20px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                 {profile.aiCredits !== undefined ? profile.aiCredits : (user?.aiCredits ?? 100)} AI Credits
              </span>
              {onOpenBuyCredits && (
                <button
                  onClick={onOpenBuyCredits}
                  style={{
                    background: "var(--accent)",
                    color: "#ffffff",
                    padding: "0.2rem 0.65rem",
                    borderRadius: "20px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                   Buy Credits
                </button>
              )}
            </div>

            <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--accent)", marginBottom: "0.4rem" }}>
              {profile.headline || "College Student & Aspiring Career Builder"}
            </p>

            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.5rem", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                 {profile.university || "University Student"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                 {profile.email}
              </span>
              {profile.linkedin ? (
                <a
                  href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#0a66c2", textDecoration: "none", fontWeight: 700 }}
                >
                   LinkedIn
                </a>
              ) : (
                <span
                  onClick={() => setShowEditModal(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--text-light)", cursor: "pointer" }}
                  title="Click to add LinkedIn URL"
                >
                   + Add LinkedIn
                </span>
              )}
              {profile.github ? (
                <a
                  href={profile.github.startsWith("http") ? profile.github : `https://${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--text-main)", textDecoration: "none", fontWeight: 700 }}
                >
                   GitHub
                </a>
              ) : (
                <span
                  onClick={() => setShowEditModal(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--text-light)", cursor: "pointer" }}
                  title="Click to add GitHub URL"
                >
                   + Add GitHub
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }} title={`Signed up on ${formatDate(profile.createdAt)}`}>
                 Joined {formatDate(profile.createdAt)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }} title={`First login: ${formatDate(profile.firstLogin || profile.createdAt)}`}>
                 First Login: {formatDate(profile.firstLogin || profile.createdAt)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }} title={`Last login: ${formatDate(profile.lastLogin || profile.createdAt)}`}>
                 Last Active: {formatTimeAgo(profile.lastLogin || profile.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", alignItems: "flex-end" }}>
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                padding: "0.65rem 1.35rem",
                borderRadius: "var(--radius)",
                fontSize: "0.9rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--primary)",
                color: "#ffffff",
              }}
            >
              <Edit3 size={16} /> Edit Profile
            </button>

            {onOpenSupport && (
              <button
                onClick={onOpenSupport}
                style={{
                  padding: "0.65rem 1.35rem",
                  borderRadius: "var(--radius)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "var(--surface-2)",
                  color: "var(--primary)",
                  border: "1px solid var(--border)",
                  cursor: "pointer"
                }}
              >
                 Support & Tickets
              </button>
            )}
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="profile-completion-box">
          <div className="profile-completion-header">
            <span className="profile-completion-title">
              Profile Completion: <span style={{ color: "var(--accent)" }}>{profileCompletion}%</span>
            </span>
            <span className="profile-completion-badge">
              {profileCompletion >= 90 ? " High AI accuracy" : " Complete to unlock personalized suggestions"}
            </span>
          </div>

          {/* Progress Bar Container */}
          <div
            style={{
              width: "100%",
              height: "10px",
              background: "var(--border)",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                height: "100%",
                background: "linear-gradient(90deg, var(--accent) 0%, #f59e0b 100%)",
                borderRadius: "10px",
              }}
            />
          </div>

          <p className="profile-completion-msg">
            "Complete your profile to create better resumes and receive personalized AI suggestions."
          </p>
        </div>
      </motion.div>

      {/* ── 2. PROFILE STATISTICS ── */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
           Resume & Activity Dashboard
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Card 1: Total Resumes */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="card glass-panel"
            style={{ padding: "1.35rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderLeft: "4px solid var(--primary)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(46, 37, 32, 0.08)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={22} />
              </div>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>{stats.totalResumes}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>Total Resumes Created</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Saved in builder dashboard</div>
            </div>
          </motion.div>

          {/* Card 2: Analyses Completed */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="card glass-panel"
            style={{ padding: "1.35rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderLeft: "4px solid var(--accent)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(217, 119, 6, 0.12)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Search size={22} />
              </div>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>{stats.analysesCompleted}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>Resume Analyses Completed</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>AI ATS audits & feedback</div>
            </div>
          </motion.div>

          {/* Card 3: Highest ATS Score */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="card glass-panel"
            style={{ padding: "1.35rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderLeft: "4px solid #10b981" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award size={22} />
              </div>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981" }}>
                {stats.highestAtsScore > 0 ? `${stats.highestAtsScore}%` : "--"}
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>Highest ATS Score</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Top keyword match rating</div>
            </div>
          </motion.div>

          {/* Card 4: Projects Added */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="card glass-panel"
            style={{ padding: "1.35rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderLeft: "4px solid #6366f1" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.12)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Code size={22} />
              </div>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>{stats.projectsAdded}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>Projects Added</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Academic & personal work</div>
            </div>
          </motion.div>

          {/* Card 5: Resume Downloads */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="card glass-panel"
            style={{ padding: "1.35rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderLeft: "4px solid #f59e0b" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Download size={22} />
              </div>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>{stats.resumeDownloads}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>Resume Downloads</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Exported PDF documents</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── MEMBERSHIP PLANS & TOKEN TOP-UP SECTION ── */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
               Membership Plans & Token Purchase
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Choose your membership tier or top up AI tokens when you run low. (Initial signup: {pricingConfig.initialSignupCredits} credits • Daily login bonus: {pricingConfig.dailyBonusCredits} credits)
            </p>
          </div>
          {onOpenBuyCredits && (
            <button
              onClick={onOpenBuyCredits}
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)",
                color: "#ffffff",
                padding: "0.6rem 1.25rem",
                borderRadius: "var(--radius)",
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 14px rgba(217, 119, 6, 0.3)",
              }}
            >
               Buy Additional Tokens (₹{pricingConfig.pricePerCreditInr}/credit)
            </button>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          
          {/* Plan 1: Normal User */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="card glass-panel"
            style={{
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "16px",
              border: (profile.subscription === "normal" || profile.subscription === "free" || !profile.subscription) ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: (profile.subscription === "normal" || profile.subscription === "free" || !profile.subscription) ? "rgba(217, 119, 6, 0.04)" : "#ffffff",
              position: "relative"
            }}
          >
            {(profile.subscription === "normal" || profile.subscription === "free" || !profile.subscription) && (
              <span style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(217, 119, 6, 0.15)", color: "var(--accent)", fontSize: "0.72rem", fontWeight: 800, padding: "0.2rem 0.6rem", borderRadius: "12px" }}>
                Current Active Plan
              </span>
            )}
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.25rem" }}>Normal User</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Default tier for job seekers</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "1.25rem" }}>
                ₹{pricingConfig.normalPlanPrice} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>/ forever</span>
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", color: "var(--text-main)", paddingLeft: 0, listStyle: "none", marginBottom: "1.5rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> {pricingConfig.initialSignupCredits} Free Welcome Signup Credits</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> +{pricingConfig.dailyBonusCredits} Free Daily Login Credits</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> AI Resume Building & ATS Scans</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> Token Top-up whenever needed</li>
              </ul>
            </div>
            <button
              onClick={() => handlePlanUpgrade("normal")}
              disabled={upgradingPlan || profile.subscription === "normal" || profile.subscription === "free" || !profile.subscription}
              className="btn-secondary"
              style={{ width: "100%", justifyContent: "center", fontWeight: 700 }}
            >
              {(profile.subscription === "normal" || profile.subscription === "free" || !profile.subscription) ? "Active Plan" : "Switch to Normal Plan"}
            </button>
          </motion.div>

          {/* Plan 2: Pro User */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="card glass-panel"
            style={{
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "16px",
              border: profile.subscription === "pro" ? "2px solid #047857" : "2px solid rgba(16, 185, 129, 0.4)",
              background: profile.subscription === "pro" ? "rgba(16, 185, 129, 0.05)" : "#ffffff",
              position: "relative"
            }}
          >
            <span style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #10b981, #059669)", color: "#ffffff", fontSize: "0.72rem", fontWeight: 800, padding: "0.25rem 0.8rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}>
               POPULAR PRO TIER
            </span>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.25rem", marginTop: "0.5rem" }}>Pro User</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>For active job applicants</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#047857", marginBottom: "1.25rem" }}>
                ₹{pricingConfig.proPlanPrice} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>/ month</span>
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", color: "var(--text-main)", paddingLeft: 0, listStyle: "none", marginBottom: "1.5rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#047857" /> <strong>+100 Instant Bonus Credits</strong></li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#047857" /> All Normal Plan features included</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#047857" /> Priority ATS AI Keyword Matching</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#047857" /> Premium Resume PDF Templates</li>
              </ul>
            </div>
            <button
              onClick={() => onOpenBuyCredits ? onOpenBuyCredits("pro") : handlePlanUpgrade("pro")}
              disabled={upgradingPlan || profile.subscription === "pro"}
              style={{
                width: "100%",
                justifyContent: "center",
                fontWeight: 800,
                background: profile.subscription === "pro" ? "rgba(16, 185, 129, 0.2)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: profile.subscription === "pro" ? "#047857" : "#ffffff",
                border: "none",
                padding: "0.75rem",
                borderRadius: "var(--radius)",
                cursor: profile.subscription === "pro" ? "default" : "pointer"
              }}
            >
              {profile.subscription === "pro" ? "Active Pro User" : `Become Pro User (₹${pricingConfig.proPlanPrice})`}
            </button>
          </motion.div>

          {/* Plan 3: Enterprise User */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="card glass-panel"
            style={{
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "16px",
              border: profile.subscription === "enterprise" ? "2px solid #4f46e5" : "1px solid var(--border)",
              background: profile.subscription === "enterprise" ? "rgba(79, 70, 229, 0.05)" : "#ffffff",
              position: "relative"
            }}
          >
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.25rem" }}>Enterprise User</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Maximum power & team features</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#4f46e5", marginBottom: "1.25rem" }}>
                ₹{pricingConfig.enterprisePlanPrice} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>/ month</span>
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", color: "var(--text-main)", paddingLeft: 0, listStyle: "none", marginBottom: "1.5rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#4f46e5" /> <strong>+500 Instant Bonus Credits</strong></li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#4f46e5" /> All Pro & Normal Plan features</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#4f46e5" /> Unlimited ATS Audits & Generations</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#4f46e5" /> 24/7 Priority Support & Admin Access</li>
              </ul>
            </div>
            <button
              onClick={() => onOpenBuyCredits ? onOpenBuyCredits("enterprise") : handlePlanUpgrade("enterprise")}
              disabled={upgradingPlan || profile.subscription === "enterprise"}
              style={{
                width: "100%",
                justifyContent: "center",
                fontWeight: 800,
                background: profile.subscription === "enterprise" ? "rgba(79, 70, 229, 0.2)" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                color: profile.subscription === "enterprise" ? "#4f46e5" : "#ffffff",
                border: "none",
                padding: "0.75rem",
                borderRadius: "var(--radius)",
                cursor: profile.subscription === "enterprise" ? "default" : "pointer"
              }}
            >
              {profile.subscription === "enterprise" ? "Active Enterprise User" : `Become Enterprise User (₹${pricingConfig.enterprisePlanPrice})`}
            </button>
          </motion.div>

        </div>
      </div>

      {/* ── GRID: AI PERSONALIZATION + PRIVACY & DATA CONTROL ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.75rem", marginBottom: "2.5rem" }}>
        {/* ── 3. AI PERSONALIZATION CARD ── */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="card glass-panel"
          style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(217, 119, 6, 0.15)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={20} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)" }}>
                  AI Personalization
                </h3>
              </div>
              <span style={{ background: "rgba(217, 119, 6, 0.1)", color: "var(--accent)", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "12px", marginLeft: "auto" }}>
                Free AI Smart Feature
              </span>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "1.25rem" }}>
              "Save your profile information so AI can create more personalized resumes, provide better ATS feedback, recommend relevant skills, and give career suggestions based on your goals."
            </p>

            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.75rem" }}>
                Key Benefits for Students & Job Seekers:
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}></span>
                  <span><strong>Faster resume creation</strong> — auto-fills student details</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}></span>
                  <span><strong>Better AI recommendations</strong> — tailored skill suggestions</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}></span>
                  <span><strong>Personalized resume summaries</strong> — targeted objective statements</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}></span>
                  <span><strong>Improved ATS optimization</strong> — targeted keyword matching</span>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}></span>
                  <span><strong>No need to enter the same information repeatedly</strong></span>
                </li>
              </ul>
            </div>
          </div>

          {/* Toggle Switch */}
          <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>Allow AI Personalization</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", maxWidth: "260px" }}>
                AI uses only the information you choose to save to improve your resume experience.
              </div>
            </div>

            <button
              onClick={handleToggleAIPersonalization}
              style={{
                width: "52px",
                height: "28px",
                borderRadius: "15px",
                background: profile.aiPersonalization ? "var(--accent)" : "var(--border)",
                border: "none",
                padding: "3px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "background 0.3s",
                boxShadow: "none",
              }}
            >
              <motion.div
                animate={{ x: profile.aiPersonalization ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </div>
        </motion.div>

        {/* ── 4. PRIVACY AND DATA CONTROL CARD ── */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="card glass-panel"
          style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)" }}>
                Privacy & Data
              </h3>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "1.25rem" }}>
              "Your information belongs to you. We save your details only to help create resumes, improve AI suggestions, and manage your account. You can update, export, or permanently delete your information anytime."
            </p>

            {/* Trust Badges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "var(--bg-color)", padding: "0.75rem", borderRadius: "var(--radius)", textAlign: "center", border: "1px solid var(--border)" }}>
                <ShieldCheck size={20} style={{ color: "#10b981", margin: "0 auto 0.3rem" }} />
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)" }}>Encrypted</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Data Security</div>
              </div>
              <div style={{ background: "var(--bg-color)", padding: "0.75rem", borderRadius: "var(--radius)", textAlign: "center", border: "1px solid var(--border)" }}>
                <Lock size={20} style={{ color: "var(--accent)", margin: "0 auto 0.3rem" }} />
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)" }}>Private</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Never Sold</div>
              </div>
              <div style={{ background: "var(--bg-color)", padding: "0.75rem", borderRadius: "var(--radius)", textAlign: "center", border: "1px solid var(--border)" }}>
                <UserCheck size={20} style={{ color: "var(--primary)", margin: "0 auto 0.3rem" }} />
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)" }}>100% Free</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Student First</div>
              </div>
            </div>
          </div>

          {/* Privacy Action Buttons */}
          <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <button
                className="secondary"
                onClick={() => setShowEditModal(true)}
                style={{ fontSize: "0.85rem", padding: "0.55rem 0.85rem", borderRadius: "8px" }}
              >
                <Edit3 size={14} /> Edit Info
              </button>
              <button
                className="secondary"
                onClick={handleExportData}
                style={{ fontSize: "0.85rem", padding: "0.55rem 0.85rem", borderRadius: "8px" }}
              >
                <FileDown size={14} /> Export My Data
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <button
                className="secondary"
                onClick={() => setShowPrivacyModal(true)}
                style={{ fontSize: "0.85rem", padding: "0.55rem 0.85rem", borderRadius: "8px" }}
              >
                <Eye size={14} /> Privacy Policy
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  fontSize: "0.85rem",
                  padding: "0.55rem 0.85rem",
                  borderRadius: "8px",
                  background: "rgba(225, 29, 72, 0.1)",
                  color: "var(--danger)",
                  border: "1px solid rgba(225, 29, 72, 0.2)",
                  boxShadow: "none",
                }}
              >
                <Trash2 size={14} /> Delete My Data
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 5. SAVED RESUMES SECTION ── */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
               Saved Resumes ({savedResumes.length})
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Manage your created resumes, analyze ATS scores, or download ready PDFs.
            </p>
          </div>

          <button
            onClick={() => navigate("builder")}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "var(--radius)",
              fontSize: "0.875rem",
              fontWeight: 700,
              background: "var(--accent)",
              color: "#ffffff",
            }}
          >
            <Plus size={16} /> Create New Resume
          </button>
        </div>

        {/* Saved Resumes List or Empty State */}
        {savedResumes.length === 0 ? (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card glass-panel"
            style={{
              padding: "3.5rem 2rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.25rem",
              border: "2px dashed var(--border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(217, 119, 6, 0.12)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={36} />
            </div>

            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                You haven't created a resume yet.
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "440px", margin: "0 auto" }}>
                Build your first professional ATS-optimized resume in under 2 minutes with our free smart builder.
              </p>
            </div>

            <button
              onClick={() => navigate("builder")}
              style={{
                padding: "0.75rem 1.75rem",
                borderRadius: "var(--radius)",
                fontSize: "0.95rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
                boxShadow: "0 6px 20px var(--primary-glow)",
              }}
            >
               Create Your First Resume
            </button>
          </motion.div>
        ) : (
          /* RESUME CARDS GRID */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {savedResumes.map((resume, idx) => (
              <motion.div
                key={resume._id || idx}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="card glass-panel"
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: "var(--radius-lg)",
                  position: "relative",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.2rem" }}>
                        {resume.userName || "Untitled Resume"}
                      </h4>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Template: <strong style={{ color: "var(--accent)" }}>Modern ATS Classic</strong>
                      </span>
                    </div>

                    <span
                      style={{
                        background: "rgba(16, 185, 129, 0.12)",
                        color: "#059669",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        padding: "0.25rem 0.6rem",
                        borderRadius: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Award size={13} /> 88% ATS
                    </span>
                  </div>

                  {resume.isFlagged && (
                    <div style={{
                      background: "#fff1f2",
                      color: "#e11d48",
                      border: "1px solid #fecdd3",
                      borderRadius: "8px",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      marginBottom: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}>
                      <span></span>
                      <span><strong>Flagged by Admin:</strong> {resume.flagReason || "Requires administrative review"}</span>
                    </div>
                  )}

                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "1rem", lineHeight: "1.5" }}>
                    {resume.summary || "Professional student resume with education, skills, and project experience."}
                  </p>

                  <div style={{ fontSize: "0.78rem", color: "var(--text-light)", marginBottom: "1.25rem" }}>
                    Last updated: {formatDate(resume.updatedAt || resume.createdAt)}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="profile-actions-bar">
                  <button
                    className="secondary profile-action-btn"
                    onClick={() => handleEditInBuilder(resume)}
                    title="Edit in Builder"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    className="secondary profile-action-btn"
                    onClick={() => navigate("analyzer")}
                    title="Run AI Analysis"
                  >
                    <Search size={13} /> Analyze
                  </button>
                  <button
                    className="secondary profile-action-btn"
                    onClick={() => handleEditInBuilder(resume)}
                    title="Download PDF"
                  >
                    <Download size={13} /> PDF
                  </button>
                  <button
                    className="secondary profile-icon-btn"
                    onClick={() => handleDuplicateResume(resume)}
                    title="Duplicate Resume"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    className="profile-icon-btn"
                    onClick={() => handleDeleteResume(resume._id)}
                    title="Delete Resume"
                    style={{
                      background: "rgba(225, 29, 72, 0.1)",
                      color: "var(--danger)",
                      border: "none",
                      boxShadow: "none",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── GRID: RECENT ACTIVITY TIMELINE & ACCOUNT SETTINGS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.75rem" }}>
        {/* ── 6. RECENT ACTIVITY TIMELINE ── */}
        <div className="card glass-panel" style={{ padding: "1.75rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
             Recent Activity
          </h3>

          {recentActivity.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0", fontSize: "0.9rem" }}>
              No recent activity recorded yet.
            </div>
          ) : (
            <div className="activity-timeline" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "relative" }}>
              {recentActivity.slice(0, 6).map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--primary-light)",
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    {item.action?.includes("Created") ? (
                      <Plus size={15} />
                    ) : item.action?.includes("Analyzed") ? (
                      <Search size={15} />
                    ) : item.action?.includes("Downloaded") ? (
                      <Download size={15} />
                    ) : (
                      <Sparkles size={15} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                        {item.action}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 7. ACCOUNT SETTINGS TABS ── */}
        <div className="card glass-panel" style={{ padding: "1.75rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
             Account Settings
          </h3>

          {/* Settings Tabs Bar */}
          <div style={{ display: "flex", gap: "0.4rem", background: "var(--bg-color)", padding: "4px", borderRadius: "10px", marginBottom: "1.25rem", border: "1px solid var(--border)" }}>
            <button
              onClick={() => setActiveSettingsTab("general")}
              className={`nav-link ${activeSettingsTab === "general" ? "active" : ""}`}
              style={{ flex: 1, padding: "0.4rem", fontSize: "0.82rem", textAlign: "center", justifyContent: "center" }}
            >
              General
            </button>
            <button
              onClick={() => setActiveSettingsTab("security")}
              className={`nav-link ${activeSettingsTab === "security" ? "active" : ""}`}
              style={{ flex: 1, padding: "0.4rem", fontSize: "0.82rem", textAlign: "center", justifyContent: "center" }}
            >
              Security
            </button>
            <button
              onClick={() => setActiveSettingsTab("notifications")}
              className={`nav-link ${activeSettingsTab === "notifications" ? "active" : ""}`}
              style={{ flex: 1, padding: "0.4rem", fontSize: "0.82rem", textAlign: "center", justifyContent: "center" }}
            >
              Alerts
            </button>
          </div>

          {/* Tab 1: General */}
          {activeSettingsTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>Edit Student Info</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Update name, headline & college</div>
                </div>
                <button className="secondary" onClick={() => setShowEditModal(true)} style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}>
                  Edit Profile
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>Theme & Visuals</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Warm Eye-Friendly Sand (Active)</div>
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)" }}>Warm Mode</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>Language</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>English (US)</div>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Default</span>
              </div>
            </div>
          )}

          {/* Tab 2: Security */}
          {activeSettingsTab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>Change Password</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Update your account login password</div>
                </div>
                <button className="secondary" onClick={() => setShowPasswordModal(true)} style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}>
                  Update
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>Download Copy of Data</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Export JSON backup file</div>
                </div>
                <button className="secondary" onClick={handleExportData} style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}>
                  Export JSON
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--danger)" }}>Delete Account</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Permanently remove account & resumes</div>
                </div>
                <button onClick={() => setShowDeleteModal(true)} style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem", background: "rgba(225, 29, 72, 0.1)", color: "var(--danger)", border: "none" }}>
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Notifications */}
          {activeSettingsTab === "notifications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-main)" }}>Email Notifications</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Receive resume audit alerts</div>
                </div>
                <input
                  type="checkbox"
                  checked={!!profile.notificationPreferences?.emailAlerts}
                  onChange={() => handleToggleNotification("emailAlerts")}
                  style={{ width: "18px", height: "18px", accentColor: "var(--accent)" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-main)" }}>Resume Improvement Tips</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Weekly ATS optimization advice</div>
                </div>
                <input
                  type="checkbox"
                  checked={!!profile.notificationPreferences?.resumeTips}
                  onChange={() => handleToggleNotification("resumeTips")}
                  style={{ width: "18px", height: "18px", accentColor: "var(--accent)" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL 1: EDIT PROFILE ── */}
      <AnimatePresence>
        {showEditModal && (
          <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card"
              style={{ width: "100%", maxWidth: "520px", padding: "2rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Edit Student Profile</h3>
                <button onClick={() => setShowEditModal(false)} style={{ background: "none", color: "var(--text-muted)", padding: 0, boxShadow: "none" }}></button>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Professional Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science Undergraduate | Aspiring Software Engineer"
                    value={editForm.headline}
                    onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>College / University</label>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University"
                    value={editForm.university}
                    onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://linkedin.com/in/yourname"
                    value={editForm.linkedin}
                    onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://github.com/yourusername"
                    value={editForm.github}
                    onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Avatar Photo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={editForm.avatar}
                    onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button type="button" className="secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: CHANGE AVATAR ── */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card"
              style={{ width: "100%", maxWidth: "480px", padding: "2rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Choose Profile Picture</h3>
                <button onClick={() => setShowAvatarModal(false)} style={{ background: "none", color: "var(--text-muted)", padding: 0, boxShadow: "none" }}></button>
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                Select a avatar or enter an image URL:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {presetAvatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Preset Avatar"
                    onClick={() => {
                      setEditForm({ ...editForm, avatar: url });
                      setProfile({ ...profile, avatar: url });
                      updateUserProfile({ avatar: url });
                      setShowAvatarModal(false);
                      showToast("Avatar updated!");
                    }}
                    style={{
                      width: "100%",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      cursor: "pointer",
                      border: editForm.avatar === url ? "3px solid var(--accent)" : "2px solid transparent",
                    }}
                  />
                ))}
              </div>

              <button className="secondary" style={{ width: "100%" }} onClick={() => { setShowAvatarModal(false); setShowEditModal(true); }}>
                Custom URL Upload →
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: CHANGE PASSWORD ── */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card"
              style={{ width: "100%", maxWidth: "440px", padding: "2rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} style={{ background: "none", color: "var(--text-muted)", padding: 0, boxShadow: "none" }}></button>
              </div>

              {passwordError && (
                <div style={{ background: "rgba(225, 29, 72, 0.1)", color: "var(--danger)", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group" style={{ position: "relative" }}>
                  <label>Current Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{ paddingRight: "2.5rem" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    style={{ position: "absolute", right: "10px", top: "35px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  >
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="form-group" style={{ position: "relative" }}>
                  <label>New Password (min 6 characters)</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={{ paddingRight: "2.5rem" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    style={{ position: "absolute", right: "10px", top: "35px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  >
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="form-group" style={{ position: "relative" }}>
                  <label>Confirm New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={{ paddingRight: "2.5rem" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    style={{ position: "absolute", right: "10px", top: "35px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  >
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button type="button" className="secondary" onClick={() => setShowPasswordModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: PRIVACY POLICY ── */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card"
              style={{ width: "100%", maxWidth: "560px", padding: "2rem", maxHeight: "80vh", overflowY: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Privacy & Student Data Commitment</h3>
                <button onClick={() => setShowPrivacyModal(false)} style={{ background: "none", color: "var(--text-muted)", padding: 0, boxShadow: "none" }}></button>
              </div>

              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.65", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p>
                  <strong>100% Free & Student First:</strong> We believe that landing your dream internship or full-time position shouldn't cost money. ResumeAI is completely free.
                </p>
                <p>
                  <strong>Data Ownership:</strong> You maintain full ownership over your resumes and profile information. We do not sell your personal details, resumes, or emails to third parties or recruiters without your explicit consent.
                </p>
                <p>
                  <strong>AI Usage:</strong> Information you input into the Resume Builder and AI Analyzer is used solely to generate feedback, compute ATS compatibility scores, and suggest relevant job bullet points.
                </p>
                <p>
                  <strong>Data Control:</strong> You can export all your data as a JSON file or permanently delete your account and all associated resumes at any time.
                </p>
              </div>

              <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
                <button onClick={() => setShowPrivacyModal(false)}>Got It</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: DELETE ACCOUNT ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card"
              style={{ width: "100%", maxWidth: "460px", padding: "2rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--danger)" }}>Delete Account</h3>
                <button onClick={() => setShowDeleteModal(false)} style={{ background: "none", color: "var(--text-muted)", padding: 0, boxShadow: "none" }}></button>
              </div>

              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.25rem", lineHeight: "1.5" }}>
                This action is permanent. All your saved resumes, profile information, and activity history will be deleted immediately.
              </p>

              <div className="form-group">
                <label style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                  Type <strong>DELETE MY ACCOUNT</strong> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE MY ACCOUNT"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button type="button" className="secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccountSubmit}
                  disabled={saving || deleteConfirmText.toLowerCase() !== "delete my account"}
                  style={{ background: "var(--danger)", color: "#ffffff" }}
                >
                  {saving ? "Deleting..." : "Permanently Delete Account"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
