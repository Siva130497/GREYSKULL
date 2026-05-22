const mongoose = require("mongoose");

const TradingLogSchema = new mongoose.Schema(
  {
    shellId: { type: mongoose.Schema.Types.ObjectId, ref: "Shell", required: true, index: true },
    date: { type: String, required: true, index: true }, // "YYYY-MM-DD" — local date

    // Actual open/close timestamps recorded by staff
    openedAt: { type: String, default: null }, // "HH:mm"
    openedByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },

    closedAt: { type: String, default: null }, // "HH:mm"
    closedByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
  },
  { timestamps: true }
);

// One log per shell per date
TradingLogSchema.index({ shellId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("TradingLog", TradingLogSchema);
