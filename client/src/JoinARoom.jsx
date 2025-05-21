import React, { useState } from 'react';

function JoinARoom() {
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [isRoomListOpen, setIsRoomListOpen] = useState(false);

    const handleRoomSelect = (room) => {
        setRoomName(room.name);
        setIsPasswordProtected(room.protected);
        setIsRoomListOpen(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
            <div className={`flex flex-col md:flex-row items-start justify-center gap-8 transition-all duration-300`}>
                {/* Join Room Form */}
                <div className="w-full md:w-[400px] bg-white border border-gray-300 rounded-lg shadow-md p-6 text-center">
                    <h1 className="text-3xl font-bold mb-6 text-green-400">Join a Room</h1>
                    <form>
                        {/* Name Field */}
                        <fieldset className="mb-6 text-left">
                            <legend className="text-sm px-2 text-gray-600">Name:</legend>
                            <input
                                type="text"
                                placeholder="Enter Your Name"
                                className="w-full mt-1 border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </fieldset>

                        {/* Room Selector */}
                        <fieldset className="mb-6 text-left">
                            <legend className="text-sm px-2 text-gray-600">Select Room:</legend>
                            <div className="flex gap-2 mb-2">
                                <button
                                    type="button"
                                    className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded border border-gray-400"
                                    onClick={() => setIsRoomListOpen(!isRoomListOpen)}
                                >
                                    {isRoomListOpen ? 'Hide Rooms' : 'Show Rooms'}
                                </button>
                                <input
                                    type="text"
                                    className="w-1/2 border border-gray-400 rounded-md px-3 py-2 bg-gray-100"
                                    placeholder="Room Name"
                                    value={roomName}
                                    readOnly
                                />
                            </div>

                            {/* Password Input */}
                            {isPasswordProtected && (
                                <input
                                    type="text"
                                    name="password"
                                    placeholder="Enter Room Password"
                                    className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            )}
                        </fieldset>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
                        >
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

    const rooms = [
        { name: 'General', protected: false },
        { name: 'Project-X', protected: true },
        { name: 'OpenRoom', protected: false },
        { name: 'PrivateTeam', protected: true },
        { name: 'SecretRoom', protected: true },
        { name: 'MeetingRoom', protected: false },
        { name: 'Discussion', protected: false },
        { name: 'Feedback', protected: false },
        { name: 'Support', protected: false },
        { name: 'Development', protected: true },
        { name: 'Design', protected: true },
        { name: 'Marketing', protected: false },
        { name: 'Sales', protected: false },
        { name: 'HR', protected: true },
        { name: 'Finance', protected: true },
        { name: 'Legal', protected: false },
        { name: 'Admin', protected: false },
        { name: 'Operations', protected: true },
    ];

    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-64 max-h-[460px] overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-md p-4 transition-all duration-300">
            <input
                type="text"
                placeholder="Search Rooms"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-400 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {filteredRooms.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">No rooms found.</p>
            ) : (
                <ul className="space-y-2">
                    {filteredRooms.map((room, index) => (
                        <li
                            key={index}
                            onClick={() => onSelect(room)}
                            className="cursor-pointer border border-gray-300 hover:bg-gray-100 rounded px-4 py-2 text-left transition"
                        >
                            {room.name}{' '}
                            {room.protected && (
                                <span className="text-xs text-red-500">(Protected)</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default JoinARoom;