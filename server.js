const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(bodyParser.json());

let users = []; // In-memory user storage
let messages = []; // In-memory message storage

// User registration endpoint
app.post('/register', (req, res) => {
    const { username } = req.body;
    if (users.includes(username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }
    users.push(username);
    res.status(201).json({ message: 'User registered' });
});

// Fetch messages endpoint
app.get('/messages', (req, res) => {
    res.json(messages);
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    // Listen for messages from clients
    socket.on('sendMessage', (data) => {
        messages.push(data);
        io.emit('receiveMessage', data); // Broadcast the message to all clients
    });

    // Optional: Send the existing messages to the newly connected client
    socket.emit('existingMessages', messages);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
