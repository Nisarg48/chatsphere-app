const { createRoom, getRoomById, getRoomByName, getAllRooms, joinRoom, leaveRoom } = require('../Controllers/Room_Controller');
const { createMessage, getMessagesByRoomId } = require('../Controllers/Message_Controller');

const express = require('express');
const router = express.Router();

// Room Routes
router.post('/createRoom', createRoom);
router.get('/getRoomById/:id', getRoomById);
router.get('/getRoomByName/:name', getRoomByName);
router.get('/getAllRooms', getAllRooms);
router.put('/joinRoom/:name', joinRoom);
router.put('/leaveRoom/:id', leaveRoom);

// Message Routes
router.post('/createMessage', createMessage);
router.get('/getMessagesByRoomId/:roomId', getMessagesByRoomId);

module.exports = router;