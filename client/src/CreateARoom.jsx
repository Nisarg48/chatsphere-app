import React, { useState } from 'react';
import axios from 'axios';

function CreateARoom() {
    const [roomName, setRoomName] = useState('');
    const [description, setDescription] = useState('');
    const [isRoomOpen, setIsRoomOpen] = useState(true);
    const [password, setPassword] = useState('');
    const [expiration, setExpiration] = useState('');
    const [createdRoom, setCreatedRoom] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const generateRandomPassword = () => {
        const randomPassword = Math.random().toString(36).slice(-8);
        setPassword(randomPassword);
    };

    const handleToggle = () => {
        setIsRoomOpen((prev) => !prev);
        if (isRoomOpen) setPassword('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Input validation
        if (!roomName.trim()) {
            setMessage({ type: 'error', text: 'Room name is required.' });
            return;
        }

        if (!isRoomOpen && !password.trim()) {
            setMessage({ type: 'error', text: 'Password is required for closed rooms.' });
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/chat-sphere/createRoom', {
                name: roomName,
                description,
                is_password_protected: !isRoomOpen,
                password: isRoomOpen ? '' : password,
                expired_on: expiration || null
            });

            if (response.status === 201) {
                setCreatedRoom(response.data);
                setMessage({ type: 'success', text: 'Room created successfully!' });

                // Reset form
                setRoomName('');
                setDescription('');
                setPassword('');
                setExpiration('');
                setIsRoomOpen(true);
            } else {
                setMessage({ type: 'error', text: 'Failed to create roomData. Please try again.' });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again later.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handlePrint = () => window.print();

    const handleCopy = () => {
        if (!createdRoom) return;
        const text = `Room Name: ${createdRoom.roomName}\nDescription: ${createdRoom.description}\nPassword: ${createdRoom.password || '(None)'}\nExpiration: ${createdRoom.expiration || 'No Expiration'}`;
        navigator.clipboard.writeText(text);
        setMessage({ type: 'success', text: 'Room details copied to clipboard.' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 px-4 py-10 flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Form Section */}
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-indigo-600 text-center">Create A Room</h1>

                {message.text && (
                    <div className={`mb-4 px-4 py-2 text-sm rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-sm">
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">Room Name</label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Enter Room Name"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter Room Description"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">Room Access</label>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-800 font-semibold">
                                {isRoomOpen ? 'Open (No Password)' : 'Closed (Password Required)'}
                            </span>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className={`w-14 h-7 rounded-full p-1 flex items-center transition duration-300 ${isRoomOpen ? 'bg-green-500' : 'bg-red-500'}`}
                            >
                                <div
                                    className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${isRoomOpen ? 'translate-x-7' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                    </div>

                    {!isRoomOpen && (
                        <div>
                            <label className="block mb-1 text-gray-700 font-medium">Password</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Room Password"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-indigo-500 hover:underline"
                                    onClick={generateRandomPassword}
                                >
                                    Suggest
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">Expiration Time (Optional)</label>
                        <input
                            type="datetime-local"
                            value={expiration}
                            onChange={(e) => setExpiration(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Create Room
                    </button>
                </form>
            </div>

            {/* Room Details Section */}
            {createdRoom && (
                <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-4">Room Details</h2>
                    <p><strong>Name:</strong> {createdRoom.name}</p>
                    <p><strong>Description:</strong> {createdRoom.description}</p>
                    <p><strong>Password:</strong> {createdRoom.password || '(None)'}</p>
                    <p><strong>Access:</strong> {createdRoom.is_password_protected ? 'Closed (Password Required)' : 'Open (No Password)'}</p>
                    <p><strong>Created:</strong> {createdRoom.created_on}</p>
                    <p><strong>Expires:</strong> {createdRoom.expired_on || 'No Expiration'}</p>

                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={handlePrint}
                            className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 px-4 rounded-lg"
                        >
                            Print
                        </button>
                        <button
                            onClick={handleCopy}
                            className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 px-4 rounded-lg"
                        >
                            Copy
                        </button>
                    </div>

                    <p className="text-xs text-red-600 mt-4">
                        <strong>Note:</strong> Save your roomData details. Passwords cannot be retrieved later.
                    </p>
                </div>
            )}
        </div>
    );
}

export default CreateARoom;