const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema(
  {
    shellId: { type: mongoose.Schema.Types.ObjectId, ref: "Shell", required: true, index: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// prevent duplicate staff name per shell
StaffSchema.index({ shellId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Staff", StaffSchema);