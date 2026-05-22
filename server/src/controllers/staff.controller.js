const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff.model");
const Shell = require("../models/Shell.model");
const { ok } = require("../utils/response.util");

function sanitize(user) {
  if (!user) return user;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  return obj;
}

// Public: used by the old login flow's staff picker. Now only returns
// staff/managers (super admins are hidden) so the login dropdown stays clean.
async function listStaffByShell(req, res, next) {
  try {
    const { shellId } = req.params;
    const staff = await Staff.find({
      shellId,
      isActive: true,
      role: { $in: ["manager", "staff"] },
    })
      .sort({ name: 1 })
      .select("-passwordHash")
      .lean();
    return ok(res, staff);
  } catch (e) {
    next(e);
  }
}

// Admin: list everyone or filter by shell + role
async function listStaff(req, res, next) {
  try {
    const { shellId, role } = req.query;
    const filter = {};
    if (shellId) filter.shellId = shellId;
    if (role) filter.role = role;

    const staff = await Staff.find(filter)
      .sort({ role: 1, name: 1 })
      .select("-passwordHash")
      .populate("shellId", "name")
      .lean();

    return ok(res, staff);
  } catch (e) {
    next(e);
  }
}

// Admin: create manager, staff, or another super_admin.
// super_admin records are cluster-wide and don't need a shellId.
async function createStaff(req, res, next) {
  try {
    const { name, email, password, role, shellId } = req.body || {};

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ ok: false, message: "NAME_EMAIL_PASSWORD_ROLE_REQUIRED" });
    }
    if (!["manager", "staff", "super_admin"].includes(role)) {
      return res.status(400).json({ ok: false, message: "INVALID_ROLE" });
    }
    if (role !== "super_admin" && !shellId) {
      return res
        .status(400)
        .json({ ok: false, message: "SHELL_ID_REQUIRED_FOR_ROLE" });
    }

    if (shellId) {
      const shell = await Shell.findById(shellId).lean();
      if (!shell) {
        return res.status(404).json({ ok: false, message: "SHELL_NOT_FOUND" });
      }
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = await Staff.findOne({ email: cleanEmail }).lean();
    if (existing) {
      return res.status(409).json({ ok: false, message: "EMAIL_ALREADY_USED" });
    }

    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ ok: false, message: "PASSWORD_MIN_6_CHARS" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await Staff.create({
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash,
      role,
      shellId: role === "super_admin" ? null : shellId,
    });

    return ok(res, sanitize(created), "STAFF_CREATED");
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ ok: false, message: "EMAIL_ALREADY_USED" });
    }
    next(e);
  }
}

// Admin: update name, role, shell, password, isActive
async function updateStaff(req, res, next) {
  try {
    const { id } = req.params;
    const { name, role, shellId, password, isActive } = req.body || {};

    const user = await Staff.findById(id);
    if (!user) {
      return res.status(404).json({ ok: false, message: "STAFF_NOT_FOUND" });
    }
    // Prevent self-modification to avoid locking yourself out of the cluster
    if (String(user._id) === String(req.user._id)) {
      return res.status(403).json({ ok: false, message: "CANNOT_MODIFY_SELF" });
    }

    if (typeof name === "string" && name.trim()) user.name = name.trim();
    if (role && ["manager", "staff", "super_admin"].includes(role)) {
      user.role = role;
      if (role === "super_admin") user.shellId = null;
    }
    if (shellId && user.role !== "super_admin") user.shellId = shellId;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (password) {
      if (String(password).length < 6) {
        return res
          .status(400)
          .json({ ok: false, message: "PASSWORD_MIN_6_CHARS" });
      }
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();
    return ok(res, sanitize(user), "STAFF_UPDATED");
  } catch (e) {
    next(e);
  }
}

// Admin: hard delete (a real app would soft-delete via isActive)
async function deleteStaff(req, res, next) {
  try {
    const { id } = req.params;
    const user = await Staff.findById(id);
    if (!user) {
      return res.status(404).json({ ok: false, message: "STAFF_NOT_FOUND" });
    }
    // Block self-delete so the cluster can't end up with zero super_admins
    if (String(user._id) === String(req.user._id)) {
      return res.status(403).json({ ok: false, message: "CANNOT_DELETE_SELF" });
    }
    await Staff.deleteOne({ _id: id });
    return ok(res, { _id: id }, "STAFF_DELETED");
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listStaffByShell,
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};
