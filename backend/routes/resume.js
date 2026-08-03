const express = require("express");
const mongoose = require("mongoose");
const Resume = require("../models/Resume");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { resumeSchema, resumeUpdateSchema } = require("../validators/resumeValidator");
const AppError = require("../utils/AppError");

const router = express.Router();

/**
 * Middleware to validate Mongoose ObjectId parameter.
 */
function validateObjectId(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid resume ID format.", 400));
  }
  next();
}

// ─── Create / save a resume ────────────────────────────────────────────────────
router.post("/", auth, validate(resumeSchema), async (req, res, next) => {
  try {
    const resumeData = { ...req.body };
    if (req.user) {
      resumeData.userId = req.user.userId;
    }
    const resume = new Resume(resumeData);
    await resume.save();
    res.status(201).json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
});

// ─── Get all resumes ───────────────────────────────────────────────────────────
router.get("/", auth, async (req, res, next) => {
  try {
    const query = req.user ? { userId: req.user.userId } : {};
    const resumes = await Resume.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (err) {
    next(err);
  }
});

// ─── Get single resume ─────────────────────────────────────────────────────────
router.get("/:id", validateObjectId, async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) throw new AppError("Resume not found.", 404);
    res.json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
});

// ─── Update resume ─────────────────────────────────────────────────────────────
router.put("/:id", validateObjectId, validate(resumeUpdateSchema), async (req, res, next) => {
  try {
    const resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resume) throw new AppError("Resume not found.", 404);
    res.json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
});

// ─── Delete resume ─────────────────────────────────────────────────────────────
router.delete("/:id", validateObjectId, async (req, res, next) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) throw new AppError("Resume not found.", 404);
    res.json({ success: true, message: "Resume deleted successfully." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
