const express = require("express");
const cors = require("cors");

const { corsOptions } = require("./config/cors");
const { requestLogger } = require("./middlewares/requestLogger.middleware");
const { errorMiddleware } = require("./middlewares/error.middleware");

const shellRoutes = require("./routes/shell.routes");
const staffRoutes = require("./routes/staff.routes");
const authRoutes = require("./routes/auth.routes");
const diaryRoutes = require("./routes/diary.routes");
const issueTypeRoutes = require("./routes/issueType.routes");
const mediaRoutes = require("./routes/media.routes");
const weatherRoutes = require("./routes/weather.routes");
const tradingRoutes = require("./routes/trading.routes");
const costaFaultRoutes = require("./routes/costaFault.routes");
const planogramRoutes = require("./routes/planogram.routes");

const app = express();

// CORS allowlist: local dev origins + anything passed via env (comma-separated).
// Set CLIENT_URL on Fly to your Vercel URL — multiple allowed, e.g.
//   fly secrets set CLIENT_URL="https://grayskull.vercel.app,https://www.grayskull.com"
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin and tools like curl/postman (no origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // Permit any *.vercel.app preview deployment (handy for branch previews)
      try {
        const host = new URL(origin).hostname;
        if (host.endsWith(".vercel.app")) return cb(null, true);
      } catch {}
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "12mb" })); // planogram photo uploads (client resizes to ~200-400KB but leave headroom)
app.use(requestLogger);

app.get("/health", (req, res) => res.json({ ok: true, service: "station-diary-api" }));


app.use("/api/shells", shellRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/issue-types", issueTypeRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/stock", require("./routes/stockRoutes"));
app.use("/api/trading", tradingRoutes);
app.use("/api/costa-faults", costaFaultRoutes);
app.use("/api/planograms", planogramRoutes);

// error handler LAST
app.use(errorMiddleware);

module.exports = app;