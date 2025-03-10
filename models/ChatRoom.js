const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
   roomId: { type: String, required: true, unique: true },
   user1: { type: String, required: true },
   user2: { type: String, required: true },
   messages: [
      {
         sender: { type: String, required: true },
         receiver: { type: String, required: true },
         message: { type: String, required: true },
         timestamp: { type: Date, default: Date.now },
      }
   ]
}, { timestamps: true });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
