const mongoose = require("mongoose");

const PlanogramSchema = new mongoose.Schema(
  {
    shellId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shell",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    notes: { type: String, default: "", trim: true },

    // The planogram image, stored as a data URL ("data:image/jpeg;base64,...")
    // Client compresses & resizes before upload so payloads stay small (~200-400KB).
    photoDataUrl: { type: String, required: true },

    // "pending" until someone marks it live on the shop floor.
    status: {
      type: String,
      enum: ["pending", "live"],
      default: "pending",
      index: true,
    },

    uploadedByStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    markedLiveByStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
    markedLiveAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hide the heavy photo blob on list endpoints by default — clients can opt in
// via `?withPhoto=1` if they want it inline (the detail view does).
PlanogramSchema.set("toJSON", {
  transform(_doc, ret, options) {
    if (options && options.stripPhoto) {
      delete ret.photoDataUrl;
    }
    return ret;
  },
});

PlanogramSchema.index({ shellId: 1, createdAt: -1 });

module.exports = mongoose.model("Planogram", PlanogramSchema);
