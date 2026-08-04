const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Resume = require("../models/Resume");
const RefreshToken = require("../models/RefreshToken");
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
        isVerified: user.isVerified,
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

module.exports = router;
