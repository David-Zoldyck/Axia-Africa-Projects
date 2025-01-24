// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  deleteUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.delete("/delete/:id", authMiddleware, deleteUser);

module.exports = router;
