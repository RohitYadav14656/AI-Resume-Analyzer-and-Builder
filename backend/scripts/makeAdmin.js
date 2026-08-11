require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email) {
  console.log("Usage: node scripts/makeAdmin.js <user-email> [new-password]");
  console.log("Example: node scripts/makeAdmin.js admin@example.com admin123");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI environment variable is missing.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.error(`User with email '${email}' not found.`);
      process.exit(1);
    }

    user.role = "admin";

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      console.log(`Password updated for user '${user.email}'.`);
    }

    await user.save();
    console.log(`Success! User '${user.name}' (${user.email}) is an ADMIN.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });
