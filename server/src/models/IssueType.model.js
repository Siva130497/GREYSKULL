const mongoose = require("mongoose");

const IssueTypeSchema = new mongoose.Schema(
  {
    shellId: { type: mongoose.Schema.Types.ObjectId, ref: "Shell", required: true, index: true },
    name: { type: String, required: true, trim: true },
    createdByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true }
  },
  { timestamps: true }
);

IssueTypeSchema.index({ shellId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("IssueType", IssueTypeSchema);