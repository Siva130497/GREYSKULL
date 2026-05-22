require("dotenv").config();
const app = require("./app");

// When `node src/index.js` is run directly (local dev or `npm start`),
// connect to Mongo and listen on PORT. When this file is `require()`d by
// Vercel's Express runtime, we just export the app and let the request
// middleware in app.js ensure the DB is connected per-invocation.
if (require.main === module) {
  const { connectDB } = require("./config/db");
  const PORT = process.env.PORT || 5050;

  (async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })();
}

module.exports = app;
