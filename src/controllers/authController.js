const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config(); // Import dotenv and load environment variables from the .env file

// User Registration
const register = async (req, res) => {
  const { username, password, confirmPassword, email } = req.body;

  try {
    // Check if any required field is missing
    if (!username || !password || !confirmPassword || !email) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the user already exists
    const alreadyExists = await User.findOne({ email });
    if (alreadyExists) {
      return res.status(422).send({ error: "User already exists" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(422).send({ error: "Passwords do not match" });
    }

    // Create a new user
    const newUser = new User({
      username,
      password,
      email,
    });

    await newUser.save();
    return res.status(201).send({
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res
      .status(500)
      .send({ error: "Something went wrong. Please try again." });
  }
};

// User Login
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    //create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username }, //user data stored in token
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Respond with success
    return res.status(200).json({
      token,
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .send({ error: "Something went wrong. Please try again." });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const loggedInUserId = req.user.userId; // The userId from the JWT token attached by the middleware

  try {
    // Ensure that the logged-in user is the one trying to delete their account
    if (loggedInUserId !== id) {
      return res
        .status(403)
        .send({ error: "You can only delete your own account" });
    }

    // Find and delete the user by ID
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    return res.status(200).send({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error during deletion:", error);
    return res
      .status(500)
      .send({ error: "Something went wrong. Please try again." });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  const loggedInUserId = req.user.userId;

  try {
    if (loggedInUserId !== id) {
      return res
        .status(403)
        .send({ error: "Unauthorized to update this account" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).send({ error: "User not found" });
    }

    return res.status(200).send(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).send({ error: "Something went wrong." });
  }
};

// Get a Single User
const getUser = async (req, res) => {
  const { email } = req.body; // Get the email from the request body
  try {
    const user = await User.findOne({ email }); // Search for the user by email
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    return res.status(200).send(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).send({ error: "Something went wrong." });
  }
};

//USER POST APIs
//create a post
const createPost = async (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  const userId = id;

  try {
    const newPost = new Post({ title, content, user: userId });
    await newPost.save();
    return res.status(201).send(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).send({ error: "Something went wrong." });
  }
};

// Delete a Post
const deletePost = async (req, res) => {
  console.log("Delete Post route accessed"); // Add this line to confirm the route is hit

  const { postId } = req.params;
  const loggedInUserId = req.user.userId; // The userId from the JWT token attached by the middleware

  console.log("Logged-in User ID:", loggedInUserId);
  console.log("PostID:", postId);

  try {
    const post = await Post.findById(postId); // First, find the post by its ID
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    console.log("Post User ID:", post.user.toString()); // Log the post's user ID

    // Check if the logged-in user is the owner of the post (post.user holds the user ID)
    if (post.user.toString() !== loggedInUserId) {
      return res
        .status(403)
        .send({ error: "You can only delete your own post" });
    }

    // Delete the post if authorized
    await Post.findByIdAndDelete(postId);
    return res.status(200).send({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).send({ error: "Something went wrong." });
  }
};

//User gets all his posts
// Get all posts by the logged-in user
const getUserPosts = async (req, res) => {
  const loggedInUserId = req.user.userId; // Extract the userId from the JWT token

  try {
    // Find all posts by the logged-in user
    const posts = await Post.find({ user: loggedInUserId });

    if (!posts || posts.length === 0) {
      return res.status(404).send({ error: "No posts found for this user." });
    }

    // Send the list of posts if found
    return res.status(200).send(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).send({ error: "Something went wrong." });
  }
};

//Get one post
// Get a specific post by the logged-in user
const getUserPost = async (req, res) => {
  const { postId } = req.params; // Extract postId from the URL params
  const loggedInUserId = req.user.userId; // Extract the userId from the JWT token

  try {
    // Find the post by ID and ensure it belongs to the logged-in user
    const post = await Post.findById(postId);

    console.log(postId);

    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    // Check if the logged-in user is the owner of the post
    if (post.user.toString() !== loggedInUserId) {
      return res.status(403).send({ error: "You can only view your own post" });
    }

    // Send the post if found and authorized
    return res.status(200).send(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).send({ error: "Something went wrong." });
  }
};

// Export the functions
module.exports = {
  register,
  login,
  deleteUser,
  updateUser,
  getUser,
  createPost,
  deletePost,
  getUserPosts,
  getUserPost,
};
