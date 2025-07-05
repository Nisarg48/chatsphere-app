require('dotenv').config();
const express = require('express');
const connectDB = require('./DBConnection/connect');
const routes = require('./Routes/routes');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./Models/Message');
const Room = require('./Models/Room');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 10000,
});

const port = process.env.PORT || 5000;

app.use(cors({
    origin: "*",
}));
app.use(express.json());
app.use('/chat-sphere', routes);

const roomUsers = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', async ({ id, user }) => {
        try {
            const room = await Room.findById(id);
            if (!room) {
                socket.emit('error', { message: 'Room not found.' });
                return;
            }

            socket.join(id);
            console.log(`User ${user} (${socket.id}) joined room ${id}`);

            if (!roomUsers[id]) {
                roomUsers[id] = new Set();
            }
            if (!roomUsers[id].has(user)) {
                roomUsers[id].add(user);
                await Room.findOneAndUpdate(
                    { _id: id },
                    { $addToSet: { users: user } },
                    { new: true }
                );
            }

            io.to(id).emit('update-user-list', Array.from(roomUsers[id]));
            socket.data = { roomId: id, userName: user };
        } catch (err) {
            console.error('Error in join-room:', err);
            socket.emit('error', { message: 'Failed to join room.' });
        }
    });

    socket.on('send-message', async (messageData) => {
        try {
            const saved = await Message.create(messageData);
            io.to(messageData.room_id).emit('receive-message', saved);
        } catch (err) {
            console.error('Error saving message:', err);
            socket.emit('error', { message: 'Failed to send message.' });
        }
    });

    socket.on('leave-room', async ({ id, user }) => {
        try {
            if (id && user && roomUsers[id]) {
                roomUsers[id].delete(user);
                socket.leave(id);
                await Room.findOneAndUpdate(
                    { _id: id },
                    { $pull: { users: user } },
                    { new: true }
                );
                io.to(id).emit('update-user-list', Array.from(roomUsers[id]));
                console.log(`User ${user} left room ${id}`);
            } else {
                console.warn(`Invalid leave-room attempt: id=${id}, user=${user}`);
            }
        } catch (err) {
            console.error('Error in leave-room:', err);
            socket.emit('error', { message: 'Failed to leave room.' });
        }
    });

    socket.on('disconnect', async () => {
        try {
            const { roomId, userName } = socket.data || {};
            if (roomId && userName && roomUsers[roomId]) {
                roomUsers[roomId].delete(userName);
                await Room.findOneAndUpdate(
                    { _id: roomId },
                    { $pull: { users: userName } },
                    { new: true }
                );
                io.to(roomId).emit('update-user-list', Array.from(roomUsers[roomId]));
                console.log(`User ${userName} disconnected from room ${roomId}`);
            }
        } catch (err) {
            console.error('Error in disconnect:', err);
        }
        console.log('User disconnected:', socket.id);
    });
});

async function startServer() {
    try {
        await connectDB(process.env.CONNECTION_STRING);
        console.log('Connected to MongoDB');
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();