const corsOptions = {
  origin: (origin, cb) => {
    // Allow server-to-server, curl, postman
    if (!origin) return cb(null, true);

    // In development, allow all origins (fast + no headaches)
    if (process.env.NODE_ENV !== "production") {
      return cb(null, true);
    }

    const allowed = (process.env.CORS_ORIGIN || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  credentials: true
};

module.exports = { corsOptions };