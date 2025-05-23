const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    is_password_protected: {
        type: Boolean,
        required: true
    },
    users: {
        type: Array,
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