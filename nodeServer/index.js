const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Custom CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // Specific origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(204); // No Content
    } else {
        next();
    }
});

const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // Client's URL
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on('connection', (socket) => {
  // If any new user joins, let other users connected to the server know!
  socket.on('new-user-joined', (names) => {
    users[socket.id] = names;
    socket.broadcast.emit('user-joined', names);
  });

  // If someone sends a message, broadcast it to other people
  socket.on('send', (message) => {
    socket.broadcast.emit('receive', { message: message, names: users[socket.id] });
  });

  // If someone leaves the chat, let others know
  socket.on('disconnect', () => {
    socket.broadcast.emit('left', users[socket.id]);
    delete users[socket.id];
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
