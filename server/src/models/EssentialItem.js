const mongoose = require("mongoose");

const EssentialItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    category: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EssentialItem", EssentialItemSchema);