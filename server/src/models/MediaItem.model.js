const mongoose = require("mongoose");

const MediaItemSchema = new mongoose.Schema(
  {
    shellId: { type: mongoose.Schema.Types.ObjectId, ref: "Shell", default: null, index: true }, // null = global
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["pdf", "video"], required: true },
    driveFileId: { type: String, required: true, trim: true },
    category: { type: String, default: "general", trim: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MediaItem", MediaItemSchema);