const mongoose = require("mongoose");

const CostaFaultSchema = new mongoose.Schema(
  {
    shellId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shell",
      required: true,
      index: true,
    },
    createdByStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    date: { type: String, required: true }, // "YYYY-MM-DD" — when the fault happened
    fault: { type: String, required: true, trim: true }, // description
    reportedAt: { type: Date, required: true }, // when staff phoned Costa Maintenance
    fixedAt: { type: Date, default: null }, // null until the engineer fixes it
  },
  { timestamps: true }
);

CostaFaultSchema.index({ shellId: 1, createdAt: -1 });

module.exports = mongoose.model("CostaFault", CostaFaultSchema);
