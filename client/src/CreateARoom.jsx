import React, { useState } from 'react';

function CreateARoom() {
    const [roomName, setRoomName] = useState('');
    const [description, setDescription] = useState('');
    const [isRoomOpen, setIsRoomOpen] = useState(true); // true = open = no password
    const [password, setPassword] = useState('');
    const [createdRoom, setCreatedRoom] = useState(null);

    const generateRandomPassword = () => {
        const randomPassword = Math.random().toString(36).slice(-8);
        setPassword(randomPassword);
    };

    const handleToggle = () => {
        setIsRoomOpen((prev) => !prev);
        if (isRoomOpen) setPassword(''); // Clear password if switching to open
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!roomName.trim()) {
            alert("Room name is required.");
            return;
        }

        if (!isRoomOpen && !password.trim()) {
            alert("Password is required for closed rooms.");
            return;
        }

        const roomData = { roomName, description, password: isRoomOpen ? '' : password };
        setCreatedRoom(roomData);

        // Reset form
        setRoomName('');
        setDescription('');
        setPassword('');
        setIsRoomOpen(true);
    };

    const handlePrint = () => window.print();

    const handleCopy = () => {
        const text = `
Room Name: ${createdRoom.roomName}
Description: ${createdRoom.description}
Password: ${createdRoom.password || '(None)'}
        `;
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-100 px-4 py-10 gap-8">
            {/* Form Section */}
            <div className="w-full md:w-1/2 max-w-md bg-white border border-gray-300 rounded-lg shadow-md p-6 text-center">
                <h1 className="text-3xl font-bold mb-6 text-green-400">Create A Room</h1>
                <form onSubmit={handleSubmit} className="text-left space-y-6">
                    {/* Room Name */}
                    <fieldset>
                        <legend className="text-sm px-2 text-gray-600">Room Name:</legend>
                        <input
                            type="text"
                            placeholder="Enter Room Name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full mt-1 border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </fieldset>

                    {/* Description */}
                    <fieldset>
                        <legend className="text-sm px-2 text-gray-600">Description:</legend>
                        <input
                            type="text"
                            placeholder="Enter Room Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full mt-1 border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </fieldset>

                    {/* Room Status Toggle */}
                    <fieldset>
                        <legend className="text-sm px-2 text-gray-600">Room Access:</legend>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-gray-700 font-medium">
                                {isRoomOpen ? 'Open (No Password)' : 'Closed (Password Required)'}
                            </span>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className={`w-14 h-7 flex items-center rounded-full p-1 transition duration-300 ${
                                    isRoomOpen ? 'bg-green-500' : 'bg-red-500'
                                }`}
                            >
                                <div
                                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                                        isRoomOpen ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </fieldset>

                    {/* Password - only if room is closed */}
                    {!isRoomOpen && (
                        <fieldset>
                            <legend className="text-sm px-2 text-gray-600">Password:</legend>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter Room Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full mt-1 border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-500 hover:underline"
                                    onClick={generateRandomPassword}
                                >
                                    Suggest Password
                                </button>
                            </div>
                        </fieldset>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
                    >
                        Create A Room
                    </button>
                </form>
            </div>

            {/* Room Details Section */}
            {createdRoom && (
                <div className="w-full md:w-1/2 max-w-md bg-white border border-gray-300 rounded-lg shadow-md p-6 text-left">
                    <h2 className="text-2xl font-bold text-blue-500 mb-4">Room Details</h2>
                    <p><strong>Name:</strong> {createdRoom.roomName}</p>
                    <p><strong>Description:</strong> {createdRoom.description}</p>
                    <p><strong>Password:</strong> {createdRoom.password || '(None)'}</p>

                    <div className='flex flex-row gap-4 mt-4'>
                        <button
                            onClick={handlePrint}
                            className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded border border-gray-400"
                        >
                            Print Details
                        </button>
                        <button 
                            onClick={handleCopy}
                            className='w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded border border-gray-400'
                        >
                            Copy to Clipboard
                        </button>
                    </div>

                    <p className="text-sm text-red-600 mt-4">
                        <strong>Note:</strong> Please save your room details. You may not be able to retrieve the password later.
                    </p>
                </div>
            )}
        </div>
    );
}

export default CreateARoom;