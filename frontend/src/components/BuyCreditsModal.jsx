import React, { useState, useEffect } from "react";
import api from "../api";

export default function BuyCreditsModal({
  isOpen,
  onClose,
  user,
  onCreditsPurchased,
  pricePerCreditInr = 2,
  initialMode = "credits",
  initialPlan = "pro",
  proPrice = 499,
  enterprisePrice = 1999
}) {
  const [checkoutMode, setCheckoutMode] = useState(initialMode); // "credits" | "plan"
  const [selectedPlan, setSelectedPlan] = useState(initialPlan); // "pro" | "enterprise"
  const [selectedPack, setSelectedPack] = useState(150); // Default 150 credits
  const [customCredits, setCustomCredits] = useState("");
  
  // Checkout Order & Verification state
  const [activeCheckoutOrder, setActiveCheckoutOrder] = useState(null);
  const [checkoutTab, setCheckoutTab] = useState("upi_qr"); // "upi_qr" | "card" | "netbanking" | "instant"
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Card Simulator state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  // NetBanking Simulator state
  const [selectedBank, setSelectedBank] = useState("hdfc");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCheckoutMode(initialMode || "credits");
      setSelectedPlan(initialPlan || "pro");
      setActiveCheckoutOrder(null);
      setError("");
      setSuccessMsg("");
      setUtrNumber("");
    }
  }, [isOpen, initialMode, initialPlan]);

  // Dynamically load Razorpay SDK
  useEffect(() => {
    if (!document.getElementById("razorpay-sdk")) {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const activeCredits = customCredits && parseInt(customCredits) > 0
    ? parseInt(customCredits)
    : selectedPack;

  const planAmount = selectedPlan === "pro" ? proPrice : enterprisePrice;
  const totalPriceInr = checkoutMode === "plan" ? planAmount : activeCredits * pricePerCreditInr;

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Authentication required. Please log in to your account to complete payment.");
      return;
    }

    if (checkoutMode === "credits" && (!activeCredits || activeCredits <= 0)) {
      setError("Please select or enter a valid credit amount.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      // 1. Create Payment Order
      const payload = checkoutMode === "plan"
        ? { plan: selectedPlan }
        : { creditsCount: activeCredits };

      const { data: orderData } = await api.post("/api/user/create-payment-order", payload);

      if (!orderData || !orderData.success) {
        throw new Error("Failed to create payment order.");
      }

      // 2. If Razorpay Key is configured and gateway is set to razorpay, open official Razorpay SDK
      if (orderData.paymentGateway === "razorpay" && orderData.hasLiveKeys && orderData.keyId && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaisa,
          currency: orderData.currency || "INR",
          name: "ResumeAI",
          description: orderData.description || (checkoutMode === "plan" ? `${selectedPlan.toUpperCase()} Plan Subscription` : `+${activeCredits} AI Credits Pack`),
          image: "https://cdn-icons-png.flaticon.com/512/9408/9408175.png",
          order_id: orderData.orderId?.startsWith("order_") ? undefined : orderData.orderId,
          handler: async function (response) {
            setLoading(true);
            try {
              const verifyPayload = checkoutMode === "plan"
                ? {
                    orderId: orderData.orderId,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                    plan: selectedPlan,
                  }
                : {
                    orderId: orderData.orderId,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                    creditsCount: activeCredits,
                  };

              const { data: verifyData } = await api.post("/api/user/verify-payment", verifyPayload);

              if (verifyData && verifyData.success) {
                const msg = checkoutMode === "plan"
                  ? ` Payment Verified! Upgraded to ${selectedPlan.toUpperCase()} Plan (₹${totalPriceInr})!`
                  : ` Payment Verified! +${activeCredits} AI Credits added to your account.`;

                setSuccessMsg(msg);
                if (onCreditsPurchased) {
                  onCreditsPurchased(verifyData.aiCredits, verifyData.subscription);
                }
                setTimeout(() => {
                  setSuccessMsg("");
                  onClose();
                }, 2000);
              }
            } catch (verifErr) {
              setError("Payment verification failed. Please contact support.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user.name || "",
            email: user.email || "",
          },
          theme: {
            color: "#d97706",
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setError(`Payment failed: ${response.error?.description || "Transaction cancelled"}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // Open FamPay / UPI QR Code & Payment Simulator Checkout Portal
        setActiveCheckoutOrder(orderData);
        setLoading(false);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Payment order failed. Please try again.";
      setError(errMsg);
      setLoading(false);
    }
  };

  const handleVerifyCheckout = async (customUtr = "") => {
    if (!activeCheckoutOrder) return;
    setVerifyingPayment(true);
    setError("");

    try {
      const finalUtr = customUtr || utrNumber;
      const verifyPayload = checkoutMode === "plan"
        ? { orderId: activeCheckoutOrder.orderId, plan: selectedPlan, utrNumber: finalUtr }
        : { orderId: activeCheckoutOrder.orderId, creditsCount: activeCredits, utrNumber: finalUtr };

      const { data: verifyData } = await api.post("/api/user/verify-payment", verifyPayload);

      if (verifyData && verifyData.success) {
        setSuccessMsg(verifyData.message || "Payment submitted successfully.");
        setActiveCheckoutOrder(null);

        if (!verifyData.pending && onCreditsPurchased) {
          onCreditsPurchased(verifyData.aiCredits, verifyData.subscription);
        }

        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 3000);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Verification failed.";
      setError(errMsg);
    } finally {
      setVerifyingPayment(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2200);
  };

  // Render QR Code image URL
  const qrCodeUrl = activeCheckoutOrder?.upiUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeCheckoutOrder.upiUri)}`
    : "";

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.72)",
      backdropFilter: "blur(7px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "22px",
        width: "100%",
        maxWidth: "620px",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: activeCheckoutOrder
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
            : "linear-gradient(135deg, #2e2520 0%, #1f1915 100%)",
          color: "#ffffff"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.3rem" }}>
              {activeCheckoutOrder ? "" : checkoutMode === "plan" ? "" : ""}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
                {activeCheckoutOrder
                  ? "FamPay & UPI Payment Portal"
                  : checkoutMode === "plan"
                  ? `Upgrade to ${selectedPlan.toUpperCase()} Plan (₹${totalPriceInr})`
                  : "Buy AI Credits & Tokens"}
              </h3>
              <span style={{ fontSize: "0.78rem", color: "#d1d5db" }}>
                Current Tier: <strong style={{ textTransform: "capitalize" }}>{user?.subscription || "Normal"}</strong> • Balance: <strong>{user?.aiCredits !== undefined ? user.aiCredits : 10} Credits</strong>
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (activeCheckoutOrder) {
                setActiveCheckoutOrder(null);
              } else {
                onClose();
              }
            }}
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "none",
              color: "#ffffff",
              fontSize: "1.1rem",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            
          </button>
        </div>

        {/* ACTIVE CHECKOUT SCREEN (FamPay QR Code & Payment Simulator) */}
        {activeCheckoutOrder ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto", padding: "1.5rem" }}>
            {error && (
              <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", color: "#991b1b", background: "#fef2f2", borderRadius: "10px", fontSize: "0.88rem", border: "1px solid #fecaca" }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", color: "#166534", background: "#f0fdf4", borderRadius: "10px", fontSize: "0.9rem", fontWeight: 700, border: "1px solid #bbf7d0" }}>
                {successMsg}
              </div>
            )}

            {/* Payment Method Selector Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", background: "var(--surface-2)", padding: "4px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <button
                type="button"
                onClick={() => setCheckoutTab("upi_qr")}
                style={{
                  flex: 1,
                  padding: "0.55rem 0.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background: checkoutTab === "upi_qr" ? "#ffffff" : "transparent",
                  color: checkoutTab === "upi_qr" ? "#047857" : "var(--text-muted)",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  boxShadow: checkoutTab === "upi_qr" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                }}
              >
                 FamPay & UPI QR
              </button>
              <button
                type="button"
                onClick={() => setCheckoutTab("card")}
                style={{
                  flex: 1,
                  padding: "0.55rem 0.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background: checkoutTab === "card" ? "#ffffff" : "transparent",
                  color: checkoutTab === "card" ? "#4f46e5" : "var(--text-muted)",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  boxShadow: checkoutTab === "card" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                }}
              >
                 Card Simulator
              </button>
              <button
                type="button"
                onClick={() => setCheckoutTab("netbanking")}
                style={{
                  flex: 1,
                  padding: "0.55rem 0.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background: checkoutTab === "netbanking" ? "#ffffff" : "transparent",
                  color: checkoutTab === "netbanking" ? "#b45309" : "var(--text-muted)",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  boxShadow: checkoutTab === "netbanking" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                }}
              >
                 NetBanking
              </button>
              <button
                type="button"
                onClick={() => setCheckoutTab("instant")}
                style={{
                  flex: 1,
                  padding: "0.55rem 0.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background: checkoutTab === "instant" ? "#ffffff" : "transparent",
                  color: checkoutTab === "instant" ? "#0284c7" : "var(--text-muted)",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  boxShadow: checkoutTab === "instant" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                }}
              >
                 1-Click Pay
              </button>
            </div>

            {/* TAB 1: FamPay & UPI QR Code */}
            {checkoutTab === "upi_qr" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                {/* Supported Apps Banner */}
                <div style={{
                  background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                  border: "1px solid #a7f3d0",
                  borderRadius: "12px",
                  padding: "0.6rem 1rem",
                  width: "100%",
                  marginBottom: "1rem",
                  fontSize: "0.8rem",
                  color: "#065f46",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap"
                }}>
                  <span style={{ background: "#059669", color: "white", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: 900 }}>
                    FamPay Compatible (@fam)
                  </span>
                  <span>Google Pay • PhonePe • Paytm • BHIM • Any UPI App</span>
                </div>

                {/* QR Display Card */}
                <div style={{
                  background: "#ffffff",
                  padding: "1.25rem",
                  borderRadius: "18px",
                  border: "2px solid #10b981",
                  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                  maxWidth: "310px",
                  width: "100%"
                }}>
                  <img
                    src={qrCodeUrl}
                    alt="FamPay UPI QR Code"
                    style={{
                      width: "210px",
                      height: "210px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0"
                    }}
                  />
                  <div style={{ marginTop: "0.85rem", width: "100%" }}>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Payee Name</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                      {activeCheckoutOrder.upiName || "FamPay / Resume AI"}
                    </div>
                  </div>

                  <div style={{
                    marginTop: "0.6rem",
                    background: "#f1f5f9",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                    justifyContent: "space-between"
                  }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>
                      {activeCheckoutOrder.upiId || "resumeai@fam"}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeCheckoutOrder.upiId || "resumeai@fam")}
                      style={{
                        background: copiedUpi ? "#10b981" : "#0284c7",
                        color: "#ffffff",
                        border: "none",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        cursor: "pointer"
                      }}
                    >
                      {copiedUpi ? "Copied!" : " Copy"}
                    </button>
                  </div>

                  <div style={{
                    marginTop: "0.75rem",
                    fontSize: "1.2rem",
                    fontWeight: 900,
                    color: "#059669"
                  }}>
                    Pay ₹{activeCheckoutOrder.amountInr} INR
                  </div>
                </div>

                {/* Mobile direct link */}
                <a
                  href={activeCheckoutOrder.upiUri}
                  style={{
                    display: "inline-block",
                    padding: "0.5rem 1.25rem",
                    background: "#ecfdf5",
                    color: "#047857",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    textDecoration: "none",
                    marginBottom: "1.25rem",
                    border: "1px solid #a7f3d0"
                  }}
                >
                   Click here to open FamPay / UPI App directly
                </a>

                {/* UTR Input & Action */}
                <div style={{ width: "100%", textAlign: "left", background: "var(--surface-2)", padding: "1.1rem", borderRadius: "14px", border: "1px solid var(--border)" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.4rem" }}>
                    Enter 12-Digit UTR / Transaction Reference No. (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 423871928371 or FamPay Ref ID..."
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      fontSize: "0.88rem",
                      marginBottom: "0.85rem",
                      outline: "none"
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => handleVerifyCheckout()}
                    disabled={verifyingPayment}
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: 800,
                      fontSize: "0.98rem",
                      cursor: verifyingPayment ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 15px rgba(5, 150, 105, 0.3)"
                    }}
                  >
                    {verifyingPayment ? "Verifying Payment..." : ` I Have Paid ₹${activeCheckoutOrder.amountInr} — Unlock Credits Now`}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Card Simulator */}
            {checkoutTab === "card" && (
              <div style={{ background: "var(--surface-2)", padding: "1.25rem", borderRadius: "14px", border: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "var(--primary)", fontWeight: 800 }}>
                   Debit / Credit Card Payment Simulator
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8892"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "0.88rem" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "0.88rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "0.88rem" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "0.88rem" }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyCheckout("000000000001")}
                  disabled={verifyingPayment}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "0.98rem",
                    cursor: verifyingPayment ? "not-allowed" : "pointer"
                  }}
                >
                  {verifyingPayment ? "Processing Card..." : `Pay ₹${activeCheckoutOrder.amountInr} via Card Simulator`}
                </button>
              </div>
            )}

            {/* TAB 3: NetBanking Simulator */}
            {checkoutTab === "netbanking" && (
              <div style={{ background: "var(--surface-2)", padding: "1.25rem", borderRadius: "14px", border: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "var(--primary)", fontWeight: 800 }}>
                   NetBanking Bank Authorization
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  {[
                    { id: "hdfc", name: "HDFC Bank" },
                    { id: "sbi", name: "State Bank of India" },
                    { id: "icici", name: "ICICI Bank" },
                    { id: "axis", name: "Axis Bank" }
                  ].map((bank) => (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      style={{
                        padding: "0.85rem",
                        borderRadius: "10px",
                        border: selectedBank === bank.id ? "2px solid #b45309" : "1px solid var(--border)",
                        background: selectedBank === bank.id ? "#fffbeb" : "#ffffff",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        textAlign: "center"
                      }}
                    >
                      {bank.name}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyCheckout("000000000002")}
                  disabled={verifyingPayment}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    background: "linear-gradient(135deg, #b45309 0%, #92400e 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "0.98rem",
                    cursor: verifyingPayment ? "not-allowed" : "pointer"
                  }}
                >
                  {verifyingPayment ? "Connecting to Bank..." : `Authorize & Pay ₹${activeCheckoutOrder.amountInr}`}
                </button>
              </div>
            )}

            {/* TAB 4: Instant One-Click Pay */}
            {checkoutTab === "instant" && (
              <div style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", padding: "1.5rem", borderRadius: "14px", border: "1px solid #bae6fd", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}></div>
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#0369a1", fontWeight: 800 }}>
                  Instant One-Click Unlock Mode
                </h4>
                <p style={{ fontSize: "0.82rem", color: "#0c4a6e", marginBottom: "1.25rem", lineHeight: "1.5" }}>
                  For testing and demonstration without typing card details or UTR codes. Instantly grants specified AI credits or subscription tier to your account.
                </p>
                <button
                  type="button"
                  onClick={() => handleVerifyCheckout("000000000003")}
                  disabled={verifyingPayment}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "1rem",
                    cursor: verifyingPayment ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(2, 132, 199, 0.3)"
                  }}
                >
                  {verifyingPayment ? "Granting Access..." : ` Instant Unlock (₹${activeCheckoutOrder.amountInr})`}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* REGULAR PLAN & CREDIT SELECTION SCREEN */
          <>
            {/* Mode Switcher Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <button
                onClick={() => setCheckoutMode("plan")}
                style={{
                  padding: "0.85rem",
                  background: checkoutMode === "plan" ? "#ffffff" : "transparent",
                  color: checkoutMode === "plan" ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  border: "none",
                  borderBottom: checkoutMode === "plan" ? "3px solid var(--accent)" : "none",
                  cursor: "pointer"
                }}
              >
                 Subscription Plans (Pro / Enterprise)
              </button>
              <button
                onClick={() => setCheckoutMode("credits")}
                style={{
                  padding: "0.85rem",
                  background: checkoutMode === "credits" ? "#ffffff" : "transparent",
                  color: checkoutMode === "credits" ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  border: "none",
                  borderBottom: checkoutMode === "credits" ? "3px solid var(--accent)" : "none",
                  cursor: "pointer"
                }}
              >
                 Token Credit Packs (Top-Up)
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
              {error && (
                <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", color: "var(--danger)", background: "#fff1f2", borderRadius: "8px", fontSize: "0.88rem" }}>
                  {error}
                </div>
              )}
              {successMsg && (
                <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", color: "#166534", background: "#f0fdf4", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 700 }}>
                  {successMsg}
                </div>
              )}

              {checkoutMode === "plan" ? (
                /*  Subscription Plan Selection */
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                    Select your preferred membership tier to activate instant privileges and bonus credits:
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {/* Pro Plan */}
                    <div
                      onClick={() => setSelectedPlan("pro")}
                      style={{
                        border: selectedPlan === "pro" ? "2px solid #047857" : "1px solid var(--border)",
                        background: selectedPlan === "pro" ? "rgba(16, 185, 129, 0.08)" : "var(--surface)",
                        borderRadius: "14px",
                        padding: "1.1rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#047857" }}>Pro Plan</span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, background: "#10b981", color: "white", padding: "0.15rem 0.5rem", borderRadius: "10px" }}>POPULAR</span>
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.5rem" }}>
                        ₹{proPrice} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 400 }}>/ mo</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                        • <strong>+100 Instant Bonus Credits</strong><br />
                        • Priority ATS Scans & Optimization<br />
                        • Premium PDF Resume Templates
                      </div>
                    </div>

                    {/* Enterprise Plan */}
                    <div
                      onClick={() => setSelectedPlan("enterprise")}
                      style={{
                        border: selectedPlan === "enterprise" ? "2px solid #4f46e5" : "1px solid var(--border)",
                        background: selectedPlan === "enterprise" ? "rgba(79, 70, 229, 0.08)" : "var(--surface)",
                        borderRadius: "14px",
                        padding: "1.1rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#4f46e5" }}>Enterprise</span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, background: "#6366f1", color: "white", padding: "0.15rem 0.5rem", borderRadius: "10px" }}>UNLIMITED</span>
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.5rem" }}>
                        ₹{enterprisePrice} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 400 }}>/ mo</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                        • <strong>+500 Instant Bonus Credits</strong><br />
                        • Unlimited ATS Audits & AI Generations<br />
                        • 24/7 Priority Dedicated Support
                      </div>
                    </div>
                  </div>

                  {/* Payment Options Banner */}
                  <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#065f46", marginBottom: "3px" }}>
                       Supports FamPay (@fam) & All Indian UPI Apps
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "#047857" }}>
                      Scan QR code via FamPay, Google Pay, PhonePe, Paytm, BHIM, or use card/bank simulator.
                    </div>
                  </div>
                </div>
              ) : (
                /*  Credit Packs Selection */
                <div>
                  {/* Pricing Info Banner */}
                  <div style={{
                    background: "rgba(217, 119, 6, 0.08)",
                    border: "1px solid rgba(217, 119, 6, 0.2)",
                    borderRadius: "12px",
                    padding: "0.85rem 1.1rem",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600 }}>
                       Rate: <strong>₹{pricePerCreditInr} / AI Credit</strong>
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      FamPay (@fam) • GPay • PhonePe • Paytm • Cards
                    </span>
                  </div>

                  {/* Preset Packages */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.6rem" }}>
                      Select a Credit Pack:
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.85rem" }}>
                      {/* Pack 1 */}
                      <div
                        onClick={() => { setSelectedPack(50); setCustomCredits(""); }}
                        style={{
                          border: selectedPack === 50 && !customCredits ? "2px solid var(--accent)" : "1px solid var(--border)",
                          background: selectedPack === 50 && !customCredits ? "#fffbeb" : "var(--surface)",
                          borderRadius: "12px",
                          padding: "1rem 0.75rem",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}></div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--primary)" }}>50</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Credits</div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--accent)" }}>
                          ₹{50 * pricePerCreditInr}
                        </div>
                      </div>

                      {/* Pack 2 */}
                      <div
                        onClick={() => { setSelectedPack(150); setCustomCredits(""); }}
                        style={{
                          border: selectedPack === 150 && !customCredits ? "2px solid var(--accent)" : "1px solid var(--border)",
                          background: selectedPack === 150 && !customCredits ? "#fffbeb" : "var(--surface)",
                          borderRadius: "12px",
                          padding: "1rem 0.75rem",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          position: "relative"
                        }}
                      >
                        <span style={{
                          position: "absolute",
                          top: "-10px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "var(--accent)",
                          color: "#ffffff",
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          padding: "0.1rem 0.5rem",
                          borderRadius: "10px",
                          textTransform: "uppercase"
                        }}>
                          POPULAR
                        </span>
                        <div style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}></div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--primary)" }}>150</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Credits</div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--accent)" }}>
                          ₹{150 * pricePerCreditInr}
                        </div>
                      </div>

                      {/* Pack 3 */}
                      <div
                        onClick={() => { setSelectedPack(500); setCustomCredits(""); }}
                        style={{
                          border: selectedPack === 500 && !customCredits ? "2px solid var(--accent)" : "1px solid var(--border)",
                          background: selectedPack === 500 && !customCredits ? "#fffbeb" : "var(--surface)",
                          borderRadius: "12px",
                          padding: "1rem 0.75rem",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}></div>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--primary)" }}>500</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Credits</div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--accent)" }}>
                          ₹{500 * pricePerCreditInr}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Credits */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.4rem" }}>
                      Or Enter Custom Credits Amount:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      placeholder="e.g. 200 credits..."
                      value={customCredits}
                      onChange={(e) => setCustomCredits(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.9rem",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        fontSize: "0.9rem",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Price Summary & Checkout Action */}
              <div style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "1rem",
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Total Payable Amount</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>
                    ₹{totalPriceInr.toLocaleString("en-IN")} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>INR</span>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={loading || (checkoutMode === "credits" && !activeCredits)}
                  style={{
                    background: checkoutMode === "plan" ? "linear-gradient(135deg, #047857 0%, #059669 100%)" : "linear-gradient(135deg, var(--accent) 0%, #b45309 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "0.75rem 1.75rem",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor: loading || (checkoutMode === "credits" && !activeCredits) ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  {loading ? "Processing..." : `Proceed to Pay ₹${totalPriceInr.toLocaleString("en-IN")}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
