import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LocationModal from './LocationModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Stable function to re-fetch unread count
  const refreshCount = useCallback(() => {
    if (!user) { setUnreadCount(0); return; }
    fetch(`${API_URL}/api/notifications`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.notifications) {
          setUnreadCount(data.notifications.filter(n => !n.is_read).length);
        }
      })
      .catch(() => {});
  }, [user]);

  // Fetch on mount / user change
  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Listen to custom events dispatched by Dashboard socket or NotificationsPage
  useEffect(() => {
    const onNewNotif = () => setUnreadCount(prev => prev + 1);
    const onCountReset = (e) => setUnreadCount(e.detail ?? 0);

    window.addEventListener('tailorhub_new_notification', onNewNotif);
    window.addEventListener('tailorhub_notif_count', onCountReset);
    window.addEventListener('focus', refreshCount);

    return () => {
      window.removeEventListener('tailorhub_new_notification', onNewNotif);
      window.removeEventListener('tailorhub_notif_count', onCountReset);
      window.removeEventListener('focus', refreshCount);
    };
  }, [refreshCount]);

  // Customer location profile
  useEffect(() => {
    if (user && user.role === 'customer') {
      fetch(`${API_URL}/api/customer/profile`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.profile) setCurrentProfile(data.profile); })
        .catch(() => {});
    }
  }, [user]);

  const handleSaveLocation = (address) => {
    setCurrentProfile(prev => ({ ...prev, ...address }));
    setShowLocationModal(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNotificationClick = () => {
    setUnreadCount(0);
    window.dispatchEvent(new CustomEvent('tailorhub_notif_count', { detail: 0 }));
    navigate('/notifications');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const firstName = user?.full_name?.split(' ')[0] || '';

  return (
    <header className="tailorhub-header sticky top-0 z-50">
      <div className="header-inner">
        {/* Logo + Location */}
        <div className="flex items-center gap-4">
          <Link to="/" className="header-logo">
            <span className="header-logo-icon">✂️</span>
            <span className="header-logo-text">TailorHub</span>
          </Link>

          {user && user.role === 'customer' && (
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 shadow-sm"
              title="Set your delivery location"
            >
              <span className="text-red-500">📍</span>
              <span className="truncate max-w-[150px]">
                {currentProfile?.city
                  ? `${currentProfile.city}${currentProfile.state ? `, ${currentProfile.state}` : ''}`
                  : currentProfile?.street || 'Set Location'}
              </span>
              <svg className="w-3.5 h-3.5 text-gray-500 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Right section */}
        <div className="header-actions">
          {user ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="header-profile-strip"
            >
              {/* Notification bell */}
              <button
                className="header-icon-btn"
                title="Notifications"
                onClick={handleNotificationClick}
                style={{ position: 'relative' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="header-icon-svg">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    minWidth: '17px',
                    height: '17px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    border: '2px solid #fff',
                    pointerEvents: 'none',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <span className="header-profile-divider" />

              <div className="header-profile-info">
                <div className="header-avatar-static">{initials}</div>
                <div className="header-profile-text">
                  <span className="header-profile-greeting">Hello,</span>
                  <span className="header-profile-name">{firstName}</span>
                </div>
              </div>

              <Link to="/dashboard" className="header-dashboard-btn">My Dashboard</Link>

              <button onClick={handleLogout} className="header-logout-btn" title="Logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </motion.div>
          ) : (
            <>
              <Link to="/login" className="header-btn-outline">Login</Link>
              <Link to="/signup" className="header-btn-solid">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onSave={handleSaveLocation}
          currentProfile={currentProfile}
        />
      )}
    </header>
  );
};

export default Header;
