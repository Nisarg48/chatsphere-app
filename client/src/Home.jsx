import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaPlusCircle } from 'react-icons/fa';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 px-4 py-8">
            {/* Main Content */}
            <div className="w-full max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
                {/* Logo/Branding */}
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                        ChatSphere
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                        Real-time conversations, anytime, anywhere. Create or join rooms and connect instantly.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <button 
                        className="w-full sm:w-64 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-transparent flex items-center justify-center gap-2"
                        onClick={() => navigate('/join')}
                    >
                        <FaSignInAlt className="text-xl" />
                        Join A Room
                    </button>

                    <button
                        className="w-full sm:w-64 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-indigo-600 dark:border-indigo-400 flex items-center justify-center gap-2"
                        onClick={() => navigate('/create')}
                    >
                        <FaPlusCircle className="text-xl" />
                        Create A Room
                    </button>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="text-3xl mb-2">🔒</div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Secure Rooms</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Password-protected rooms for private conversations</p>
                    </div>
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="text-3xl mb-2">⚡</div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Real-time</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Instant messaging with Socket.io technology</p>
                    </div>
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="text-3xl mb-2">⏰</div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Time-limited</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Set expiration times for temporary rooms</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Built with React, Node.js, Socket.io & MongoDB</p>
            </footer>
        </div>
    );
}

export default Home;