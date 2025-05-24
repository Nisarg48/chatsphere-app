const Message = require("../Models/Message");

// Function to create a new message
exports.createMessage = async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save();
        return res.status(201).json(message);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};