const mongoose = require("mongoose");

const ShellStockItemSchema = new mongoose.Schema(
  {
    shellId: { type: mongoose.Schema.Types.ObjectId, ref: "Shell", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "EssentialItem", required: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// prevent duplicates
ShellStockItemSchema.index({ shellId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model("ShellStockItem", ShellStockItemSchema);