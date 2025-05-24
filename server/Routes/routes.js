const { createRoom,
        getRoomByName,
        getAllRooms,
        joinRoom,
        leaveRoom } = require("../Controllers/Room_Controller");

const { createMessage } = require("../Controllers/Message_Controller");

const express = require("express");
const router = express.Router();

// Room Routes
router.post("/createRoom", createRoom); // Create a new room
router.get("/getRoomByName/:name", getRoomByName); // Get a room by name
router.get("/getAllRooms", getAllRooms); // Get all rooms
router.put("/joinRoom/:name", joinRoom); // Join a room
router.put("/leaveRoom/:name", leaveRoom); // Leave a room

// Message Routes
router.post("/createMessage", createMessage); // Create a new message

module.exports = router;