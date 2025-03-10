const jwt = require('jsonwebtoken');
const User = require("../models/Users");
const { v4: uuidv4 } = require("uuid");

// Register Super User
exports.registerSuperUser = async (req, res) => {
  const { name, email, password, contactInfo, companyName } = req.body;

  try {
    // Validate required parameters
    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate a unique secret key
    const secretKey = uuidv4();

    // Generate a unique userId
    const userId = uuidv4();

    // Create the super user
    user = new User({
      userId: userId,
      name,
      email,
      password,
      contactInfo,
      companyName,
      secretKey,
      role: "super",
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "Super user registered successfully", user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reset Password (For Super Users)
exports.resetPassword = async (req, res) => {
  const { email, oldPassword, newPassword, secretKey } = req.body;

  try {
    // Validate required parameters
    if (!email || (!oldPassword && !secretKey) || !newPassword) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Ensure the user is a super user
    if (user.role !== "super") {
      return res.status(403).json({ message: "Unauthorized: Only super users can reset passwords" });
    }

    // Validate old password or secret key
    if (oldPassword) {
      if (user.password !== oldPassword) {
        return res.status(400).json({ message: "Invalid old password" });
      }
    } else if (secretKey) {
      if (user.secretKey !== secretKey) {
        return res.status(400).json({ message: "Invalid secret key" });
      }
    }

    // Update the password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Register Sub User
exports.registerSubUser = async (req, res) => {
  const { name, email, password, contactInfo } = req.body;

  try {
    // Validate required parameters
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate a unique userId
    const userId = uuidv4();

    // Generate a unique secret key
    const secretKey = uuidv4();

    // Create the sub user
    user = new User({
      userId: userId,
      name,
      email,
      password,
      contactInfo,
      secretKey,
      role: "sub"
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "Sub user registered successfully", user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required parameters
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate password (for now, compare plain text passwords)
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Return success response
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
