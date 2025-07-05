const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
        trim: true,
    },
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    sent_at: {
        type: String,
        required: true,
    },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;