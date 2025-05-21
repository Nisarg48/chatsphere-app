import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-100 px-4">
            <button 
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded border border-gray-400"
                onClick={() => navigate('/join')}
            >
                Join A Room
            </button>

            <button
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded border border-gray-400"
                onClick={() => navigate('/create')}
            >
                Create A Room
            </button>
        </div>
    );
}

export default Home;