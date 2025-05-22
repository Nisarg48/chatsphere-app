// This page is ChatRoom.jsx
// After Join a room, the user will be redirected to this page.
// The user will be able to chat with other users in the room.
// The Page UI is similar to WatsApp Web.
// The user will be able to see the list of users in the room.
// The user will be able to send and receive messages.
// The user will be able to see the list of messages in the room.
// At Left Side Name of Room, Description, and Password(If Closed Room)(Top).
// At left side List of users in the room(Bottom).
// At Right Side List of messages in the room(Up).
// Write Message Box(Bottom), At Right Side send button.
// In All Messages, the user will be able to see the name of the user who sent the message.
// In All Messages, the user will be able to see the time of the message.
// In All Messages, right side User message and left side other user message.

/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';

function ChatRoom() {
    const currentUser = "John Doe";

    const room = {
        name: "Project X",
        description: "Discuss Project X details here",
        passwordProtected: true,
        password: "secret123",
    };

    const [users, setUsers] = useState([
        "John Doe", "Alice Smith", "Bob Johnson", "Carol King",
    ]);

    const [messages, setMessages] = useState([
        {
            id: 1,
            user: "Alice Smith",
            text: "Hey, are we ready for the meeting?",
            time: "10:15 AM",
        },
        {
            id: 2,
            user: "John Doe",
            text: "Almost, finishing the last slides.",
            time: "10:16 AM",
        },
        {
            id: 3,
            user: "Bob Johnson",
            text: "Let me know if you want me to review.",
            time: "10:17 AM",
        },
    ]);

    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim()) return;
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        setMessages((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                user: currentUser,
                text: newMessage.trim(),
                time: timeString,
            },
        ]);
        setNewMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100">
            {/* Left Sidebar */}
            <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-300 flex-shrink-0 flex flex-col">
                <div className="p-4 md:p-6 border-b border-gray-300">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{room.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                    {room.passwordProtected && (
                        <p className="mt-2 text-sm text-red-600 font-mono">
                            Password: <span className="font-semibold">{room.password}</span>
                        </p>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto">
                    <h3 className="px-4 py-2 border-b border-gray-300 text-gray-700 font-semibold text-sm">
                        Users in this room ({users.length})
                    </h3>
                    <ul className="px-4 py-3 space-y-2">
                        {users.map((user, i) => (
                            <li
                                key={i}
                                className={`text-gray-800 ${user === currentUser ? "font-semibold" : ""}`}
                            >
                                {user} {user === currentUser && "(You)"}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Chat Panel */}
            <div className="flex flex-col flex-grow">
                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
                    {messages.map(({ id, user, text, time }) => {
                        const isCurrentUser = user === currentUser;
                        return (
                            <div
                                key={id}
                                className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isCurrentUser ? "items-end ml-auto" : "items-start mr-auto"}`}
                            >
                                <div
                                    className={`px-4 py-2 rounded-lg shadow-sm whitespace-pre-wrap ${isCurrentUser
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-white text-gray-900 rounded-bl-none border border-gray-300"
                                        }`}
                                >
                                    <p className="font-semibold text-sm">{user}</p>
                                    <p className="mt-1 text-sm">{text}</p>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">{time}</span>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-300 p-3 sm:p-4 bg-white flex items-center gap-2 sm:gap-4">
                    <textarea
                        rows={1}
                        placeholder="Type your message..."
                        className="flex-grow resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleSend}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 sm:px-5 py-2 text-sm font-semibold transition"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatRoom;