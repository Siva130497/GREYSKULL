const mongoose = require("mongoose");

const ROLES = ["super_admin", "manager", "staff"];

const StaffSchema = new mongoose.Schema(
  {
    // shellId is required for managers and staff, but null for super_admin (cluster-wide)
    shellId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shell",
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "staff", index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hide password hash in JSON output
StaffSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model("Staff", StaffSchema);
module.exports.ROLES = ROLES;
