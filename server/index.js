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
const typingUsers = {};

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

            // Initialize roomUsers if not exists
            if (!roomUsers[id]) {
                roomUsers[id] = new Set();
                // Populate from database users array on first join (for server restart scenario)
                if (room.users && room.users.length > 0) {
                    room.users.forEach(dbUser => {
                        roomUsers[id].add(dbUser);
                    });
                }
            }

            const isNewUser = !roomUsers[id].has(user);
            if (isNewUser) {
                roomUsers[id].add(user);
                await Room.findOneAndUpdate(
                    { _id: id },
                    { $addToSet: { users: user } },
                    { new: true }
                );
            }

            io.to(id).emit('update-user-list', Array.from(roomUsers[id]));
            socket.data = { roomId: id, userName: user };
            
            // Emit join notification if user was not already in room
            if (isNewUser) {
                io.to(id).emit('user-joined', { user, timestamp: new Date().toISOString() });
            }
        } catch (err) {
            console.error('Error in join-room:', err);
            socket.emit('error', { message: 'Failed to join room.' });
        }
    });

    socket.on('send-message', async (messageData) => {
        try {
            const saved = await Message.create(messageData);
            io.to(messageData.room_id).emit('receive-message', saved);
            
            // Clear typing status for the sender
            if (typingUsers[messageData.room_id]) {
                typingUsers[messageData.room_id].delete(messageData.sender);
                io.to(messageData.room_id).emit('typing-status', Array.from(typingUsers[messageData.room_id] || []));
            }
        } catch (err) {
            console.error('Error saving message:', err);
            socket.emit('error', { message: 'Failed to send message.' });
        }
    });

    socket.on('delete-message', async ({ messageId, roomId, user }) => {
        try {
            const message = await Message.findById(messageId);
            if (!message) {
                socket.emit('error', { message: 'Message not found.' });
                return;
            }
            
            if (message.sender !== user) {
                socket.emit('error', { message: 'You can only delete your own messages.' });
                return;
            }
            
            await Message.findByIdAndDelete(messageId);
            io.to(roomId).emit('message-deleted', messageId);
        } catch (err) {
            console.error('Error deleting message:', err);
            socket.emit('error', { message: 'Failed to delete message.' });
        }
    });

    socket.on('typing-start', ({ id, user }) => {
        if (!typingUsers[id]) {
            typingUsers[id] = new Set();
        }
        typingUsers[id].add(user);
        io.to(id).emit('typing-status', Array.from(typingUsers[id]));
    });

    socket.on('typing-stop', ({ id, user }) => {
        if (typingUsers[id]) {
            typingUsers[id].delete(user);
            io.to(id).emit('typing-status', Array.from(typingUsers[id]));
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
                io.to(id).emit('user-left', { user, timestamp: new Date().toISOString() });
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