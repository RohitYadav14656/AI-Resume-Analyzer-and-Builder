const mongoose = require("mongoose");
const zlib = require("zlib");

// Old compress/decompress functions replaced by document-level compression
function compressData(data) {
  if (!data) return null;
  return zlib.deflateSync(Buffer.from(JSON.stringify(data)));
}

function decompressData(buffer) {
  if (!buffer) return {};
  try {
    return JSON.parse(zlib.inflateSync(buffer).toString('utf-8'));
  } catch (e) {
    return {};
  }
}

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
    title: { type: String, default: "Untitled Resume", trim: true },
    targetJob: { type: String, default: "Full Stack Developer", trim: true },
    atsScore: { type: Number, default: 85 },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, trim: true },
    
    // We explicitly define these so Mongoose still validates them on req.body
    summary: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    experience: [ExperienceSchema],
    education: [EducationSchema],
    projects: [ProjectSchema],
    atsAnalysis: {
      matchedKeywords: [{ type: String, trim: true }],
      missingSkills: [{ type: String, trim: true }],
      suggestions: [{ type: String, trim: true }],
      industryMatch: { type: String, trim: true },
    },
    extra: { type: String, trim: true },
    
    // The compressed payload
    compressedData: { type: Buffer }, // fetched by default so post('init') can decompress it
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.compressedData;
        return ret;
      }
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.compressedData;
        return ret;
      }
    }
  }
);

// List of fields to compress
const COMPRESSED_FIELDS = ['summary', 'skills', 'experience', 'education', 'projects', 'atsAnalysis', 'extra'];

ResumeSchema.pre('save', function (next) {
  const dataToCompress = {};
  
  COMPRESSED_FIELDS.forEach(field => {
    if (this[field] !== undefined) {
      dataToCompress[field] = this[field];
      // Mark as undefined so Mongoose removes it from the uncompressed MongoDB document payload
      this[field] = undefined;
    }
  });

  if (Object.keys(dataToCompress).length > 0) {
    this.compressedData = compressData(dataToCompress);
  }
  
  next();
});

ResumeSchema.post('init', function (doc) {
  if (doc.compressedData) {
    const decompressed = decompressData(doc.compressedData);
    COMPRESSED_FIELDS.forEach(field => {
      if (decompressed[field] !== undefined) {
        doc[field] = decompressed[field];
      }
    });
  }
});

module.exports = mongoose.model("Resume", ResumeSchema);
