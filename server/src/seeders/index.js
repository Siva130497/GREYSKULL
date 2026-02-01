require("dotenv").config();
const { connectDB } = require("../config/db");
const { seedShells } = require("./shell.seeder");
const { seedStaff } = require("./staff.seeder");

(async () => {
  try {
    await connectDB();

    console.log("🌱 Seeding shells...");
    const shells = await seedShells();
    console.log(`✅ Shells upserted: ${shells.length}`);

    console.log("🌱 Seeding staff...");
    await seedStaff(shells);
    console.log("✅ Staff upserted: 5 per shell");

    console.log("🎉 Done.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  }
})();