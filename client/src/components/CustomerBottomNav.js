import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_TABS = [
    { id: 'home',    label: 'Home',    icon: '🏠', path: '/customer/dashboard' },
    { id: 'tailors', label: 'Tailors', icon: '✂️', path: '/browse-deals' },
    { id: 'orders',  label: 'Orders',  icon: '📦', path: '/customer/dashboard?tab=orders' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/customer/dashboard?tab=profile' },
];

const CustomerBottomNav = ({ activeTab }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveTab = () => {
        if (activeTab) return activeTab;
        const p = location.pathname;
        if (p.includes('browse-deals')) return 'tailors';
        if (p.includes('tailor-profile') || p.includes('book-appointment')) return 'tailors';
        return 'home';
    };

    const currentTab = getActiveTab();

    const handleTab = (tab) => {
        if (tab.id === 'orders') {
            navigate('/customer/dashboard', { state: { tab: 'orders' } });
        } else if (tab.id === 'profile') {
            navigate('/customer/dashboard', { state: { tab: 'profile' } });
        } else {
            navigate(tab.path);
        }
    };

    return (
        <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff', borderTop: '1px solid #f0f0f0',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 50,
        }}>
            <div style={{ display: 'flex', width: '100%' }}>
                {NAV_TABS.map((tab) => {
                    const isActive = currentTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTab(tab)}
                            style={{
                                flex: 1, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                padding: '10px 0', position: 'relative',
                                background: 'none', border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="customer-nav-indicator"
                                    style={{
                                        position: 'absolute', top: 0,
                                        left: '50%', transform: 'translateX(-50%)',
                                        width: 32, height: 3,
                                        background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                                        borderRadius: '0 0 4px 4px',
                                    }}
                                />
                            )}
                            <motion.span
                                animate={{ scale: isActive ? 1.15 : 1 }}
                                style={{ fontSize: 22, lineHeight: 1.2, display: 'block' }}
                            >
                                {tab.icon}
                            </motion.span>
                            <span style={{
                                fontSize: 11, fontWeight: 600, marginTop: 2,
                                color: isActive ? '#6366f1' : '#9ca3af',
                                fontFamily: 'Sora, sans-serif',
                                transition: 'color 0.2s',
                            }}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default CustomerBottomNav;
