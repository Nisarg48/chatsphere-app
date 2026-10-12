import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSignInAlt, FaPlusCircle, FaCommentDots } from 'react-icons/fa';

function Navbar() {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <nav className="bg-white shadow-md border-b border-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <FaCommentDots className="text-2xl text-indigo-600" />
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ChatSphere
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                isHome
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FaHome className="text-lg" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>

                        <Link
                            to="/join"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                location.pathname === '/join'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FaSignInAlt className="text-lg" />
                            <span className="hidden sm:inline">Join Room</span>
                        </Link>

                        <Link
                            to="/create"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                location.pathname === '/create'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FaPlusCircle className="text-lg" />
                            <span className="hidden sm:inline">Create Room</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
