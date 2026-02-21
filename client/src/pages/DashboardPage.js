import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
                <span className="text-xl font-bold tracking-wide">✂️ TailorHub</span>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-300">
                        {user?.full_name}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="border border-white text-white text-sm px-4 py-2 rounded-lg hover:bg-white hover:text-gray-800 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">
                            Welcome back, {user?.full_name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-gray-500">Here's what's happening with your TailorHub account.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { label: 'Active Orders', value: '0', icon: '📦' },
                            { label: 'Saved Designs', value: '0', icon: '🎨' },
                            { label: 'Appointments', value: '0', icon: '📅' },
                        ].map((card) => (
                            <div key={card.label} className="bg-white rounded-2xl shadow-sm p-6">
                                <div className="text-3xl mb-2">{card.icon}</div>
                                <div className="text-2xl font-bold text-gray-800">{card.value}</div>
                                <div className="text-sm text-gray-500 mt-1">{card.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 mt-5">
                        <h2 className="text-lg font-semibold text-gray-700 mb-1">Account Info</h2>
                        <p className="text-sm text-gray-500">Email: <span className="text-gray-800">{user?.email}</span></p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardPage;
