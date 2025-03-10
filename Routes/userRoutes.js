const express = require("express");
const router = express.Router();
const { registerSuperUser, registerSubUser, loginUser, resetPassword } = require("../controllers/authController");
const { createSubuser, getSubusers, updateSubuser, deleteSubuser } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Register Super User
router.post("/register/super", registerSuperUser);

// Register Sub User
router.post("/register/sub", registerSubUser);

// Login User
router.post("/login", loginUser);

// Reset Password
router.put("/reset-password", resetPassword);

// Create Subuser (only accessible by Super Users)
router.post("/subusers", authMiddleware, roleMiddleware(["super"]), createSubuser);

// Get Subusers (only accessible by Super Users)
router.get("/subusers", authMiddleware, roleMiddleware(["super"]), getSubusers);

// Update Subuser (only accessible by Super Users)
router.put("/subusers/:id", authMiddleware, roleMiddleware(["super"]), updateSubuser);

// Delete Subuser (only accessible by Super Users)
router.delete("/subusers/:id", authMiddleware, roleMiddleware(["super"]), deleteSubuser);

// Register User
router.post("/register", async (req, res) => {
  const { email, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ userId: uuidv4(), email, name });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User
router.get("/:userId", async (req, res) => {
   try {
      const user = await User.findOne({ userId: req.params.userId });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json(user);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

module.exports = router;
