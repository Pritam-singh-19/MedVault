const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;

    // Log all incoming request headers (for debugging)
    console.log("🔍 Backend Received Headers:", req.headers);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log("🟢 Extracted Token:", token);
    }

    if (!token) {
      console.log("🔴 No Token Found in Headers");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🟢 Decoded Token:", decoded);

      // Fetch user without password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log("🔴 User Not Found in Database");
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("🔴 JWT Verification Error:", error.message);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired, please log in again" });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token, authorization denied" });
      }

      return res.status(401).json({ message: "Token verification failed" });
    }
  } catch (error) {
    console.error("🔴 Auth Middleware Error:", error.message);
    return res.status(500).json({ message: "Server error, authentication failed" });
  }
};

module.exports = protect;
