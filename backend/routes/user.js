const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Resume = require("../models/Resume");
const RefreshToken = require("../models/RefreshToken");
const Ticket = require("../models/Ticket");
const Announcement = require("../models/Announcement");
const SystemConfig = require("../models/SystemConfig");
const auth = require("../middleware/auth");
const AppError = require("../utils/AppError");

const router = express.Router();

router.use(auth);

router.use((req, res, next) => {
  if (!req.user || !req.user.userId) {
    return next(new AppError("Authentication required. Please log in.", 401));
  }
  next();
});

function computeProfileCompletion(user, resumeCount = 0) {
  let completion = 0;
  if (user.name) completion += 15;
  if (user.email) completion += 15;
  if (user.headline && user.headline.trim().length > 0) completion += 15;
  if (user.university && user.university.trim().length > 0) completion += 15;
  if (user.avatar && user.avatar.trim().length > 0) completion += 10;
  if (user.linkedin && user.linkedin.trim().length > 0) completion += 10;
  if (user.github && user.github.trim().length > 0) completion += 10;
  if (resumeCount > 0) completion += 10;
  return Math.min(completion, 100);
}

router.get("/profile", async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -resetPasswordToken -emailVerificationToken");
    if (!user) throw new AppError("User not found.", 404);

    // Fetch global config for daily bonus
    const config = await SystemConfig.findOne({ key: "global_settings" });
    const dailyBonusAmount = config?.dailyBonusCredits !== undefined ? config.dailyBonusCredits : 4;

    // Daily Free Login Bonus Check (+4 credits default every 24h/new day)
    let dailyBonusAwarded = false;
    const now = new Date();
    const lastBonus = user.lastDailyCreditBonus ? new Date(user.lastDailyCreditBonus) : null;

    if (!lastBonus || now.toDateString() !== lastBonus.toDateString()) {
      user.aiCredits = (user.aiCredits !== undefined ? user.aiCredits : 10) + dailyBonusAmount;
      user.lastDailyCreditBonus = now;
      dailyBonusAwarded = true;
      user.recentActivity.unshift({
        action: "Daily Bonus Received",
        description: `Received +${dailyBonusAmount} Free AI Daily Login Credits! 🎁`,
        timestamp: now,
      });
      await user.save();
    }

    const resumes = await Resume.find({ userId: req.user.userId }).sort({ updatedAt: -1 });

    const totalResumes = resumes.length;
    let projectsAdded = 0;
    resumes.forEach((r) => {
      if (Array.isArray(r.projects)) projectsAdded += r.projects.length;
    });

    let highestAtsScore = 0;
    if (totalResumes > 0) {
      resumes.forEach((r) => {
        let score = 65;
        if (r.summary && r.summary.trim().length > 20) score += 10;
        if (Array.isArray(r.skills) && r.skills.length >= 3) score += 10;
        if (Array.isArray(r.experience) && r.experience.length > 0) score += 10;
        if (Array.isArray(r.projects) && r.projects.length > 0) score += 5;
        if (score > highestAtsScore) highestAtsScore = score;
      });
      highestAtsScore = Math.min(highestAtsScore, 96);
    }

    const analysesCount = user.recentActivity?.filter(a => a.action?.includes("Analyzed") || a.action?.includes("Audit")).length || 0;
    const downloadsCount = user.recentActivity?.filter(a => a.action?.includes("Downloaded") || a.action?.includes("PDF")).length || 0;

    const stats = {
      totalResumes,
      analysesCompleted: analysesCount > 0 ? analysesCount : (totalResumes > 0 ? totalResumes : 0),
      highestAtsScore,
      projectsAdded,
      resumeDownloads: downloadsCount > 0 ? downloadsCount : (totalResumes > 0 ? totalResumes : 0),
    };

    const completion = computeProfileCompletion(user, totalResumes);

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        headline: user.headline || "",
        university: user.university || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        avatar: user.avatar || "",
        aiPersonalization: user.aiPersonalization !== undefined ? user.aiPersonalization : true,
        notificationPreferences: user.notificationPreferences || {
          emailAlerts: true,
          resumeTips: true,
          weeklySummary: false,
        },
        createdAt: user.createdAt,
        firstLogin: user.firstLogin || user.createdAt,
        lastLogin: user.lastLogin || user.createdAt,
        isOnline: Boolean(user.isOnline || (user.lastActiveAt && (Date.now() - new Date(user.lastActiveAt).getTime()) < 5 * 60 * 1000)),
        lastActiveAt: user.lastActiveAt || user.createdAt,
        isVerified: user.isVerified,
        role: user.role || "user",
        status: user.status || "active",
        subscription: user.subscription || "free",
        aiCredits: user.aiCredits !== undefined ? user.aiCredits : 100,
      },
      stats,
      profileCompletion: completion,
      recentActivity: user.recentActivity || [],
      savedResumes: resumes,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/profile", async (req, res, next) => {
  try {
    const { name, headline, university, linkedin, github, avatar, aiPersonalization, notificationPreferences } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) throw new AppError("User not found.", 404);

    if (name !== undefined) user.name = name;
    if (headline !== undefined) user.headline = headline;
    if (university !== undefined) user.university = university;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (avatar !== undefined) user.avatar = avatar;
    if (aiPersonalization !== undefined) user.aiPersonalization = aiPersonalization;
    if (notificationPreferences !== undefined) user.notificationPreferences = notificationPreferences;

    user.recentActivity.unshift({
      action: "Profile Updated",
      description: "Updated profile details and social links",
      timestamp: new Date(),
    });

    if (user.recentActivity.length > 25) {
      user.recentActivity = user.recentActivity.slice(0, 25);
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        headline: user.headline,
        university: user.university,
        linkedin: user.linkedin,
        github: user.github,
        avatar: user.avatar,
        aiPersonalization: user.aiPersonalization,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/change-password", async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      throw new AppError("New password must be at least 6 characters long.", 400);
    }

    const user = await User.findById(req.user.userId).select("+password");
    if (!user) throw new AppError("User not found.", 404);

    if (user.googleId && !user.password) {
      throw new AppError("Google authenticated accounts do not use passwords.", 400);
    }

    const isMatch = await bcrypt.compare(currentPassword || "", user.password);
    if (!isMatch) {
      throw new AppError("Current password is incorrect.", 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.recentActivity.unshift({
      action: "Password Changed",
      description: "Successfully updated account password",
      timestamp: new Date(),
    });

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/activity", async (req, res, next) => {
  try {
    const { action, description } = req.body;

    if (!action || !description) {
      throw new AppError("Action and description are required.", 400);
    }

    const user = await User.findById(req.user.userId);
    if (user) {
      user.recentActivity.unshift({
        action,
        description,
        timestamp: new Date(),
      });

      if (user.recentActivity.length > 25) {
        user.recentActivity = user.recentActivity.slice(0, 25);
      }

      await user.save();
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get("/export", async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -resetPasswordToken -emailVerificationToken");
    if (!user) throw new AppError("User not found.", 404);

    const resumes = await Resume.find({ userId: req.user.userId });

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        headline: user.headline,
        university: user.university,
        linkedin: user.linkedin,
        github: user.github,
        aiPersonalization: user.aiPersonalization,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
        firstLogin: user.firstLogin || user.createdAt,
        lastLogin: user.lastLogin || user.createdAt,
      },
      resumes,
      activityHistory: user.recentActivity,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=resumeai-data-${user._id}.json`);
    res.json(exportData);
  } catch (err) {
    next(err);
  }
});

router.delete("/account", async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await Resume.deleteMany({ userId });
    await RefreshToken.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.json({ success: true, message: "Account and associated data deleted permanently." });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/user/tickets
 * Fetch tickets submitted by current user
 */
router.get("/tickets", async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) throw new AppError("User not found", 404);

    const tickets = await Ticket.find({
      $or: [{ userId: req.user.userId }, { userEmail: user.email }],
    }).sort({ updatedAt: -1 });

    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/tickets
 * Submit a new support ticket
 */
router.post("/tickets", async (req, res, next) => {
  try {
    const { title, description, type, priority } = req.body;
    if (!title || !description) {
      throw new AppError("Title and description are required for support ticket.", 400);
    }

    const user = await User.findById(req.user.userId);
    if (!user) throw new AppError("User not found", 404);

    const ticket = await Ticket.create({
      userId: user._id,
      userName: user.name || "User",
      userEmail: user.email,
      title,
      description,
      type: type || "support",
      priority: priority || "medium",
      status: "open",
    });

    res.json({
      success: true,
      message: "Support ticket created successfully.",
      ticket,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/tickets/:id/reply
 * Reply to ticket thread
 */
router.post("/tickets/:id/reply", async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) throw new AppError("Reply message is required.", 400);

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) throw new AppError("Ticket not found.", 404);

    const user = await User.findById(req.user.userId);

    ticket.replies.push({
      senderName: user ? user.name : "User",
      senderRole: "user",
      message,
      createdAt: new Date(),
    });

    if (ticket.status === "resolved") {
      ticket.status = "open";
    }

    await ticket.save();

    res.json({
      success: true,
      message: "Reply added to ticket.",
      ticket,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/user/announcements
 * Fetch active broadcast announcements for user
 */
router.get("/announcements", async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    const userSub = user?.subscription || "free";

    const announcements = await Announcement.find({
      active: true,
      targetGroup: { $in: ["all", userSub] },
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: announcements.length, announcements });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/create-payment-order
 * Generate payment order for Razorpay / Stripe / Test Checkout
 */
router.post("/create-payment-order", async (req, res, next) => {
  try {
    const { creditsCount, plan } = req.body;
    const SystemConfig = require("../models/SystemConfig");
    const crypto = require("crypto");
    const config = await SystemConfig.findOne({ key: "global_settings" });

    const keyId = config?.razorpayKeyId || process.env.RAZORPAY_KEY_ID || "";
    const keySecret = config?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "";
    const paymentGateway = config?.paymentGateway || "upi_qr";
    const upiId = config?.upiId || "resumeai@fam";
    const upiName = config?.upiName || "FamPay / Resume AI";

    let totalAmountInr = 0;
    let description = "";
    let count = 0;

    if (plan && ["pro", "enterprise"].includes(plan.toLowerCase())) {
      const targetPlan = plan.toLowerCase();
      totalAmountInr = targetPlan === "pro" 
        ? (config?.proPlanPrice !== undefined ? config.proPlanPrice : 499)
        : (config?.enterprisePlanPrice !== undefined ? config.enterprisePlanPrice : 1999);
      description = `${targetPlan.toUpperCase()} Plan Subscription`;
    } else {
      count = parseInt(creditsCount);
      if (isNaN(count) || count <= 0) {
        throw new AppError("Invalid credits amount requested.", 400);
      }
      const pricePerCredit = config?.pricePerCreditInr !== undefined ? config.pricePerCreditInr : 2;
      totalAmountInr = count * pricePerCredit;
      description = `+${count} AI Credits Pack`;
    }

    const amountInPaisa = totalAmountInr * 100;
    const orderId = `order_${crypto.randomBytes(12).toString("hex")}`;
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${totalAmountInr}&cu=INR&tn=${encodeURIComponent(description)}`;

    res.json({
      success: true,
      orderId,
      amountInr: totalAmountInr,
      amountInPaisa,
      currency: "INR",
      creditsCount: count,
      plan: plan || null,
      description,
      keyId,
      paymentGateway,
      upiId,
      upiName,
      upiUri,
      hasLiveKeys: Boolean(keyId && keySecret && paymentGateway === "razorpay"),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/verify-payment
 * Verify payment & update user credits or subscription plan
 */
router.post("/verify-payment", async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, creditsCount, plan, utrNumber } = req.body;
    const crypto = require("crypto");
    const SystemConfig = require("../models/SystemConfig");
    const Transaction = require("../models/Transaction");
    const config = await SystemConfig.findOne({ key: "global_settings" });
    const keySecret = config?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "";

    const isRazorpay = config?.paymentGateway === "razorpay" && config?.razorpayKeyId && config?.razorpayKeySecret;

    if (isRazorpay && !signature && !utrNumber) {
      throw new AppError("Payment verification failed. Missing Razorpay signature.", 400);
    }

    if (keySecret && signature) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (generatedSignature !== signature) {
        throw new AppError("Payment verification failed. Invalid HMAC signature.", 400);
      }
    } else if (utrNumber) {
      const utrStr = String(utrNumber).trim();
      if (!/^\d{12}$/.test(utrStr)) {
        throw new AppError("Invalid Transaction ID. Please enter a valid 12-digit numeric UTR.", 400);
      }
    } else {
      throw new AppError("Invalid payment details provided. Provide a UTR or valid signature.", 400);
    }

    // Prevent duplicate processing
    const referenceId = utrNumber ? String(utrNumber).trim() : paymentId;
    if (referenceId) {
      const existingTx = await Transaction.findOne({ referenceId });
      if (existingTx) {
        throw new AppError("This transaction ID has already been processed.", 400);
      }
    }

    const user = await User.findById(req.user.userId);
    if (!user) throw new AppError("User not found.", 404);

    const refTag = utrNumber ? ` (UTR: ${utrNumber})` : paymentId ? ` (Ref: ${paymentId})` : "";

    if (plan && ["pro", "enterprise"].includes(plan.toLowerCase())) {
      const targetPlan = plan.toLowerCase();
      const planPrice = targetPlan === "pro" 
        ? (config?.proPlanPrice !== undefined ? config.proPlanPrice : 499)
        : (config?.enterprisePlanPrice !== undefined ? config.enterprisePlanPrice : 1999);

      if (utrNumber) {
        // Pending logic for Subscription
        await Transaction.create({
          referenceId,
          userId: req.user.userId,
          type: "manual_utr",
          amount: planPrice,
          status: "pending",
          planRequested: targetPlan
        });
        
        return res.json({
          success: true,
          pending: true,
          message: `Payment submitted for review! Your subscription will be activated once verified.`
        });
      }

      // Instant logic for Razorpay Subscription
      user.subscription = targetPlan;
      const extraCredits = targetPlan === "pro" ? 100 : 500;
      user.aiCredits = (user.aiCredits || 0) + extraCredits;

      user.recentActivity.unshift({
        action: "Subscription Payment Verified",
        description: `Verified payment${refTag} for ${targetPlan.toUpperCase()} Plan (₹${planPrice}) — Received +${extraCredits} Bonus Credits!`,
        timestamp: new Date(),
      });

      if (user.recentActivity.length > 25) {
        user.recentActivity = user.recentActivity.slice(0, 25);
      }

      await user.save();

      if (referenceId) {
        await Transaction.create({
          referenceId,
          userId: req.user.userId,
          type: "razorpay",
          amount: planPrice,
          status: "verified"
        });
      }

      return res.json({
        success: true,
        pending: false,
        message: `🎉 Payment Verified! Subscribed to ${targetPlan.toUpperCase()} Plan (₹${planPrice}) with +${extraCredits} Bonus Credits!`,
        subscription: user.subscription,
        aiCredits: user.aiCredits,
        totalAmountInr: planPrice,
      });
    } else {
      const count = parseInt(creditsCount);
      if (isNaN(count) || count <= 0) {
        throw new AppError("Invalid credits count.", 400);
      }
      const pricePerCredit = config?.pricePerCreditInr !== undefined ? config.pricePerCreditInr : 2;
      const totalAmountInr = count * pricePerCredit;

      if (utrNumber) {
        // Pending logic for Credits
        await Transaction.create({
          referenceId,
          userId: req.user.userId,
          type: "manual_utr",
          amount: totalAmountInr,
          status: "pending",
          creditsRequested: count
        });
        
        return res.json({
          success: true,
          pending: true,
          message: `Payment submitted for review! ${count} AI Credits will be added once verified.`
        });
      }

      // Instant logic for Razorpay Credits
      user.aiCredits = (user.aiCredits || 0) + count;

      user.recentActivity.unshift({
        action: "Payment Verified & Credits Added",
        description: `Verified payment${refTag} — Added +${count} AI Credits for ₹${totalAmountInr}`,
        timestamp: new Date(),
      });

      if (user.recentActivity.length > 25) {
        user.recentActivity = user.recentActivity.slice(0, 25);
      }

      await user.save();

      if (referenceId) {
        await Transaction.create({
          referenceId,
          userId: req.user.userId,
          type: "razorpay",
          amount: totalAmountInr,
          status: "verified"
        });
      }

      return res.json({
        success: true,
        pending: false,
        message: `🎉 Payment Verified! +${count} AI Credits added to your account.`,
        subscription: user.subscription,
        aiCredits: user.aiCredits,
        totalAmountInr,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/buy-credits
 * Purchase AI credits directly (Fall-back / Direct credit grant)
 */
router.post("/buy-credits", async (req, res, next) => {
  try {
    const { creditsCount } = req.body;
    const count = parseInt(creditsCount);

    if (isNaN(count) || count <= 0) {
      throw new AppError("Invalid credits amount requested.", 400);
    }

    const SystemConfig = require("../models/SystemConfig");
    const config = await SystemConfig.findOne({ key: "global_settings" });
    const pricePerCredit = config?.pricePerCreditInr !== undefined ? config.pricePerCreditInr : 2;

    const totalAmountInr = count * pricePerCredit;

    const user = await User.findById(req.user.userId);
    if (!user) throw new AppError("User not found.", 404);

    user.aiCredits = (user.aiCredits || 0) + count;

    user.recentActivity.unshift({
      action: "AI Credits Purchased",
      description: `Purchased +${count} AI Credits for ₹${totalAmountInr} (₹${pricePerCredit}/credit)`,
      timestamp: new Date(),
    });

    if (user.recentActivity.length > 25) {
      user.recentActivity = user.recentActivity.slice(0, 25);
    }

    await user.save();

    res.json({
      success: true,
      message: `Successfully purchased +${count} AI Credits for ₹${totalAmountInr}!`,
      aiCredits: user.aiCredits,
      totalAmountInr,
      pricePerCreditInr: pricePerCredit,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/user/pricing-config
 * Fetch current subscription plan prices & credit top-up rates
 */
router.get("/pricing-config", async (req, res, next) => {
  try {
    let config = await SystemConfig.findOne({ key: "global_settings" });
    if (!config) {
      config = await SystemConfig.create({ key: "global_settings" });
    }

    res.json({
      success: true,
      pricing: {
        normalPlanPrice: config.normalPlanPrice !== undefined ? config.normalPlanPrice : 0,
        proPlanPrice: config.proPlanPrice !== undefined ? config.proPlanPrice : 499,
        enterprisePlanPrice: config.enterprisePlanPrice !== undefined ? config.enterprisePlanPrice : 1999,
        pricePerCreditInr: config.pricePerCreditInr !== undefined ? config.pricePerCreditInr : 2,
        dailyBonusCredits: config.dailyBonusCredits !== undefined ? config.dailyBonusCredits : 4,
        initialSignupCredits: config.initialSignupCredits !== undefined ? config.initialSignupCredits : 10,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/upgrade-subscription
 * Upgrade or change user subscription plan (normal, pro, enterprise)
 */
router.post("/upgrade-subscription", async (req, res, next) => {
  try {
    const { plan } = req.body;
    const targetPlan = String(plan || "").toLowerCase().trim();

    if (!["normal", "free", "pro", "enterprise"].includes(targetPlan)) {
      throw new AppError("Invalid subscription plan selected. Must be 'normal', 'pro', or 'enterprise'.", 400);
    }

    const normalizedPlan = targetPlan === "free" ? "normal" : targetPlan;

    const user = await User.findById(req.user.userId);
    if (!user) throw new AppError("User not found.", 404);

    const config = await SystemConfig.findOne({ key: "global_settings" });
    const planPrice = normalizedPlan === "pro" 
      ? (config?.proPlanPrice !== undefined ? config.proPlanPrice : 499)
      : normalizedPlan === "enterprise"
      ? (config?.enterprisePlanPrice !== undefined ? config.enterprisePlanPrice : 1999)
      : (config?.normalPlanPrice !== undefined ? config.normalPlanPrice : 0);

    user.subscription = normalizedPlan;

    // Award bonus plan credits on upgrading to Pro (+100) or Enterprise (+500)
    let extraCreditsAwarded = 0;
    if (normalizedPlan === "pro") extraCreditsAwarded = 100;
    if (normalizedPlan === "enterprise") extraCreditsAwarded = 500;

    if (extraCreditsAwarded > 0) {
      user.aiCredits = (user.aiCredits || 0) + extraCreditsAwarded;
    }

    user.recentActivity.unshift({
      action: "Subscription Updated",
      description: `Upgraded subscription to ${normalizedPlan.toUpperCase()} Plan (₹${planPrice})${extraCreditsAwarded ? ` — Received +${extraCreditsAwarded} Bonus Credits!` : ""}`,
      timestamp: new Date(),
    });

    if (user.recentActivity.length > 25) {
      user.recentActivity = user.recentActivity.slice(0, 25);
    }

    await user.save();

    res.json({
      success: true,
      message: `Subscription successfully updated to ${normalizedPlan.toUpperCase()}!`,
      subscription: user.subscription,
      aiCredits: user.aiCredits,
      planPrice,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
