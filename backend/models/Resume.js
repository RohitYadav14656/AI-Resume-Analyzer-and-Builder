const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    duration: String,
    description: String,
  },
  { _id: false }
);

const EducationSchema = new mongoose.Schema(
  {
    school: String,
    degree: String,
    year: String,
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    techStack: String,
    link: String,
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
    userName: { type: String, required: true },
    email: String,
    phone: String,
    linkedin: String,
    github: String,
    summary: String,
    skills: [String],
    experience: [ExperienceSchema],
    education: [EducationSchema],
    projects: [ProjectSchema],
    title: { type: String, default: "Untitled Resume" },
    targetJob: { type: String, default: "Full Stack Developer" },
    atsScore: { type: Number, default: 85 },
    atsAnalysis: {
      matchedKeywords: [String],
      missingSkills: [String],
      suggestions: [String],
      industryMatch: String,
    },
    extra: String,
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
