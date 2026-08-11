const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["announcement", "maintenance", "release"],
      default: "announcement",
    },
    targetGroup: {
      type: String,
      enum: ["all", "free", "pro", "admins"],
      default: "all",
    },
    createdBy: { type: String, default: "Admin" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);
