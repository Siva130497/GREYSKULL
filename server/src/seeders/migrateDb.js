/**
 * One-off migration: copies every collection from one MongoDB database to
 * another on the same cluster. Documents and indexes (other than the auto
 * `_id_` index) are duplicated. The source DB is left untouched.
 *
 * Required env (defaults in []):
 *   MONGODB_URI            — full URI to the source database
 *   MIGRATE_TARGET_DB      — name of the destination database  [GRAYSKULL]
 *
 *   `MIGRATE_OVERWRITE=true` will wipe matching collections in the destination
 *   before copying. Without it, collections that already have documents in the
 *   destination are skipped (idempotent).
 *
 * Run:  node src/seeders/migrateDb.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const TARGET = process.env.MIGRATE_TARGET_DB || "GRAYSKULL";
const OVERWRITE = process.env.MIGRATE_OVERWRITE === "true";

async function copyIndexes(srcColl, dstColl) {
  const indexes = await srcColl.indexes();
  for (const idx of indexes) {
    if (idx.name === "_id_") continue;
    const { key, name, ...rest } = idx;
    // strip mongo-internal fields that createIndex doesn't accept
    delete rest.v;
    delete rest.ns;
    try {
      await dstColl.createIndex(key, { name, ...rest });
    } catch (e) {
      console.warn(`    index ${name}: ${e.message}`);
    }
  }
}

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not set");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const srcDb = mongoose.connection.db;
  const dstDb = mongoose.connection.useDb(TARGET);

  console.log(`📦 Source DB: ${srcDb.databaseName}`);
  console.log(`📦 Target DB: ${dstDb.databaseName}`);
  if (srcDb.databaseName === dstDb.databaseName) {
    throw new Error("Source and target DBs are identical — refusing to run.");
  }

  const collections = await srcDb.listCollections().toArray();
  const report = [];

  for (const c of collections) {
    const name = c.name;
    if (name.startsWith("system.")) continue;

    const src = srcDb.collection(name);
    const dst = dstDb.collection(name);

    const srcCount = await src.countDocuments();
    let dstCount = await dst.countDocuments();

    if (OVERWRITE && dstCount > 0) {
      await dst.deleteMany({});
      dstCount = 0;
    }

    if (dstCount > 0) {
      report.push({ name, srcCount, dstCount, action: "skipped (target not empty)" });
      continue;
    }

    if (srcCount === 0) {
      report.push({ name, srcCount, dstCount: 0, action: "empty source, nothing to copy" });
      continue;
    }

    const docs = await src.find({}).toArray();
    const result = await dst.insertMany(docs, { ordered: false });
    await copyIndexes(src, dst);

    report.push({
      name,
      srcCount,
      dstCount: result.insertedCount,
      action: "copied",
    });
  }

  console.log("\nResult:");
  for (const r of report) {
    console.log(
      `  ${r.name.padEnd(20)} src:${String(r.srcCount).padStart(5)}  dst:${String(r.dstCount).padStart(5)}  ${r.action}`
    );
  }

  await mongoose.disconnect();
  console.log("\n✅ Migration finished. Original DB untouched.");
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("❌ Migration failed:", e);
      process.exit(1);
    });
}

module.exports = { run };
