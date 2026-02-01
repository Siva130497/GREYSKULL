function ok(res, data = null, message = "SUCCESS") {
  return res.json({ ok: true, message, data });
}

function fail(res, status = 400, message = "FAILED", data = null) {
  return res.status(status).json({ ok: false, message, data });
}

module.exports = { ok, fail };