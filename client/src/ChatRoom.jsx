/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:5000', { autoConnect: false });

function ChatRoom() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = location.state?.user;
    const [roomData, setRoomData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userList, setUserList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const isLeavingRef = useRef(false);

    useEffect(() => {
        if (!currentUser) {
            toast.error('User not found. Redirecting to home.');
            navigate('/');
            return;
        }

        socket.connect();

        socket.emit('join-room', { id, user: currentUser });

        socket.on('update-user-list', (users) => {
            const sortedUsers = [
                currentUser,
                ...users.filter((user) => user !== currentUser).sort(),
            ];
            setUserList(sortedUsers);
        });

        socket.on('receive-message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on('error', ({ message }) => {
            toast.error(message);
            setError(message);
            setIsLeaving(false);
        });

        socket.on('connect_error', () => {
            toast.error('Connection lost. Trying to reconnect...');
            setError('Connection error.');
            setIsLeaving(false);
        });

        const handleNavigation = () => {
            if (!isLeavingRef.current && window.confirm('Are you sure you want to leave the room?')) {
                isLeavingRef.current = true;
                socket.emit('leave-room', { id, user: currentUser });
                socket.disconnect();
                navigate('/join');
            }
        };

        window.addEventListener('popstate', handleNavigation);

        const handleBeforeUnload = () => {
            if (!isLeavingRef.current) {
                isLeavingRef.current = true;
                socket.emit('leave-room', { id, user: currentUser });
                socket.disconnect();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('popstate', handleNavigation);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (!isLeavingRef.current) {
                isLeavingRef.current = true;
                socket.emit('leave-room', { id, user: currentUser });
                socket.off('receive-message');
                socket.off('update-user-list');
                socket.off('error');
                socket.off('connect_error');
                socket.disconnect();
            }
        };
    }, [id, currentUser, navigate]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([getRoomData(), fetchMessages()]);
            } catch (err) {
                setError('Failed to load room data.');
                toast.error('Error loading room data.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const getRoomData = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios.get(`http://localhost:5000/chat-sphere/getRoomById/${id}`);
                if (response.status === 200) {
                    setRoomData(response.data);
                    setUserList([currentUser, ...response.data.users.filter((user) => user !== currentUser).sort()]);
                    return;
                }
            } catch (err) {
                if (i === retries - 1) {
                    setError('Failed to load room data.');
                    toast.error('Error loading room data.');
                }
            }
        }
    };

    const fetchMessages = async () => {
        const response = await axios.get(`http://localhost:5000/chat-sphere/getMessagesByRoomId/${id}`);
        if (response.status === 200) {
            setMessages(response.data);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function formatDate(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} - ${hours}:${minutes}`;
    }

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        const time = formatDate(Date.now());
        const messageData = {
            sender: currentUser,
            room_id: id,
            message: newMessage.trim(),
            sent_at: time,
        };
        socket.emit('send-message', messageData);
        setNewMessage('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleLeaveRoom = () => {
        if (!isLeavingRef.current && window.confirm('Are you sure you want to leave the room?')) {
            setIsLeaving(true);
            if (socket.connected) {
                socket.emit('leave-room', { id, user: currentUser }, () => {
                    socket.disconnect();
                    toast.success('Left the room successfully.');
                    setIsLeaving(false);
                    isLeavingRef.current = true;
                });
            } else {
                toast.error('Not connected to the server. Redirecting...');
                setIsLeaving(false);
                isLeavingRef.current = true;
            }
        }
        navigate('/join');
    };

    if (error) return <div className="text-red-600 p-4">{error}</div>;
    if (isLoading || !roomData) {
        return (
            <div className="flex flex-col md:flex-row h-screen bg-indigo-50 animate-pulse">
                <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-indigo-200">
                    <div className="p-4 md:p-6">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="px-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
                <div className="flex-grow p-4 md:p-6">
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-indigo-50">
            <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-indigo-200 flex-shrink-0 flex flex-col transition-all duration-300">
                <div className="p-4 md:p-6 border-b border-indigo-200">
                    <h2 className="text-xl md:text-2xl font-semibold text-indigo-800">{roomData.name}</h2>
                    <p className="text-sm text-indigo-600 mt-1">{roomData.description}</p>
                    {roomData.is_password_protected && (
                        <p className="mt-2 text-sm text-red-600 font-mono">
                            Password: <span className="font-semibold">{roomData.password}</span>
                        </p>
                    )}
                </div>
                <div className="flex-grow overflow-y-auto">
                    <h3 className="px-4 py-2 border-b border-indigo-200 text-indigo-700 font-semibold text-sm">
                        Users in this room ({userList.length})
                    </h3>
                    <ul className="px-4 py-3 space-y-2">
                        {userList.map((user) => (
                            <li
                                key={user}
                                className={`text-indigo-800 transition-opacity duration-200 ${user === currentUser ? 'font-semibold text-indigo-900' : ''}`}
                            >
                                {user} {user === currentUser && '(You)'}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 border-t border-indigo-200">
                    <button
                        onClick={() => {
                            setIsLeaving(true);
                            handleLeaveRoom();
                        }}
                        disabled={isLeaving}
                        className={`w-full bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 text-sm font-semibold transition ${isLeaving ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLeaving ? 'Leaving...' : 'Leave Room'}
                    </button>
                </div>
            </div>
            <div className="flex flex-col flex-grow">
                <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-indigo-100">
                    {messages.map(({ _id, sender, message, sent_at }) => {
                        const isCurrentUser = sender === currentUser;
                        return (
                            <div
                                key={_id}
                                className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isCurrentUser ? 'items-end ml-auto' : 'items-start mr-auto'}`}
                            >
                                <div
                                    className={`px-4 py-2 rounded-lg shadow-sm whitespace-pre-wrap transition-all duration-200 ${isCurrentUser
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white text-indigo-900 rounded-bl-none border border-indigo-300'
                                        }`}
                                >
                                    <p className="font-semibold text-sm">{sender}</p>
                                    <p className="mt-1 text-sm">{message}</p>
                                </div>
                                <span className="text-xs text-indigo-500 mt-1">{sent_at}</span>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-indigo-200 p-3 sm:p-4 bg-white flex items-center gap-2 sm:gap-4">
                    <textarea
                        rows={1}
                        placeholder="Type your message..."
                        className="flex-grow resize-none border border-indigo-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-indigo-900"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 sm:px-5 py-2 text-sm font-semibold transition"
                    >
                        Send
                    </button>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default ChatRoom;