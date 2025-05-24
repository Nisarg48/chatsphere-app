const Room = require("../Models/Room");

function generateNumericSuffix() {
    return Date.now().toString().slice(-6);
}

// Function to create a new room
exports.createRoom = async (req, res) => {
    const { name, description, password, is_password_protected, expired_on } = req.body;

    // Validate input
    if (!name || !description) {
        return res.status(400).json({ message: "Name and description are required." });
    }

    if (is_password_protected && !password) {
        return res.status(400).json({ message: "Password is required for password-protected rooms." });
    }

    if (is_password_protected && expired_on && new Date(expired_on) <= new Date()) {
        return res.status(400).json({ message: "Expiration date must be in the future." });
    }

    try {
        const suffix = generateNumericSuffix();
        const uniqueRoomName = `${name}_${suffix}`;

        const room = new Room({
            name: uniqueRoomName,
            description,
            password: is_password_protected ? password : null,
            is_password_protected,
            expired_on,
        });

        await room.save();
        return res.status(201).json(room);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Function to get room by Name
exports.getRoomByName = async (req, res) => {
    try {
        const room = await Room.findOne({ name: req.params.name });
        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        }
        return res.status(200).json(room);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Function to get all rooms list
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        return res.status(200).json(rooms);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Function to update room details -> When User joins the room then add it's name in users array
exports.joinRoom = async (req, res) => {
    try {
        const room = await Room.findOneAndUpdate({ name: req.params.name }, { $push: { users: req.body.user } }, { new: true });
        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        }
        return res.status(200).json(room);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Function to update room details -> When User leaves the room then remove it's name from users array
exports.leaveRoom = async (req, res) => {
    try {
        const room = await Room.findOneAndUpdate({ name: req.params.name }, { $pull: { users: req.body.user } }, { new: true });
        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        }
        return res.status(200).json(room);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};