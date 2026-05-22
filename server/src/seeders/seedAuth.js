/**
 * Idempotent auth seeder.
 *  1. Upserts the super admin (Ahilan) with email + password from env.
 *  2. Backfills any existing Staff docs that have no email/passwordHash
 *     so the new login flow works for the people that were created
 *     before this migration.
 *
 * Run with: npm run seed:auth
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/db");
const Staff = require("../models/Staff.model");
require("../models/Shell.model"); // register before populate

const SUPER_EMAIL = (process.env.SUPER_ADMIN_EMAIL || "ahilan@grayskull.com").toLowerCase();
const SUPER_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "Ahilan@123";
const SUPER_NAME = process.env.SUPER_ADMIN_NAME || "Ahilan";

function slugifyEmail(name, shellName) {
  const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
  const shellSlug = String(shellName || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  return shellSlug ? `${slug}.${shellSlug}@grayskull.com` : `${slug}@grayskull.com`;
}

async function ensureSuperAdmin() {
  const existing = await Staff.findOne({ email: SUPER_EMAIL });
  if (existing) {
    // Keep existing record, but make sure role/active are right
    if (existing.role !== "super_admin" || existing.isActive === false) {
      existing.role = "super_admin";
      existing.isActive = true;
      existing.shellId = null;
      await existing.save();
    }
    return { created: false, user: existing };
  }
  const passwordHash = await bcrypt.hash(SUPER_PASSWORD, 10);
  const user = await Staff.create({
    name: SUPER_NAME,
    email: SUPER_EMAIL,
    passwordHash,
    role: "super_admin",
    shellId: null,
  });
  return { created: true, user };
}

async function backfillExistingStaff() {
  const stale = await Staff.find({
    $or: [
      { email: { $exists: false } },
      { email: null },
      { email: "" },
      { passwordHash: { $exists: false } },
      { passwordHash: null },
      { passwordHash: "" },
      { role: { $exists: false } },
      { role: null },
    ],
    _id: { $ne: null },
  }).populate("shellId", "name");

  const defaultPasswordHash = await bcrypt.hash("Welcome@123", 10);
  const updates = [];

  for (const u of stale) {
    if (u.role === "super_admin") continue;
    if (!u.email) u.email = slugifyEmail(u.name, u.shellId?.name);
    if (!u.passwordHash) u.passwordHash = defaultPasswordHash;
    if (!u.role) u.role = "staff";
    try {
      await u.save();
      updates.push({ name: u.name, email: u.email, role: u.role });
    } catch (e) {
      // duplicate email? add a numeric suffix and retry once
      if (e?.code === 11000) {
        u.email = u.email.replace("@", `.${Math.floor(Math.random() * 1000)}@`);
        await u.save();
        updates.push({ name: u.name, email: u.email, role: u.role, suffixed: true });
      } else {
        throw e;
      }
    }
  }
  return updates;
}

async function run() {
  await connectDB();

  console.log("🌱 Ensuring super admin…");
  const { created, user } = await ensureSuperAdmin();
  if (created) {
    console.log(`✅ Created super admin ${user.email}`);
    console.log(`   Default password: ${SUPER_PASSWORD} (from .env — change in prod)`);
  } else {
    console.log(`ℹ️  Super admin already present: ${user.email}`);
  }

  console.log("🌱 Backfilling existing staff…");
  const updates = await backfillExistingStaff();
  console.log(`✅ Backfilled ${updates.length} staff/manager record(s)`);
  if (updates.length) {
    console.log("   Default password for all backfilled accounts: Welcome@123");
    updates.slice(0, 8).forEach((u) =>
      console.log(`   • ${u.name.padEnd(20)} → ${u.email}${u.suffixed ? " (suffixed)" : ""}`)
    );
    if (updates.length > 8) console.log(`   …and ${updates.length - 8} more`);
  }
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("❌ Seed failed:", e);
      process.exit(1);
    });
}

module.exports = { ensureSuperAdmin, backfillExistingStaff };
