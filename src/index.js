const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();
const PORT = 3000;
const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/axia-africa";

app.use(express.json());

app.use("/api/users", authRoutes);
app.use("/api/posts", postRoutes);

// Function to connect to the database and start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(DB_URI);
    console.log("Database connected successfully.");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the application:", error.message);
    process.exit(1); // Exit the process if there is an error
  }
};

// Call the function to start everything
startServer();
