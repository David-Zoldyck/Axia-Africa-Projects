// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  deleteUser,
  updateUser,
  getUser,
  createPost,
  deletePost,
  getUserPosts,
  getUserPost
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/getuser", getUser);
router.put("/update/:id", authMiddleware, updateUser);
router.delete("/delete/:id", authMiddleware, deleteUser);
router.post("/newpost/:id", createPost);
router.delete("/deletepost/:postId", authMiddleware, deletePost);
router.get("/getuserposts", authMiddleware, getUserPosts);
router.get("/getuserpost/:postId", authMiddleware, getUserPost);

module.exports = router;
