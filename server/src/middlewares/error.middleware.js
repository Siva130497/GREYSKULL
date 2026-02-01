const { fail } = require("../utils/response.util");

function errorMiddleware(err, req, res, next) {
  console.error("❌ Error:", err);

  const status = err.statusCode || 500;
  const message = err.message || "INTERNAL_SERVER_ERROR";
  return fail(res, status, message);
}

module.exports = { errorMiddleware };