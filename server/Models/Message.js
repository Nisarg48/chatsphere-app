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
        default: () => formatDate(Date.now),
    },
});

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
}

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;