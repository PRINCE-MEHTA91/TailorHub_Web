import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/* ─── Tab Content Components ─────────────────────────────────── */

const HomeTab = ({ user }) => {
    const cards = [
        { label: 'Active Orders', value: '2', icon: '📦', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Saved Designs', value: '5', icon: '🎨', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        { label: 'Appointments', value: '1', icon: '📅', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
        { label: 'Favourites', value: '3', icon: '❤️', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    ];
    const recommendations = [
        { name: 'Priya Tailors', specialty: 'Bridal Wear', rating: '4.9', price: '₹2,000+', emoji: '👗' },
        { name: 'Khan & Sons', specialty: 'Men\'s Suits', rating: '4.7', price: '₹3,500+', emoji: '🤵' },
        { name: 'Meera Boutique', specialty: 'Blouses', rating: '4.8', price: '₹500+', emoji: '✂️' },
    ];

    return (
        <div className="space-y-5">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl p-6 text-white">
                <p className="text-blue-200 text-sm font-medium">Hello 👋</p>
                <h2 className="text-2xl font-bold mt-1">{user?.full_name?.split(' ')[0]}</h2>
                <p className="text-blue-100 text-sm mt-1">Find your perfect tailor today.</p>
                <button className="mt-3 bg-white text-blue-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                    Browse Tailors →
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {cards.map((c) => (
                    <motion.div key={c.label} whileHover={{ y: -2 }}
                        className={`${c.bg} border ${c.border} rounded-2xl p-4 flex items-center gap-3`}>
                        <span className="text-2xl">{c.icon}</span>
                        <div>
                            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                            <p className="text-xs text-gray-500">{c.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recommended Tailors */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Recommended Tailors</h3>
                <div className="space-y-3">
                    {recommendations.map((t) => (
                        <motion.div key={t.name} whileHover={{ x: 4 }}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                {t.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                                <p className="text-xs text-gray-400">{t.specialty}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold text-amber-600">⭐ {t.rating}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{t.price}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const OrdersTab = () => {
    const [tab, setTab] = useState('active');
    const active = [
        { id: '#2031', tailor: 'Priya Tailors', item: 'Bridal Lehenga', status: 'In Progress', due: 'Mar 5', amount: '₹4,500' },
        { id: '#2030', tailor: 'Meera Boutique', item: 'Silk Blouse', status: 'Pending', due: 'Mar 8', amount: '₹800' },
    ];
    const history = [
        { id: '#2029', tailor: 'Khan & Sons', item: 'Suit (3-piece)', status: 'Delivered', due: 'Feb 18', amount: '₹6,200' },
        { id: '#2028', tailor: 'Priya Tailors', item: 'Salwar Kameez', status: 'Delivered', due: 'Feb 10', amount: '₹1,200' },
    ];
    const statusColor = { 'In Progress': 'bg-blue-100 text-blue-700', 'Pending': 'bg-amber-100 text-amber-700', 'Delivered': 'bg-green-100 text-green-700' };
    const data = tab === 'active' ? active : history;

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">My Orders</h2>
            <div className="flex bg-gray-100 rounded-xl p-1">
                {['active', 'history'].map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                        {t === 'active' ? 'Active Orders' : 'History'}
                    </button>
                ))}
            </div>
            <div className="space-y-3">
                {data.map((o) => (
                    <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-sm font-bold text-gray-800">{o.tailor}</p>
                                <p className="text-xs text-gray-400">{o.id} · {o.item}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor[o.status]}`}>{o.status}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                            <p className="text-xs text-gray-400">📅 Due: {o.due}</p>
                            <p className="text-sm font-bold text-blue-600">{o.amount}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const DesignsTab = () => {
    const items = [
        { name: 'Bridal Lehenga Ref.', tags: ['Bridal', 'Heavy'], emoji: '👗' },
        { name: 'Office Suit Style', tags: ['Formal', 'Men'], emoji: '🤵' },
        { name: 'Festive Kurta', tags: ['Casual', 'Indo-Western'], emoji: '🧥' },
        { name: 'Party Blouse Cut', tags: ['Silk', 'Women'], emoji: '✂️' },
        { name: 'Summer Salwar', tags: ['Cotton', 'Light'], emoji: '👘' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Saved Designs</h2>
                <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">+ Add New</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {items.map((item) => (
                    <motion.div key={item.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer">
                        <div className="bg-blue-50 rounded-xl h-20 flex items-center justify-center text-4xl mb-3">
                            {item.emoji}
                        </div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{item.name}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag) => (
                                <span key={tag} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const ProfileTab = ({ user, onLogout }) => (
    <div className="space-y-5">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
                🛍️
            </div>
            <h2 className="text-xl font-bold">{user?.full_name}</h2>
            <p className="text-blue-200 text-sm mt-1">{user?.email}</p>
            <span className="mt-2 inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Customer
            </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
            {[{ label: 'Orders', val: '4' }, { label: 'Designs', val: '5' }, { label: 'Reviews', val: '3' }].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-xl font-bold text-blue-600">{s.val}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
            ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {[
                { icon: '📐', label: 'My Measurements' },
                { icon: '📍', label: 'Delivery Address' },
                { icon: '🔔', label: 'Notifications' },
                { icon: '🔒', label: 'Change Password' },
                { icon: '❓', label: 'Help & Support' },
            ].map((item, i, arr) => (
                <button key={item.label}
                    className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-700 flex-1">{item.label}</span>
                    <span className="text-gray-300">›</span>
                </button>
            ))}
        </div>

        <button onClick={onLogout}
            className="w-full bg-red-50 border border-red-100 text-red-600 font-semibold text-sm py-4 rounded-2xl hover:bg-red-100 transition-colors">
            🚪 Logout
        </button>
    </div>
);

/* ─── Bottom Navigation ───────────────────────────────────────── */
const NAV_TABS = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'designs', label: 'Designs', icon: '🎨' },
    { id: 'profile', label: 'Profile', icon: '👤' },
];

/* ─── Main Component ──────────────────────────────────────────── */
const CustomerDashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const renderTab = () => {
        const props = { user, onLogout: handleLogout };
        switch (activeTab) {
            case 'home': return <HomeTab {...props} />;
            case 'orders': return <OrdersTab />;
            case 'designs': return <DesignsTab />;
            case 'profile': return <ProfileTab {...props} />;
            default: return <HomeTab {...props} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xl">✂️</span>
                    <span className="text-lg font-bold text-gray-800">TailorHub</span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full ml-1">Customer</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <span className="text-xl">🔔</span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto pb-24">
                <div className="max-w-lg mx-auto px-4 py-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderTab()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
                <div className="max-w-lg mx-auto flex">
                    {NAV_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex-1 flex flex-col items-center justify-center py-3 relative transition-colors"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="customer-tab-indicator"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"
                                    />
                                )}
                                <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                                    {tab.icon}
                                </span>
                                <span className={`text-xs mt-1 font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default CustomerDashboardPage;
