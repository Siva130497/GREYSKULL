const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff.model");
const Shell = require("../models/Shell.model");
const { signToken } = require("../utils/jwt.util");
const { ok } = require("../utils/response.util");

function publicUser(user, shell) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    shell: shell ? { _id: shell._id, name: shell.name } : null,
  };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "EMAIL_AND_PASSWORD_REQUIRED" });
    }

    const user = await Staff.findOne({
      email: String(email).toLowerCase().trim(),
    });
    if (!user || user.isActive === false) {
      return res.status(401).json({ ok: false, message: "INVALID_CREDENTIALS" });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ ok: false, message: "INVALID_CREDENTIALS" });
    }

    let shell = null;
    if (user.shellId) {
      shell = await Shell.findById(user.shellId).lean();
    }

    const token = signToken(user);
    return ok(res, { token, user: publicUser(user, shell) }, "LOGIN_OK");
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    let shell = null;
    if (req.user.shellId) {
      shell = await Shell.findById(req.user.shellId).lean();
    }
    return ok(res, { user: publicUser(req.user, shell) });
  } catch (e) {
    next(e);
  }
}

module.exports = { login, me };
