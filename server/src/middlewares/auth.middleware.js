const { verifyToken } = require("../utils/jwt.util");
const Staff = require("../models/Staff.model");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ ok: false, message: "UNAUTHORIZED" });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ ok: false, message: "INVALID_TOKEN" });
    }

    const user = await Staff.findById(payload.sub).lean();
    if (!user || user.isActive === false) {
      return res.status(401).json({ ok: false, message: "USER_NOT_FOUND" });
    }

    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "UNAUTHORIZED" });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: "FORBIDDEN" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
