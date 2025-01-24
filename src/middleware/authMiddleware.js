const jwt = require("jsonwebtoken");

require("dotenv").config(); // Ensure dotenv is loaded

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // Extract token from header

  if (!token) {
    return res.status(401).json({ error: "Access denied, no token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify the token using the secret key
    req.user = decoded; // Attach decoded user data (userId, username) to the request object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authMiddleware;
