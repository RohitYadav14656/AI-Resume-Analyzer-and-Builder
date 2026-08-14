import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, CreditCard, Clock, RefreshCw, AlertTriangle } from "lucide-react";

export default function PaymentsView({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this transaction?`)) return;
    setProcessingId(id);
    try {
      const { data } = await axios.post(`/api/admin/transactions/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        // Refresh the list locally to show updated status
        setTransactions((prev) =>
          prev.map((tx) =>
            tx._id === id ? { ...tx, status: data.transaction.status } : tx
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} transaction.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-view-loading">
        <RefreshCw className="spinner-icon" size={24} />
        <p>Loading Payments...</p>
      </div>
    );
  }

  const pendingTxs = transactions.filter(tx => tx.status === "pending");
  const historyTxs = transactions.filter(tx => tx.status !== "pending");

  return (
    <div className="admin-view-container animate-fade-in">
      <div className="admin-view-header">
        <div>
          <h2><CreditCard size={24} /> Payments & Transactions</h2>
          <p>Review and approve pending manual UTR payments.</p>
        </div>
        <button className="admin-btn secondary" onClick={fetchTransactions}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="admin-alert error">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Pending Transactions Section */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Clock size={20} color="#f59e0b" /> Pending Review ({pendingTxs.length})
        </h3>
        {pendingTxs.length === 0 ? (
          <p className="text-muted">No pending transactions.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>UTR / Ref</th>
                  <th>Amount</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTxs.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.createdAt).toLocaleString()}</td>
                    <td>
                      {tx.userId?.name || "Unknown"}
                      <br />
                      <small className="text-muted">{tx.userId?.email}</small>
                    </td>
                    <td><span className="admin-badge badge-warning">{tx.referenceId}</span></td>
                    <td>₹{tx.amount}</td>
                    <td>
                      {tx.planRequested 
                        ? <span className="admin-badge badge-pro">{tx.planRequested.toUpperCase()} Plan</span>
                        : <span className="admin-badge badge-info">{tx.creditsRequested} Credits</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="admin-btn primary"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: "#10b981", borderColor: "#10b981" }}
                          onClick={() => handleAction(tx._id, "approve")}
                          disabled={processingId === tx._id}
                        >
                          {processingId === tx._id ? <RefreshCw size={14} className="spinner-icon" /> : <Check size={14} />} Approve
                        </button>
                        <button
                          className="admin-btn secondary"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", color: "#ef4444", borderColor: "#ef4444" }}
                          onClick={() => handleAction(tx._id, "reject")}
                          disabled={processingId === tx._id}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      <div className="admin-card">
        <h3 style={{ marginBottom: "1rem" }}>Transaction History</h3>
        {historyTxs.length === 0 ? (
          <p className="text-muted">No history found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Ref ID</th>
                  <th>Amount</th>
                  <th>Requested</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {historyTxs.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td>{tx.userId?.email || "Unknown"}</td>
                    <td>{tx.type}</td>
                    <td>{tx.referenceId}</td>
                    <td>₹{tx.amount || 0}</td>
                    <td>
                      {tx.planRequested 
                        ? `${tx.planRequested.toUpperCase()} Plan`
                        : `${tx.creditsRequested || 0} Credits`
                      }
                    </td>
                    <td>
                      <span className={`admin-badge ${tx.status === "verified" ? "badge-active" : "badge-suspended"}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
