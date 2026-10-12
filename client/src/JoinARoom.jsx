import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { customAlphabet } from 'nanoid';
import { FaUser, FaDoorOpen, FaLock, FaSearch, FaUsers, FaClock, FaFilter, FaSortAmountDown } from 'react-icons/fa';

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

            if (!userName.trim()) {
                alert('Please enter your name');
                return;
            }

            if (!roomName) {
                alert('Please select a room');
                return;
            }

            // For protected rooms, we should validate password (this would need backend support)
            // For now, we'll proceed with the join

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
            alert('Failed to join room. Please try again.');
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
    const [filterType, setFilterType] = useState('all'); // all, open, protected
    const [sortBy, setSortBy] = useState('newest'); // newest, users

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

    // Filter and sort rooms
    const filteredRooms = rooms
        .filter((roomData) => {
            const matchesSearch = roomData.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = 
                filterType === 'all' ||
                (filterType === 'open' && !roomData.is_password_protected) ||
                (filterType === 'protected' && roomData.is_password_protected);
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.created_on) - new Date(a.created_on);
            } else if (sortBy === 'users') {
                return (b.userCount || 0) - (a.userCount || 0);
            }
            return 0;
        });

    // Format relative time
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className="w-72 max-h-[500px] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300">
            {/* Search */}
            <div className="relative mb-3">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Rooms"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-400 dark:border-gray-600 rounded-md pl-10 pr-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                    <FaFilter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full border border-gray-400 dark:border-gray-600 rounded-md pl-7 pr-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                    >
                        <option value="all">All Rooms</option>
                        <option value="open">Open</option>
                        <option value="protected">Protected</option>
                    </select>
                </div>
                <div className="relative flex-1">
                    <FaSortAmountDown className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full border border-gray-400 dark:border-gray-600 rounded-md pl-7 pr-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                    >
                        <option value="newest">Newest</option>
                        <option value="users">Most Users</option>
                    </select>
                </div>
            </div>

            {/* Room Count */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
            </p>

            {filteredRooms.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No rooms found.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {filteredRooms.map((roomData, index) => (
                        <li
                            key={index}
                            onClick={() => onSelect(roomData)}
                            className="cursor-pointer border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-2 text-left transition text-gray-800 dark:text-gray-200"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm truncate flex-1">{roomData.name}</span>
                                {roomData.is_password_protected && (
                                    <FaLock className="text-red-500 text-xs ml-2 flex-shrink-0" />
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <FaUsers className="text-xs" />
                                    {roomData.userCount || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FaClock className="text-xs" />
                                    {getRelativeTime(roomData.created_on)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default JoinARoom;