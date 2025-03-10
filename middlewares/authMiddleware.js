const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization").replace("Bearer ", "");

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user by ID
    const user = await User.findOne({ userId: decoded.userId });

    if (!user) {
      throw new Error();
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = authMiddleware;
