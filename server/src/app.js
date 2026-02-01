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

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.CLIENT_URL, // Render frontend URL
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
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

// error handler LAST
app.use(errorMiddleware);

module.exports = app;