const express = require("express");
const mongoose = require("mongoose");
const Resume = require("../models/Resume");
const User = require("../models/User");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { resumeSchema, resumeUpdateSchema } = require("../validators/resumeValidator");
const AppError = require("../utils/AppError");

const router = express.Router();

async function logActivity(userId, action, description) {
  if (!userId) return;
  try {
    const user = await User.findById(userId);
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
  } catch (e) {}
}

function validateObjectId(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid resume ID format.", 400));
  }
  next();
}

router.post("/", auth, validate(resumeSchema), async (req, res, next) => {
  try {
    const resumeData = { ...req.body };
    if (req.user) {
      resumeData.userId = req.user.userId;
    }
    const resume = new Resume(resumeData);
    await resume.save();

    if (req.user?.userId) {
      await logActivity(req.user.userId, "Resume Created", `Saved resume "${resume.userName || "Untitled"}" to account`);
    }

    res.status(201).json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
});

router.get("/", auth, async (req, res, next) => {
  try {
    const query = req.user ? { userId: req.user.userId } : {};
    const resumes = await Resume.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validateObjectId, async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) throw new AppError("Resume not found.", 404);
    res.json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, validateObjectId, validate(resumeUpdateSchema), async (req, res, next) => {
  try {
    const resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resume) throw new AppError("Resume not found.", 404);

    const userId = req.user?.userId || resume.userId;
    if (userId) {
      await logActivity(userId, "Resume Updated", `Updated resume "${resume.userName || "Untitled"}"`);
    }

    res.json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, validateObjectId, async (req, res, next) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) throw new AppError("Resume not found.", 404);

    const userId = req.user?.userId || resume.userId;
    if (userId) {
      await logActivity(userId, "Resume Deleted", `Removed resume "${resume.userName || "Untitled"}"`);
    }

    res.json({ success: true, message: "Resume deleted successfully." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
