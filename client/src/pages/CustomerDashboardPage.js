import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const CustomerDashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const cards = [
        { label: 'Active Orders', value: '0', icon: '📦', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Saved Designs', value: '0', icon: '🎨', color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Appointments', value: '0', icon: '📅', color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const quickActions = [
        { label: 'Browse Tailors', icon: '🧵', desc: 'Find expert tailors near you' },
        { label: 'New Order', icon: '➕', desc: 'Start a custom clothing order' },
        { label: 'My Measurements', icon: '📐', desc: 'Manage your body measurements' },
        { label: 'Track Order', icon: '🚚', desc: 'Check status of your orders' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold tracking-wide">✂️ TailorHub</span>
                    <span className="bg-blue-500 text-xs font-semibold px-2 py-0.5 rounded-full">Customer</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-blue-200 hidden sm:block">{user?.email}</span>
                    <span className="text-sm font-medium">{user?.full_name}</span>
                    <button
                        onClick={handleLogout}
                        className="border border-white text-white text-sm px-4 py-2 rounded-lg hover:bg-white hover:text-blue-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl shadow p-7 mb-7 text-white">
                        <h1 className="text-3xl font-bold mb-1">
                            Welcome, {user?.full_name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-blue-100">
                            Ready to find your perfect tailor? Let's get started.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
                        {cards.map((card) => (
                            <motion.div
                                key={card.label}
                                whileHover={{ y: -3 }}
                                className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4"
                            >
                                <div className={`${card.bg} rounded-xl p-3 text-2xl`}>{card.icon}</div>
                                <div>
                                    <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                                    <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-7">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {quickActions.map((action) => (
                                <motion.button
                                    key={action.label}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
                                >
                                    <span className="text-3xl mb-2">{action.icon}</span>
                                    <span className="text-sm font-semibold text-gray-700">{action.label}</span>
                                    <span className="text-xs text-gray-400 mt-1">{action.desc}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Account Info</h2>
                        <div className="space-y-2 text-sm text-gray-500">
                            <p>Name: <span className="text-gray-800 font-medium">{user?.full_name}</span></p>
                            <p>Email: <span className="text-gray-800 font-medium">{user?.email}</span></p>
                            <p>Role: <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">Customer</span></p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CustomerDashboardPage;
