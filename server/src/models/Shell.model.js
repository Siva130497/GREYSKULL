const mongoose = require("mongoose");

const ShellSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },

    // Weather banner support
    locationName: { type: String, default: "", trim: true },
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },

    // Trading-hours support.
    //  - is24x7: true means the station never closes; no open/close log expected.
    //  - opensAt / closesAt are local "HH:mm" strings the staff opens/closes by.
    //  - loginLeadMinutes: how many minutes BEFORE opensAt staff must log into the till.
    //  - signoffLagMinutes: how many minutes AFTER closesAt staff must sign off from the till.
    is24x7: { type: Boolean, default: true },
    opensAt: { type: String, default: null }, // "HH:mm" — required when !is24x7
    closesAt: { type: String, default: null }, // "HH:mm"
    loginLeadMinutes: { type: Number, default: 30 },
    signoffLagMinutes: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shell", ShellSchema);
