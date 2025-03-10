require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Store users in each room
const users = {};

// Import Models
const Users = require("./models/Users");
const ChatRoom = require("./models/ChatRoom");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {});

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
})
   .then(() => console.log("MongoDB Connected"))
   .catch(err => console.error(err));
// Socket connection

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files from the "public" folder
app.use(express.static('public'));

// Route to render messege.ejs
app.get('/', (req, res) => {
  res.render('message');  // Renders views/message.ejs
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', async ({ email, room, token }) => {
    socket.join(room);
    console.log(`${email} joined room: ${room}`);

    // Store the email on the socket object
    socket.email = email;

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        socket.disconnect(true); // Disconnect the socket if verification fails
        return;
      }
      // Call the /messages endpoint to get the messages
      try {
        const response = await axios.get(`http://localhost:3003/api/chatrooms/${room}`);
        const messages = response.data.messages.slice(-50);
        socket.emit('loadMessages', messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from the room's user list
    for (const room in users) {
      const index = users[room].indexOf(socket.email);
      if (index !== -1) {
        users[room].splice(index, 1);
        if (users[room].length === 0) {
          delete users[room];
        }
        break;
      }
    }
  });
  
  socket.on('chatMessage', async ({ room, message, email }) => {
    // Determine the receiver
    let receiver = null;
    if (users[room] && users[room].length > 1) {
      receiver = users[room].find(user => user !== email);
    }

    // Call the /messages endpoint to save the message
    try {
      await axios.post(`http://localhost:3003/api/chatrooms/${room}/messages`, {
        senderId: email,
        receiverId: email,
        message: message,
      });
      io.to(room).emit('chatMessage', { message, email }); // Broadcasting message to the clients in the room
    } catch (error) {
      console.error("Error saving message to chat room:", error);
    }
  });

  // When a client sends a signaling message, broadcast it to others
  socket.on('signal', (data) => {
    const { room, ...signalData } = data;
    socket.to(room).emit('signal', signalData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
// Import API Routes
app.use("/api/users", require("./Routes/userRoutes"));
app.use("/api/chatrooms", require("./Routes/chatRoomRoutes"));

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/public/chat.html');
});

// Start Server
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
