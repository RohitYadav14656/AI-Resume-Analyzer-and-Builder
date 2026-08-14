const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  referenceId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["razorpay", "manual_utr"],
    required: true 
  },
  amount: { type: Number },
  status: { 
    type: String, 
    enum: ["verified", "pending", "rejected"],
    default: "verified" 
  },
  creditsRequested: { type: Number },
  planRequested: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
