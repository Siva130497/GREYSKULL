const mongoose = require("mongoose");

const DiaryEntrySchema = new mongoose.Schema(
  {
    shellId: { type: mongoose.Schema.Types.ObjectId, ref: "Shell", required: true, index: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    issueTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "IssueType", required: true },

    // store date and time separately so UI matches your screenshot cleanly
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm

    description: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

DiaryEntrySchema.index({ shellId: 1, date: 1, createdAt: -1 });

module.exports = mongoose.model("DiaryEntry", DiaryEntrySchema);