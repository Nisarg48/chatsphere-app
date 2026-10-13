import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import { FaSignOutAlt, FaUser, FaPaperPlane, FaLock, FaBars, FaTimes, FaKeyboard, FaCopy, FaTrash, FaSearch, FaTimesCircle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:5000', { autoConnect: false });

// Avatar color palette
const avatarColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500'
];

// Get consistent color for a user
function getAvatarColor(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
}

// Get initials from username
function getInitials(username) {
    const parts = username.split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Group consecutive messages from same sender
function groupMessages(messages, currentUser) {
    if (!messages || messages.length === 0) return [];
    
    const grouped = [];
    let currentGroup = null;
    
    messages.forEach((msg, index) => {
        if (!currentGroup || currentGroup.sender !== msg.sender) {
            if (currentGroup) {
                grouped.push(currentGroup);
            }
            currentGroup = {
                sender: msg.sender,
                messages: [msg],
                isCurrentUser: msg.sender === currentUser
            };
        } else {
            currentGroup.messages.push(msg);
        }
    });
    
    if (currentGroup) {
        grouped.push(currentGroup);
    }
    
    return grouped;
}

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [systemMessages, setSystemMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
    const messagesEndRef = useRef(null);
    const isLeavingRef = useRef(false);
    const typingTimeoutRef = useRef(null);

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

        socket.on('typing-status', (users) => {
            setTypingUsers(users.filter(user => user !== currentUser));
        });

        socket.on('message-deleted', (messageId) => {
            setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
        });

        socket.on('user-joined', ({ user, timestamp }) => {
            const time = formatDate(timestamp);
            setSystemMessages(prev => [...prev, { type: 'join', user, time }]);
        });

        socket.on('user-left', ({ user, timestamp }) => {
            const time = formatDate(timestamp);
            setSystemMessages(prev => [...prev, { type: 'leave', user, time }]);
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
                socket.off('typing-status');
                socket.off('message-deleted');
                socket.off('user-joined');
                socket.off('user-left');
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

    function getRelativeTime(dateString) {
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
    }

    const handleCopyMessage = (message) => {
        navigator.clipboard.writeText(message);
        toast.success('Message copied to clipboard');
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            socket.emit('delete-message', { messageId, roomId: id, user: currentUser });
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        if (term.trim()) {
            const results = messages.filter(msg => 
                msg.message.toLowerCase().includes(term.toLowerCase()) ||
                msg.sender.toLowerCase().includes(term.toLowerCase())
            );
            setSearchResults(results);
            setCurrentSearchIndex(0);
        } else {
            setSearchResults([]);
            setCurrentSearchIndex(0);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setCurrentSearchIndex(0);
    };

    const scrollToSearchResult = (index) => {
        if (searchResults[index]) {
            const messageId = searchResults[index]._id;
            const element = document.querySelector(`[data-message-id="${messageId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('ring-2', 'ring-yellow-400');
                setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-yellow-400');
                }, 2000);
            }
        }
    };

    const navigateSearch = (direction) => {
        if (searchResults.length === 0) return;
        
        let newIndex = currentSearchIndex + direction;
        if (newIndex < 0) newIndex = searchResults.length - 1;
        if (newIndex >= searchResults.length) newIndex = 0;
        
        setCurrentSearchIndex(newIndex);
        scrollToSearchResult(newIndex);
    };

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
        
        // Clear typing status
        socket.emit('typing-stop', { id, user: currentUser });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        // Emit typing start
        socket.emit('typing-start', { id, user: currentUser });
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Set new timeout to stop typing after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing-stop', { id, user: currentUser });
        }, 3000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
        
        // Search navigation shortcuts
        if (searchResults.length > 0) {
            if (e.key === 'ArrowUp' && e.ctrlKey) {
                e.preventDefault();
                navigateSearch(-1);
            } else if (e.key === 'ArrowDown' && e.ctrlKey) {
                e.preventDefault();
                navigateSearch(1);
            } else if (e.key === 'Escape') {
                clearSearch();
            }
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
        <div className="flex flex-col md:flex-row h-screen bg-indigo-50 dark:bg-gray-900 relative">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden absolute top-4 left-4 z-50 bg-indigo-600 dark:bg-indigo-500 text-white p-2 rounded-lg shadow-lg"
            >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Sidebar */}
            <div className={`fixed md:relative inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-800 border-r border-indigo-200 dark:border-gray-700 flex-shrink-0 flex flex-col transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-4 md:p-6 border-b border-indigo-200 dark:border-gray-700">
                    <h2 className="text-xl md:text-2xl font-semibold text-indigo-800 dark:text-indigo-300">{roomData.name}</h2>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">{roomData.description}</p>
                    {roomData.is_password_protected && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-mono flex items-center gap-2">
                            <FaLock />
                            Password: <span className="font-semibold">{roomData.password}</span>
                        </p>
                    )}
                </div>
                <div className="flex-grow overflow-y-auto">
                    <h3 className="px-4 py-2 border-b border-indigo-200 dark:border-gray-700 text-indigo-700 dark:text-indigo-300 font-semibold text-sm flex items-center gap-2">
                        <FaUser />
                        Users in this room ({userList.length})
                    </h3>
                    <ul className="px-4 py-3 space-y-2">
                        {userList.map((user) => (
                            <li
                                key={user}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${user === currentUser ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${getAvatarColor(user)}`}>
                                    {getInitials(user)}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className={`text-sm truncate ${user === currentUser ? 'font-semibold text-indigo-900 dark:text-indigo-200' : 'text-indigo-800 dark:text-gray-300'}`}>
                                        {user}
                                    </p>
                                    {user === currentUser && (
                                        <p className="text-xs text-indigo-500 dark:text-indigo-400">You</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 border-t border-indigo-200 dark:border-gray-700">
                    <button
                        onClick={() => {
                            setIsLeaving(true);
                            handleLeaveRoom();
                        }}
                        disabled={isLeaving}
                        className={`w-full bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 text-sm font-semibold transition flex items-center justify-center gap-2 ${isLeaving ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <FaSignOutAlt />
                        {isLeaving ? 'Leaving...' : 'Leave Room'}
                    </button>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Chat Area */}
            <div className="flex flex-col flex-grow md:ml-0">
                {/* Search Bar */}
                <div className="border-b border-indigo-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-grow">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <FaTimesCircle />
                                </button>
                            )}
                        </div>
                        {searchResults.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>{currentSearchIndex + 1}/{searchResults.length}</span>
                                <button
                                    onClick={() => navigateSearch(-1)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    title="Previous result"
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => navigateSearch(1)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    title="Next result"
                                >
                                    ↓
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-indigo-100 dark:bg-gray-800">
                    {/* System Messages */}
                    {systemMessages.map((sysMsg, index) => (
                        <div
                            key={`sys-${index}`}
                            className="flex justify-center items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-200/50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full"
                        >
                            <span>{sysMsg.user}</span>
                            <span>{sysMsg.type === 'join' ? 'joined' : 'left'} the room</span>
                            <span className="text-indigo-500 dark:text-indigo-500/70">• {sysMsg.time}</span>
                        </div>
                    ))}
                    
                    {groupMessages(messages, currentUser).map((group, groupIndex) => (
                        <div
                            key={groupIndex}
                            className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${group.isCurrentUser ? 'items-end ml-auto' : 'items-start mr-auto'}`}
                        >
                            {/* Avatar and sender name */}
                            <div className={`flex items-center gap-2 mb-1 ${group.isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${getAvatarColor(group.sender)}`}>
                                    {getInitials(group.sender)}
                                </div>
                                <p className={`text-sm font-semibold ${group.isCurrentUser ? 'text-indigo-700 dark:text-indigo-300' : 'text-indigo-900 dark:text-gray-200'}`}>
                                    {group.sender}
                                </p>
                            </div>
                            
                            {/* Message bubbles */}
                            <div className={`flex flex-col gap-1 ${group.isCurrentUser ? 'items-end' : 'items-start'}`}>
                                {group.messages.map((msg, msgIndex) => (
                                    <div
                                        key={msg._id}
                                        data-message-id={msg._id}
                                        className="relative group"
                                        onMouseEnter={() => setHoveredMessageId(msg._id)}
                                        onMouseLeave={() => setHoveredMessageId(null)}
                                    >
                                        <div
                                            className={`px-4 py-2 rounded-lg shadow-sm whitespace-pre-wrap transition-all duration-200 ${
                                                group.isCurrentUser
                                                    ? msgIndex === group.messages.length - 1
                                                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-br-none'
                                                        : 'bg-indigo-500 dark:bg-indigo-600 text-white rounded-lg'
                                                    : msgIndex === group.messages.length - 1
                                                        ? 'bg-white dark:bg-gray-700 text-indigo-900 dark:text-gray-100 rounded-bl-none border border-indigo-300 dark:border-gray-600'
                                                        : 'bg-white dark:bg-gray-700 text-indigo-900 dark:text-gray-100 rounded-lg border border-indigo-200 dark:border-gray-600'
                                            }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                        </div>
                                        
                                        {/* Message Actions */}
                                        {hoveredMessageId === msg._id && (
                                            <div className={`absolute top-0 ${group.isCurrentUser ? '-left-24' : '-right-24'} flex gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 border border-gray-200 dark:border-gray-700`}>
                                                <button
                                                    onClick={() => handleCopyMessage(msg.message)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition"
                                                    title="Copy message"
                                                >
                                                    <FaCopy className="text-xs" />
                                                </button>
                                                {group.isCurrentUser && (
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg._id)}
                                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 transition"
                                                        title="Delete message"
                                                    >
                                                        <FaTrash className="text-xs" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Timestamp for last message in group */}
                            <span 
                                className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 cursor-help"
                                title={group.messages[group.messages.length - 1].sent_at}
                            >
                                {getRelativeTime(group.messages[group.messages.length - 1].sent_at)}
                            </span>
                        </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {typingUsers.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 animate-pulse">
                            <FaKeyboard />
                            <span>
                                {typingUsers.length === 1
                                    ? `${typingUsers[0]} is typing...`
                                    : typingUsers.length === 2
                                    ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                                    : `${typingUsers.length} people are typing...`
                                }
                            </span>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-indigo-200 dark:border-gray-700 p-3 sm:p-4 bg-white dark:bg-gray-800 flex items-center gap-2 sm:gap-4">
                    <textarea
                        rows={1}
                        placeholder="Type your message..."
                        className="flex-grow resize-none border border-indigo-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 bg-white dark:bg-gray-700 text-indigo-900 dark:text-gray-100"
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-md px-4 sm:px-5 py-2 text-sm font-semibold transition flex items-center gap-2"
                    >
                        <FaPaperPlane />
                        Send
                    </button>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default ChatRoom;