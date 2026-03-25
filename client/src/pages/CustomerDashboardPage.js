import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import IndexPage from './IndexPage';

/* ─── Customer Profile Tab ───────────────────────────────────── */
const CustomerProfileTab = ({ user, onLogout }) => {
    const [contact, setContact] = useState({ phone: '', whatsapp: '' });
    const [address, setAddress] = useState({ street: '', city: '', state: '', pin: '' });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Load profile from DB on mount
    useEffect(() => {
        fetch('http://localhost:3000/api/customer/profile', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.profile) {
                    const p = data.profile;
                    setContact({ phone: p.phone || '', whatsapp: p.whatsapp || '' });
                    setAddress({ street: p.street || '', city: p.city || '', state: p.state || '', pin: p.pin || '' });
                }
            })
            .catch(() => {})
            .finally(() => setLoadingProfile(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        try {
            const res = await fetch('http://localhost:3000/api/customer/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    phone: contact.phone,
                    whatsapp: contact.whatsapp,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pin: address.pin,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setSaveError(data.message || 'Save failed'); return; }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch {
            setSaveError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50";
    const sectionHead = (icon, title) => (
        <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{icon}</span>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
        </div>
    );

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <div className="space-y-5 pb-4">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-white/20 border-4 border-white/30 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{initials}</span>
                </div>
                <h2 className="text-xl font-bold">{user?.full_name || 'Customer'}</h2>
                <p className="text-indigo-200 text-sm mt-0.5">{user?.email}</p>
                <span className="mt-2 inline-block bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">Customer</span>
            </div>

            {/* Account Info (read-only) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {sectionHead('👤', 'Account Info')}
                <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Full Name</span>
                        <span className="text-sm font-semibold text-gray-800">{user?.full_name || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="text-sm font-semibold text-gray-800">{user?.email || '—'}</span>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {sectionHead('📞', 'Contact')}
                {loadingProfile ? (
                    <div className="flex justify-center py-4">
                        <span className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <input className={inputCls} placeholder="Phone Number" value={contact.phone} maxLength={10}
                            onChange={e => setContact({ ...contact, phone: e.target.value })} />
                        <input className={inputCls} placeholder="WhatsApp Number" value={contact.whatsapp} maxLength={10}
                            onChange={e => setContact({ ...contact, whatsapp: e.target.value })} />
                    </div>
                )}
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {sectionHead('📍', 'Delivery Address')}
                {loadingProfile ? (
                    <div className="flex justify-center py-4">
                        <span className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <input className={inputCls} placeholder="Street / Area" value={address.street}
                            onChange={e => setAddress({ ...address, street: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                            <input className={inputCls} placeholder="City" value={address.city}
                                onChange={e => setAddress({ ...address, city: e.target.value })} />
                            <input className={inputCls} placeholder="State" value={address.state}
                                onChange={e => setAddress({ ...address, state: e.target.value })} />
                        </div>
                        <input className={inputCls} placeholder="PIN Code" value={address.pin} maxLength={6}
                            onChange={e => setAddress({ ...address, pin: e.target.value })} />
                    </div>
                )}
            </div>

            {/* Save button */}
            {saveError && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">{saveError}</p>
            )}
            <motion.button onClick={handleSave} disabled={saving || saved || loadingProfile}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-indigo-600 text-white font-bold text-sm py-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saved ? '✅ Profile Saved!' : saving ? 'Saving...' : '💾 Save Profile'}
            </motion.button>

            {/* Logout */}
            <button onClick={onLogout}
                className="w-full bg-red-50 border border-red-100 text-red-600 font-semibold text-sm py-4 rounded-2xl hover:bg-red-100 transition-colors">
                🚪 Logout
            </button>
        </div>
    );
};

/* ─── Orders Tab (placeholder) ────────────────────────────────── */
const OrdersTab = () => (
    <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">My Orders</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-3 text-center">
            <span className="text-4xl">📦</span>
            <p className="text-gray-600 font-semibold">No orders yet</p>
            <p className="text-gray-400 text-sm">Browse tailors and place your first order!</p>
        </div>
    </div>
);

/* ─── Nav tabs ─────────────────────────────────────────────────── */
const NAV_TABS = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'profile', label: 'Profile', icon: '👤' },
];

/* ─── Customer Dashboard ─────────────────────────────────────── */
const CustomerDashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Clear search when switching tabs
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (tabId !== 'home') setSearchQuery('');
    };

    const renderTab = () => {
        switch (activeTab) {
            case 'home': return (
                <div>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                    {searchQuery.trim().length > 0 ? (
                        <SearchResults
                            query={searchQuery}
                            onClear={() => setSearchQuery('')}
                        />
                    ) : (
                        <IndexPage />
                    )}
                </div>
            );
            case 'orders': return <OrdersTab />;
            case 'profile': return <CustomerProfileTab user={user} onLogout={handleLogout} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col w-full">
            <Header />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto pb-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'home' ? renderTab() : (
                            <div className="px-4 py-5">{renderTab()}</div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
                <div className="w-full flex">
                    {NAV_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className="flex-1 flex flex-col items-center justify-center py-3 relative transition-colors"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="customer-tab-indicator"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full"
                                    />
                                )}
                                <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                                    {tab.icon}
                                </span>
                                <span className={`text-xs mt-1 font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
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
