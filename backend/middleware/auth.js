const { verifyAccessToken, computeFingerprint } = require("../utils/tokenUtils");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const fingerprint = computeFingerprint(req.headers["user-agent"]);
    const decoded = verifyAccessToken(token, fingerprint);
    req.user = decoded; // Contains userId
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};
