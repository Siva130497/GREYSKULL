const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

// On Vercel each cold start can spawn a new instance — we cache the connection
// promise on `globalThis` so warm invocations reuse the same pool and we don't
// exhaust Atlas's connection limit.
const g = globalThis;
if (!g.__greyskullMongoose) {
  g.__greyskullMongoose = { conn: null, promise: null };
}
const cached = g.__greyskullMongoose;

async function ensureDb() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Missing MONGODB_URI in .env");

    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 10,
      })
      .then((m) => m.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset so the next request retries instead of being stuck on a rejected promise.
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

// Back-compat for the long-running local server (npm run dev / start).
async function connectDB() {
  await ensureDb();
  console.log("✅ MongoDB connected");
}

module.exports = { connectDB, ensureDb };
