/**
 * Input Sanitization Middleware to prevent XSS, HTML injection, and control character injection.
 * Recursively cleans strings in req.body, req.query, and req.params.
 */

function sanitizeString(str) {
  if (typeof str !== "string") return str;

  return str
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove dangerous <script>, <iframe>, <object>, <embed>, <form> tags
    .replace(/<\s*(script|iframe|object|embed|form|link|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|form|link|style)[^>]*\/?\s*>/gi, "")
    // Remove inline event handlers like onerror=, onload=, onclick=
    .replace(/on\w+\s*=\s*(['"])[^'"]*\1/gi, "")
    .replace(/on\w+\s*=\s*[^>\s]+/gi, "")
    // Neutralize javascript: URIs
    .replace(/javascript\s*:/gi, "nojavascript:");
}

function sanitizeValue(value) {
  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === "object") {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      // Also sanitize keys if necessary
      const cleanKey = sanitizeString(key);
      cleaned[cleanKey] = sanitizeValue(value[key]);
    }
    return cleaned;
  }

  return value;
}

function sanitizeInput(req, res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
}

module.exports = sanitizeInput;
