const express = require('express');
const http = require('http');
const mongoose = require('./config/db');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('joinRoom', ({ room, username }) => {
        socket.join(room);
        io.to(room).emit('receiveMessage', { user: 'Chat Bot', message: `${username} has joined the room.` });
    });

    // Leave a room
    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        io.to(room).emit('receiveMessage', { user: 'Chat Bot', message: `A user has left ${room}` });
    });

    // Save and send group messages
    socket.on('sendMessage', async ({ room, message, user }) => {
        const newMessage = new GroupMessage({ from_user: user, room, message });
        await newMessage.save();
        io.to(room).emit('receiveMessage', { user, message });
    });

    // Save and send private messages
    socket.on('sendPrivateMessage', async ({ from_user, to_user, message }) => {
        const newMessage = new PrivateMessage({ from_user, to_user, message });
        await newMessage.save();
        io.to(to_user).emit('receivePrivateMessage', { from_user, message });
    });

    // Typing Indicator
    socket.on('typing', ({ room, user }) => {
        socket.to(room).emit('userTyping', { user });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
