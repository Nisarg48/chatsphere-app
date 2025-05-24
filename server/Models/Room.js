const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null,
        required: true
    },
    password: {
        type: String,
        default: null,
        required: false,
    },
    is_password_protected: {
        type: Boolean,
        default: false,
        required: true,
    },
    users: {
        type: ["String"],
        required: false
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    expired_on: {
        type: Date,
        required: false
    },
});

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;