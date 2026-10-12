import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSignInAlt, FaPlusCircle, FaCommentDots, FaMoon, FaSun } from 'react-icons/fa';
import { useDarkMode } from '../contexts/DarkModeContext';

function Navbar() {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-indigo-100 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <FaCommentDots className="text-2xl text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                            ChatSphere
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                isHome
                                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <FaHome className="text-lg" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>

                        <Link
                            to="/join"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                location.pathname === '/join'
                                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <FaSignInAlt className="text-lg" />
                            <span className="hidden sm:inline">Join Room</span>
                        </Link>

                        <Link
                            to="/create"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                location.pathname === '/create'
                                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <FaPlusCircle className="text-lg" />
                            <span className="hidden sm:inline">Create Room</span>
                        </Link>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
