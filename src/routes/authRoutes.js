// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  deleteUser,
  updateUser,
  getUser,

} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/getuser", getUser);
router.put("/update/:id", authMiddleware, updateUser);
router.delete("/delete/:id", authMiddleware, deleteUser);


module.exports = router;
