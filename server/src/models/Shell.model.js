const mongoose = require("mongoose");

const ShellSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },

    // ✅ Weather banner support
    locationName: { type: String, default: "", trim: true },
    lat: { type: Number, default: null },
    lon: { type: Number, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shell", ShellSchema);