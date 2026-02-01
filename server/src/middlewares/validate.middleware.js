function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      e.statusCode = 400;
      e.message = "VALIDATION_ERROR";
      e.details = e.errors;
      next(e);
    }
  };
}

module.exports = { validateBody };