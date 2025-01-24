const User = require("../models/User");
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

// Export the functions
module.exports = {
  register,
  login,
  deleteUser,
};
