import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { customAlphabet } from 'nanoid';
import { FaUser, FaDoorOpen, FaLock, FaSearch } from 'react-icons/fa';

function JoinARoom() {
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [isRoomListOpen, setIsRoomListOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    const handleRoomSelect = (roomData) => {
        setRoomName(roomData.name);
        setIsPasswordProtected(roomData.is_password_protected);
        setIsRoomListOpen(false);
    };

    const joinRoom = async (e) => {
        try {
            e.preventDefault();

            const generateID = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6);
            const userId = generateID();
            const UserName = `${userName}_( ${userId} )`;
            console.log('Generated username:', UserName);


            const response = await axios.put(`http://localhost:5000/chat-sphere/joinRoom/${roomName}`, 
                {
                    user: UserName,
                }
            );

            if (response.status === 200) {
                console.log('Joined roomData successfully:', response.data);

                // Redirect to the chat roomData with roomData details
                navigate(`/chat/${response.data._id}`, { state: { user: UserName } });

            } else {
                console.error('Failed to join roomData:', response.data);
            }
        }
        catch (error) {
            console.error('Error joining roomData:', error);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-10">
            <div className={`flex flex-col md:flex-row items-start justify-center gap-8 transition-all duration-300`}>
                {/* Join Room Form */}
                <div className="w-full md:w-[400px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md p-6 text-center">
                    <h1 className="text-3xl font-bold mb-6 text-green-400">Join a Room</h1>
                    <form>
                        {/* Name Field */}
                        <fieldset className="mb-6 text-left">
                            <legend className="text-sm px-2 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <FaUser className="text-blue-500" />
                                Name:
                            </legend>
                            <input
                                type="text"
                                placeholder="Enter Your Name"
                                className="w-full mt-1 border border-gray-400 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </fieldset>

                        {/* Room Selector */}
                        <fieldset className="mb-6 text-left">
                            <legend className="text-sm px-2 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <FaDoorOpen className="text-blue-500" />
                                Select Room:
                            </legend>
                            <div className="flex gap-2 mb-2">
                                <button
                                    type="button"
                                    className="w-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded border border-gray-400 dark:border-gray-600"
                                    onClick={() => {
                                        setIsRoomListOpen(!isRoomListOpen)
                                    }}
                                >
                                    {isRoomListOpen ? 'Hide Rooms' : 'Show Rooms'}
                                </button>
                                <input
                                    type="text"
                                    className="w-1/2 border border-gray-400 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Room Name"
                                    value={roomName}
                                    readOnly
                                />
                            </div>

                            {/* Password Input */}
                            {isPasswordProtected && (
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="password"
                                        placeholder="Enter Room Password"
                                        className="w-full border border-gray-400 dark:border-gray-600 rounded-md pl-10 pr-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                            )}
                        </fieldset>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 flex items-center justify-center gap-2"
                            onClick={(e) => { joinRoom(e) }}
                        >
                            <FaDoorOpen />
                            Join Room
                        </button>
                    </form>
                </div>

                {/* Room List */}
                {isRoomListOpen && <RoomList onSelect={handleRoomSelect} />}
            </div>
        </div>
    );
}

// Room List Component
function RoomList({ onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [rooms, setRooms] = useState([]);

    // API call to get all rooms list
    const getAllRooms = async () => {
        try {
            const response = await axios.get('http://localhost:5000/chat-sphere/getAllRooms');
            if (response.data) {
                console.log('Rooms fetched successfully:', response.data);
                setRooms(response.data);
            } else {
                console.error('No rooms found.');
            }
        }
        catch (error) {
            console.error('Error fetching rooms:', error);
        }
    }

    useEffect(() => {
        getAllRooms();
    }, []);

    const filteredRooms = rooms.filter((roomData) =>
        roomData.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-64 max-h-[460px] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300">
            <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Rooms"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-400 dark:border-gray-600 rounded-md pl-10 pr-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {filteredRooms.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No rooms found.</p>
            ) : (
                <ul className="space-y-2">
                    {filteredRooms.map((roomData, index) => (
                        <li
                            key={index}
                            onClick={() => onSelect(roomData)}
                            className="cursor-pointer border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-4 py-2 text-left transition flex items-center justify-between text-gray-800 dark:text-gray-200"
                        >
                            <span className="truncate">{roomData.name}</span>
                            {roomData.is_password_protected && (
                                <FaLock className="text-red-500 text-xs ml-2 flex-shrink-0" />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default JoinARoom;