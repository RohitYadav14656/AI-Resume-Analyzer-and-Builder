/**
 * Zod validation middleware factory.
 * Usage: router.post("/route", validate(schema), handler)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(422).json({ error: "Validation failed", errors });
  }
  // Replace req.body with the parsed (and possibly coerced) data
  req.body = result.data;
  next();
};

module.exports = validate;
