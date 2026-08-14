import React, { useState } from "react";
import {
  Users,
  Search,
  Shield,
  Trash2,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Eye,
  Key,
  LogOut,
  RotateCcw,
  Download,
  X,
  Filter,
  CheckSquare,
  Ban,
} from "lucide-react";
import axios from "axios";

export default function UsersView({ users, setUsers, searchFilter, setSearchFilter, token }) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [drawerUser, setDrawerUser] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState(null);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;

    setLoadingId(user._id);
    try {
      const res = await axios.put(
        `/api/admin/users/${user._id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setUsers(users.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
        setMessage({ type: "success", text: `User ${user.name} role updated to ${newRole}.` });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to update role." });
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "suspended" ? "active" : "suspended";
    setLoadingId(user._id);
    try {
      const res = await axios.put(
        `/api/admin/users/${user._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setUsers(users.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u)));
        if (drawerUser?._id === user._id) setDrawerUser({ ...drawerUser, status: newStatus });
        setMessage({ type: "success", text: `Account status for ${user.name} set to ${newStatus}.` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update user status." });
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleSubscriptionChange = async (user, newSub) => {
    setLoadingId(user._id);
    try {
      const res = await axios.put(
        `/api/admin/users/${user._id}`,
        { subscription: newSub },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setUsers(users.map((u) => (u._id === user._id ? { ...u, subscription: newSub } : u)));
        if (drawerUser?._id === user._id) setDrawerUser({ ...drawerUser, subscription: newSub });
        setMessage({ type: "success", text: `Subscription for ${user.name} updated to ${newSub.toUpperCase()}.` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update subscription." });
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleResetCredits = async (user) => {
    setLoadingId(user._id);
    try {
      const res = await axios.put(
        `/api/admin/users/${user._id}`,
        { aiCredits: 100 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setUsers(users.map((u) => (u._id === user._id ? { ...u, aiCredits: 100 } : u)));
        if (drawerUser?._id === user._id) setDrawerUser({ ...drawerUser, aiCredits: 100 });
        setMessage({ type: "success", text: `AI Credits reset to 100 for ${user.name}.` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to reset credits." });
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleGiveCustomCredits = async (user, amountToAdd) => {
    let amount = amountToAdd;
    if (!amount) {
      const input = window.prompt(`Enter number of AI credits to give to ${user.name}:`, "50");
      if (!input || isNaN(input) || parseInt(input) <= 0) return;
      amount = parseInt(input);
    }
    setLoadingId(user._id);
    try {
      const res = await axios.put(
        `/api/admin/users/${user._id}`,
        { addCredits: amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        const updatedCredits = (user.aiCredits || 0) + amount;
        setUsers(users.map((u) => (u._id === user._id ? { ...u, aiCredits: updatedCredits } : u)));
        if (drawerUser?._id === user._id) setDrawerUser({ ...drawerUser, aiCredits: updatedCredits });
        setMessage({ type: "success", text: `Granted +${amount} AI Credits to ${user.name}. New Balance: ${updatedCredits}` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to grant credits." });
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleImpersonate = async (user) => {
    if (!window.confirm(`Initiate Admin Impersonation Session as ${user.name} (${user.email})?`)) return;
    try {
      const res = await axios.post(
        `/api/admin/users/${user._id}/impersonate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success && res.data.token) {
        alert(`Impersonation Token Generated for ${user.name}:\n\nToken: ${res.data.token.slice(0, 30)}...`);
      }
    } catch (err) {
      alert("Impersonation failed.");
    }
  };

  const handleForceLogout = async (user) => {
    try {
      await axios.post(
        `/api/admin/users/${user._id}/force-logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: "success", text: `Revoked sessions for ${user.name}.` });
    } catch (err) {
      setMessage({ type: "error", text: "Force logout failed." });
    }
  };

  const handleExportUser = async (user) => {
    try {
      const res = await axios.get(`/api/admin/users/${user._id}/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const anchor = document.createElement("a");
      anchor.setAttribute("href", dataStr);
      anchor.setAttribute("download", `user-${user.email}-${Date.now()}.json`);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (err) {
      alert("Failed to export user dataset.");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name} (${user.email})? This action cannot be undone.`)) return;

    setLoadingId(user._id);
    try {
      const res = await axios.delete(`/api/admin/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setUsers(users.filter((u) => u._id !== user._id));
        if (drawerUser?._id === user._id) setDrawerUser(null);
        setMessage({ type: "success", text: `User ${user.name} deleted.` });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to delete user." });
    } finally {
      setLoadingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map((u) => u._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((item) => item !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`Apply bulk action '${action.toUpperCase()}' to ${selectedUserIds.length} users?`)) return;

    try {
      const res = await axios.post(
        "/api/admin/users/bulk",
        { action, userIds: selectedUserIds, creditsValue: 100 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setMessage({ type: "success", text: res.data.message });
        setSelectedUserIds([]);
        // Local state updates
        if (action === "suspend") {
          setUsers(users.map((u) => (selectedUserIds.includes(u._id) ? { ...u, status: "suspended" } : u)));
        } else if (action === "unsuspend") {
          setUsers(users.map((u) => (selectedUserIds.includes(u._id) ? { ...u, status: "active" } : u)));
        } else if (action === "reset_credits") {
          setUsers(users.map((u) => (selectedUserIds.includes(u._id) ? { ...u, aiCredits: 100 } : u)));
        } else if (action === "delete") {
          setUsers(users.filter((u) => !selectedUserIds.includes(u._id)));
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: "Bulk action failed." });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchFilter.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || (user.status || "active") === statusFilter;
    const matchesSub = subFilter === "all" || (user.subscription || "free") === subFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesSub;
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>User Management & Accounts</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Total Users: {users.length} • Active: {users.filter((u) => u.status !== "suspended").length} • Suspended: {users.filter((u) => u.status === "suspended").length}
          </p>
        </div>

        {/* Filter Selects */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
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
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
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
            <option value="all">All Subscriptions</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedUserIds.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(217, 119, 6, 0.12)",
            border: "1px solid rgba(217, 119, 6, 0.3)",
          }}
        >
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
            {selectedUserIds.length} users selected for bulk action
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => handleBulkAction("suspend")} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem", color: "#be123c" }}>
              <Ban size={14} /> Suspend Selected
            </button>
            <button onClick={() => handleBulkAction("unsuspend")} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem", color: "#047857" }}>
              <CheckCircle size={14} /> Unsuspend
            </button>
            <button onClick={() => handleBulkAction("reset_credits")} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem" }}>
              <RotateCcw size={14} /> Reset Credits
            </button>
            <button onClick={() => handleBulkAction("delete")} style={{ background: "rgba(225,29,72,0.12)", border: "1px solid rgba(225,29,72,0.3)", color: "#be123c", borderRadius: "8px", padding: "6px 12px", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {message && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "10px",
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: message.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(225, 29, 72, 0.12)",
            border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(225, 29, 72, 0.3)"}`,
            color: message.type === "success" ? "#047857" : "#be123c",
          }}
        >
          {message.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {message.text}
        </div>
      )}

      {/* Users Table */}
      <div className="glass-panel" style={{ padding: "8px" }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                  />
                </th>
                <th>User Profile</th>
                <th>Role</th>
                <th>Subscription</th>
                <th>Status</th>
                <th>AI Credits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user._id);
                  return (
                    <tr key={user._id} style={{ background: isSelected ? "rgba(217, 119, 6, 0.08)" : "transparent" }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(user._id)}
                        />
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ position: "relative" }}>
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #2e2520, #d97706)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ffffff",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                              }}
                            >
                              {user.name ? user.name[0].toUpperCase() : "U"}
                            </div>
                            <span
                              title={
                                user.isOnline || (user.lastActiveAt && Date.now() - new Date(user.lastActiveAt).getTime() < 5 * 60 * 1000)
                                  ? "User is Online"
                                  : "User is Offline"
                              }
                              style={{
                                position: "absolute",
                                bottom: "0",
                                right: "0",
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background:
                                  user.isOnline || (user.lastActiveAt && Date.now() - new Date(user.lastActiveAt).getTime() < 5 * 60 * 1000)
                                    ? "#10b981"
                                    : "#9ca3af",
                                border: "2px solid #ffffff",
                                boxShadow:
                                  user.isOnline || (user.lastActiveAt && Date.now() - new Date(user.lastActiveAt).getTime() < 5 * 60 * 1000)
                                    ? "0 0 8px #10b981"
                                    : "none",
                              }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                              {user.name}
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  padding: "1px 6px",
                                  borderRadius: "10px",
                                  background:
                                    user.isOnline || (user.lastActiveAt && Date.now() - new Date(user.lastActiveAt).getTime() < 5 * 60 * 1000)
                                      ? "rgba(16, 185, 129, 0.15)"
                                      : "rgba(156, 163, 175, 0.15)",
                                  color:
                                    user.isOnline || (user.lastActiveAt && Date.now() - new Date(user.lastActiveAt).getTime() < 5 * 60 * 1000)
                                      ? "#047857"
                                      : "#6b7280",
                                }}
                              >
                                {user.isOnline || (user.lastActiveAt && Date.now() - new Date(user.lastActiveAt).getTime() < 5 * 60 * 1000)
                                  ? " Online"
                                  : " Offline"}
                              </span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${user.role === "admin" ? "badge-indigo" : "badge-emerald"}`}>
                          {user.role === "admin" ? <Shield size={12} /> : null} {user.role || "user"}
                        </span>
                      </td>

                      <td>
                        <select
                          value={user.subscription || "normal"}
                          onChange={(e) => handleSubscriptionChange(user, e.target.value)}
                          style={{
                            background: user.subscription === "enterprise" ? "rgba(79, 70, 229, 0.15)" : user.subscription === "pro" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                            color: user.subscription === "enterprise" ? "#4f46e5" : user.subscription === "pro" ? "#047857" : "#b45309",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            outline: "none"
                          }}
                        >
                          <option value="normal">Normal</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>

                      <td>
                        <span className={`badge ${user.status === "suspended" ? "badge-rose" : "badge-emerald"}`}>
                          {user.status || "active"}
                        </span>
                      </td>

                      <td style={{ fontWeight: 700, color: "var(--text-main)" }}>
                        {user.aiCredits !== undefined ? user.aiCredits : 50}
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setDrawerUser(user)}
                            className="btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                            title="View Full Profile Drawer"
                          >
                            <Eye size={14} /> Profile
                          </button>

                          <button
                            onClick={() => handleGiveCustomCredits(user)}
                            className="btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.75rem", background: "rgba(217, 119, 6, 0.12)", color: "var(--accent)", border: "1px solid rgba(217, 119, 6, 0.3)" }}
                            title="Give AI Credits to this user"
                          >
                             +Credits
                          </button>

                          <button
                            onClick={() => handleRoleToggle(user)}
                            className="btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                            title={user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          >
                            <UserCheck size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            style={{
                              background: "rgba(225, 29, 72, 0.12)",
                              border: "1px solid rgba(225, 29, 72, 0.3)",
                              color: "#be123c",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                            title="Delete User Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
                    No user accounts match current search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Profile Side Drawer Modal */}
      {drawerUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(46, 37, 32, 0.45)",
            backdropFilter: "blur(8px)",
            zIndex: 999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setDrawerUser(null)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: "480px",
              height: "100vh",
              borderRadius: "0",
              borderLeft: "1px solid var(--border-color)",
              background: "#ffffff",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)" }}>User Profile Drawer</h2>
              <button onClick={() => setDrawerUser(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Profile Avatar & Metadata */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderRadius: "12px", background: "var(--surface-2)" }}>
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2e2520, #d97706)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "1.4rem",
                }}
              >
                {drawerUser.name ? drawerUser.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>{drawerUser.name}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{drawerUser.email}</p>
                <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                  <span className={`badge ${drawerUser.isOnline || (drawerUser.lastActiveAt && Date.now() - new Date(drawerUser.lastActiveAt).getTime() < 5 * 60 * 1000) ? "badge-emerald" : "badge-rose"}`}>
                    {drawerUser.isOnline || (drawerUser.lastActiveAt && Date.now() - new Date(drawerUser.lastActiveAt).getTime() < 5 * 60 * 1000) ? " Online" : " Offline"}
                  </span>
                  <span className={`badge ${drawerUser.role === "admin" ? "badge-indigo" : "badge-emerald"}`}>{drawerUser.role}</span>
                  <span className={`badge ${drawerUser.status === "suspended" ? "badge-rose" : "badge-emerald"}`}>{drawerUser.status || "active"}</span>
                  <span className="badge badge-amber">{drawerUser.subscription || "free"}</span>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h4 style={{ fontSize: "0.85rem", color: "#d97706", fontWeight: 700, textTransform: "uppercase" }}>Account Timestamps & Stats</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", borderRadius: "10px", background: "var(--surface-2)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>AI Credits Remaining</span>
                  <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>{drawerUser.aiCredits !== undefined ? drawerUser.aiCredits : 50}</p>
                </div>
                <div style={{ padding: "12px", borderRadius: "10px", background: "var(--surface-2)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Email Status</span>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: drawerUser.isVerified ? "#047857" : "#b45309" }}>
                    {drawerUser.isVerified ? "Verified" : "Unverified"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", borderRadius: "10px", background: "var(--surface-2)", fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}> Online Status:</span>
                  <span style={{ fontWeight: 700, color: drawerUser.isOnline || (drawerUser.lastActiveAt && Date.now() - new Date(drawerUser.lastActiveAt).getTime() < 5 * 60 * 1000) ? "#047857" : "#6b7280" }}>
                    {drawerUser.isOnline || (drawerUser.lastActiveAt && Date.now() - new Date(drawerUser.lastActiveAt).getTime() < 5 * 60 * 1000) ? " Currently Online" : " Offline"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}> Account Signed Up:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-main)" }}>
                    {drawerUser.createdAt ? new Date(drawerUser.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}> First Login:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-main)" }}>
                    {drawerUser.firstLogin || drawerUser.createdAt ? new Date(drawerUser.firstLogin || drawerUser.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}> Last Login / Active:</span>
                  <span style={{ fontWeight: 700, color: "#d97706" }}>
                    {drawerUser.lastActiveAt || drawerUser.lastLogin || drawerUser.createdAt ? new Date(drawerUser.lastActiveAt || drawerUser.lastLogin || drawerUser.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Management Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
              <h4 style={{ fontSize: "0.85rem", color: "#d97706", fontWeight: 700 }}>Administrative Controls</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button onClick={() => handleToggleStatus(drawerUser)} className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.8rem" }}>
                  <Ban size={15} /> {drawerUser.status === "suspended" ? "Unsuspend Account" : "Suspend Account"}
                </button>
                <button onClick={() => handleResetCredits(drawerUser)} className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.8rem" }}>
                  <RotateCcw size={15} /> Reset AI Credits
                </button>
                <button onClick={() => handleImpersonate(drawerUser)} className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.8rem" }}>
                  <Key size={15} /> Impersonate
                </button>
                <button onClick={() => handleForceLogout(drawerUser)} className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.8rem" }}>
                  <LogOut size={15} /> Force Logout
                </button>
              </div>

              <button onClick={() => handleExportUser(drawerUser)} className="glow-btn" style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}>
                <Download size={16} /> Export Full User JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
