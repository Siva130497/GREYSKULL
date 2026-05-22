/**
 * One-off: set trading hours on Sawbridgeworth, Half moon, and Broxbourne.
 * The other 5 shells stay 24/7 (the default).
 *
 * Idempotent — re-running just overwrites the same fields.
 *
 * Run:  npm run seed:trading
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Shell = require("../models/Shell.model");

const HOURS = [
  { match: /sawbridgeworth/i, opensAt: "06:30", closesAt: "22:30" },
  { match: /half/i, opensAt: "07:00", closesAt: "23:00" },
  { match: /broxbourne/i, opensAt: "07:00", closesAt: "22:00" },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const shells = await Shell.find();
  const updates = [];

  for (const s of shells) {
    const rule = HOURS.find((h) => h.match.test(s.name));
    if (rule) {
      s.is24x7 = false;
      s.opensAt = rule.opensAt;
      s.closesAt = rule.closesAt;
      s.loginLeadMinutes = 30;
      s.signoffLagMinutes = 5;
      await s.save();
      updates.push(
        `${s.name.padEnd(20)} → opens ${rule.opensAt}, closes ${rule.closesAt}`
      );
    } else {
      // Force-write the 24/7 fields so the value is actually persisted
      // (mongoose schema defaults don't retro-fill existing documents).
      s.is24x7 = true;
      s.opensAt = null;
      s.closesAt = null;
      await s.save();
      updates.push(`${s.name.padEnd(20)} → 24/7`);
    }
  }

  console.log("✅ Trading hours applied:");
  updates.forEach((u) => console.log("   " + u));
  await mongoose.disconnect();
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("❌ Failed:", e);
      process.exit(1);
    });
}

module.exports = { run };
