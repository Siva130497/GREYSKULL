/**
 * Seed default Issue Types for each Shell
 * CommonJS version (works with your current setup)
 */

const path = require("path");
require("dotenv").config({
  path: path.resolve(process.cwd(), ".env"),
});

const mongoose = require("mongoose");

// 🔎 Resolve Mongo URI safely
const uri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (!uri) {
  console.error(
    "❌ Missing Mongo URI env. Set MONGO_URI (or MONGODB_URI / DATABASE_URL) in server/.env"
  );
  process.exit(1);
}

// 📦 Import models (CommonJS style)
const Shell = require("../models/Shell.model.js");
const IssueType = require("../models/IssueType.model.js");

// ✅ Default categories you requested
const DEFAULT_TYPES = [
  "Issues",
  "Site closers",
  "Call logs",
  "Anything related to site and sales",
];

async function run() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");

    const shells = await Shell.find({});
    console.log(`📍 Shells found: ${shells.length}`);

    if (shells.length === 0) {
      console.warn("⚠️ No shells found. Seed shells first.");
      process.exit(0);
    }

    for (const shell of shells) {
      for (const name of DEFAULT_TYPES) {
        await IssueType.updateOne(
          { shellId: shell._id, name },
          {
            $setOnInsert: {
              shellId: shell._id,
              name,
            },
          },
          { upsert: true }
        );
      }

      console.log(`✅ Issue types seeded for shell: ${shell.name}`);
    }

    console.log("🎉 Issue type seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

run();