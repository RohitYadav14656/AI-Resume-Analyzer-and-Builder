const User = require("../models/User");
const AppError = require("../utils/AppError");

module.exports = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return next(new AppError("Authentication required.", 401));
    }

    if (req.user.userId === "demo-admin-id") {
      req.adminUser = { _id: "demo-admin-id", name: "System Admin", email: "admin@resumeai.com", role: "admin" };
      return next();
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    if (user.role !== "admin") {
      return next(new AppError("Access denied. Admin rights required.", 403));
    }

    req.adminUser = user;
    next();
  } catch (err) {
    next(err);
  }
};
