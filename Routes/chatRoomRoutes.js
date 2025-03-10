const express = require("express");
const router = express.Router();
const { createChat, getChats, updateChat, deleteChat } = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const ChatRoom = require("../models/ChatRoom");
const { v4: uuidv4 } = require("uuid");

// Create Chat
router.post("/chats", authMiddleware, createChat);

// Get Chats
router.get("/chats", authMiddleware, getChats);

// Update Chat
router.put("/chats/:id", authMiddleware, roleMiddleware(["super"]), updateChat);

// Delete Chat
router.delete("/chats/:id", authMiddleware, roleMiddleware(["super"]), deleteChat);

// Create or Fetch a ChatRoom
router.post("/", async (req, res) => {
   const { user1, user2 } = req.body;
   try {
      let chatRoom = await ChatRoom.findOne({
         $or: [
            { user1, user2 },
            { user1: user2, user2: user1 }
         ]
      });

      if (!chatRoom) {
         const roomId = uuidv4();
         chatRoom = new ChatRoom({ roomId, user1, user2, messages: [] });
         await chatRoom.save();
      }

      res.status(200).json(chatRoom);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// Get ChatRoom Messages
router.get("/:roomId", async (req, res) => {
   try {
      const chatRoom = await ChatRoom.findOne({ roomId: req.params.roomId });
      if (!chatRoom) return res.status(404).json({ message: "ChatRoom not found" });
      res.status(200).json(chatRoom);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// Delete ChatRoom
router.delete("/:roomId", async (req, res) => {
   try {
      const chatRoom = await ChatRoom.findOneAndDelete({ roomId: req.params.roomId });
      if (!chatRoom) return res.status(404).json({ message: "ChatRoom not found" });
      res.status(200).json({ message: "ChatRoom deleted successfully" });
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// Send Message
router.post("/:roomId/messages", async (req, res) => {
    const { senderId, receiverId, message } = req.body;
    try {
        const chatRoom = await ChatRoom.findOne({ roomId: req.params.roomId });
        if (!chatRoom) return res.status(404).json({ message: "ChatRoom not found" });

        chatRoom.messages.push({ sender: senderId, receiver: receiverId, message, timestamp: new Date() });
        await chatRoom.save();

        res.status(200).json(chatRoom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
