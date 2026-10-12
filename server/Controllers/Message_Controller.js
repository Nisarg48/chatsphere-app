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

// Function to get all messages by roomData ID
exports.getMessagesByRoomId = async (req, res) => {
    try {
        const messages = await Message.find({ room_id: req.params.roomId });
        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Function to delete a message
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { sender } = req.body;
        
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }
        
        // Verify the sender matches (security check)
        if (message.sender !== sender) {
            return res.status(403).json({ message: 'You can only delete your own messages.' });
        }
        
        await Message.findByIdAndDelete(messageId);
        return res.status(200).json({ message: 'Message deleted successfully.' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}