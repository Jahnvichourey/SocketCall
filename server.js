const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files from the "public" folder
app.use(express.static('public'));

// Route to render the video call screen
app.get('/', (req, res) => {
  res.render('video');  // Renders views/video.ejs
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ email, room }) => {
    socket.join(room);
    console.log(`${email} joined room: ${room}`);
  });
  
  socket.on('chatMessage', ({ room, message }) => {
  io.to(room).emit('chatMessage', { message }); // Broadcasting message to the clients in the room
  });

  socket.on('signal', (data) => {
    const { room, ...signalData } = data;
    socket.to(room).emit('signal', signalData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
