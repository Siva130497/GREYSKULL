const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "grayskull-dev-secret-change-me";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      shellId: user.shellId ? String(user.shellId) : null,
    },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
