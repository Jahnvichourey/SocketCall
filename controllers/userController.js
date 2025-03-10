const User = require("../models/Users");

// Create Subuser (only accessible by Super Users)
exports.createSubuser = async (req, res) => {
  try {
    // Ensure the request is authenticated and the requester is a super user (Implement middleware later)

    const { name, email, password, contactInfo } = req.body;

    // Validate required parameters
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create the sub user
    user = new User({
      name,
      email,
      password,
      contactInfo,
      role: "sub"
    });

    await user.save();

    res.status(201).json({ message: "Sub user created successfully", user });

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

// Get Subusers (only accessible by Super Users)
exports.getSubusers = async (req, res) => {
  try {
    // Ensure the request is authenticated and the requester is a super user (Implement middleware later)

    // Fetch a list of subusers created by the logged-in super user.
    const subusers = await User.find({ role: "sub" }); // Modify this to filter by super user later

    res.status(200).json({ message: "Sub users retrieved successfully", subusers });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Subuser (only accessible by Super Users)
exports.updateSubuser = async (req, res) => {
  try {
    // Ensure the request is authenticated and the requester is a super user (Implement middleware later)

    const { id } = req.params;
    const { name, email, password, contactInfo } = req.body;

    // Validate required parameters
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Find the subuser by ID
    const subuser = await User.findById(id);

    if (!subuser) {
      return res.status(404).json({ message: "Subuser not found" });
    }

    // Update the subuser details
    subuser.name = name;
    subuser.email = email;
    subuser.password = password;
    subuser.contactInfo = contactInfo;

    await subuser.save();

    res.status(200).json({ message: "Sub user updated successfully", subuser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Subuser (only accessible by Super Users)
exports.deleteSubuser = async (req, res) => {
  try {
    // Ensure the request is authenticated and the requester is a super user (Implement middleware later)

    const { id } = req.params;

    // Find the subuser by ID
    const subuser = await User.findById(id);

    if (!subuser) {
      return res.status(404).json({ message: "Subuser not found" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "Sub user deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
