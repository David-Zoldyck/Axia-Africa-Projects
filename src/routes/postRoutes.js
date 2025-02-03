// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const {
  createPost,
  deletePost,
  getUserPosts,
  getUserPost,
} = require("../controllers/authController"); // If posts are in authController, consider renaming it to postController

const authMiddleware = require("../middleware/authMiddleware");

router.post("/newpost/:id", authMiddleware, createPost);
router.delete("/deletepost/:postId", authMiddleware, deletePost);
router.get("/getuserposts", authMiddleware, getUserPosts);
router.get("/getuserpost/:postId", authMiddleware, getUserPost);

module.exports = router;
