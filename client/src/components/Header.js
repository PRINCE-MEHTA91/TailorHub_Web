import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const firstName = user?.full_name?.split(' ')[0] || '';

  return (
    <header className="tailorhub-header sticky top-0 z-50">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="header-logo-icon">✂️</span>
          <span className="header-logo-text">TailorHub</span>
        </Link>

        {/* Right section */}
        <div className="header-actions">
          {user ? (
            /* ── LOGGED-IN: always-visible profile strip ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="header-profile-strip"
            >
              {/* Notification bell */}
              <button className="header-icon-btn" title="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="header-icon-svg">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="header-icon-badge" />
              </button>

              {/* Divider */}
              <span className="header-profile-divider" />

              {/* Avatar + name (always visible, no dropdown) */}
              <div className="header-profile-info">
                <div className="header-avatar-static">{initials}</div>
                <div className="header-profile-text">
                  <span className="header-profile-greeting">Hello,</span>
                  <span className="header-profile-name">{firstName}</span>
                </div>
              </div>

              {/* Dashboard shortcut */}
              <Link to="/dashboard" className="header-dashboard-btn">
                My Dashboard
              </Link>

              {/* Logout */}
              <button onClick={handleLogout} className="header-logout-btn" title="Logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </motion.div>
          ) : (
            /* ── GUEST: login / sign up buttons ── */
            <>
              <Link to="/login" className="header-btn-outline">Login</Link>
              <Link to="/signup" className="header-btn-solid">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
