/**
 * Vercel serverless entry point.
 *
 * Hands every /api/* request to the existing Express app via serverless-http.
 * Mongo is connected lazily and cached on `globalThis` so subsequent invocations
 * on the same instance reuse the same connection pool.
 */
const serverless = require("serverless-http");
const app = require("../src/app");
const { ensureDb } = require("../src/config/db");

const handler = serverless(app, {
  // Vercel passes the path including the /api prefix — Express handles it as-is.
  request: (req) => {
    req.serverless = true;
  },
});

module.exports = async (req, res) => {
  try {
    await ensureDb();
    return handler(req, res);
  } catch (e) {
    console.error("Serverless handler failed:", e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, message: "SERVER_BOOT_FAILED" }));
  }
};
