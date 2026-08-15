const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true },
    role: { type: String, trim: true },
    duration: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const EducationSchema = new mongoose.Schema(
  {
    school: { type: String, trim: true },
    degree: { type: String, trim: true },
    year: { type: String, trim: true },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    techStack: { type: String, trim: true },
    link: { type: String, trim: true },
  },
  { _id: false }
);

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    userName: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    summary: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    experience: [ExperienceSchema],
    education: [EducationSchema],
    projects: [ProjectSchema],
    title: { type: String, default: "Untitled Resume", trim: true },
    targetJob: { type: String, default: "Full Stack Developer", trim: true },
    atsScore: { type: Number, default: 85 },
    atsAnalysis: {
      matchedKeywords: [{ type: String, trim: true }],
      missingSkills: [{ type: String, trim: true }],
      suggestions: [{ type: String, trim: true }],
      industryMatch: { type: String, trim: true },
    },
    extra: { type: String, trim: true },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
