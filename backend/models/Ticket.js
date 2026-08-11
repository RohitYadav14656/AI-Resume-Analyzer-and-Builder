const mongoose = require("mongoose");

const TicketReplySchema = new mongoose.Schema(
  {
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ["user", "admin"], required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    type: {
      type: String,
      enum: ["bug", "feature", "rating", "support"],
      default: "support",
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    replies: [TicketReplySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);
