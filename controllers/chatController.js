const Chat = require("../models/Chat");

// Create Chat (accessible by both Super Users and Subusers)
exports.createChat = async (req, res) => {
  try {
    // Ensure the request is authenticated (Implement middleware later)

    const { sender, receiver, message } = req.body;

    // Validate required parameters
    if (!sender || !receiver || !message) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Create the chat message
    const chat = new Chat({
      sender,
      receiver,
      message
    });

    await chat.save();

    res.status(201).json({ message: "Chat message created successfully", chat });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Chats (accessible by both Super Users and Subusers)
exports.getChats = async (req, res) => {
  try {
    // Ensure the request is authenticated (Implement middleware later)

    // Fetch a list of chat messages
    const chats = await Chat.find(); // Modify this to filter by user/room later

    res.status(200).json({ message: "Chat messages retrieved successfully", chats });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Update Chat (accessible by Super Users)
exports.updateChat = async (req, res) => {
  try {
    // Ensure the request is authenticated and the requester is a super user (Implement middleware later)

    const { id } = req.params;
    const { sender, receiver, message } = req.body;

    // Validate required parameters
    if (!sender || !receiver || !message) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Find the chat message by ID
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: "Chat message not found" });
    }

    // Update the chat message details
    chat.sender = sender;
    chat.receiver = receiver;
    chat.message = message;

    await chat.save();

    res.status(200).json({ message: "Chat message updated successfully", chat });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Chat (accessible by Super Users)
exports.deleteChat = async (req, res) => {
  try {
    // Ensure the request is authenticated and the requester is a super user (Implement middleware later)

    const { id } = req.params;

    // Find the chat message by ID
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: "Chat message not found" });
    }

    await Chat.findByIdAndDelete(id);

    res.status(200).json({ message: "Chat message deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
