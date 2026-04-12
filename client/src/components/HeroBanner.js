import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HeroBanner = () => {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="hero-banner-wrap"
    >
      <div className="hero-banner">
        {/* Decorative circles */}
        <div className="hero-deco hero-deco-1" />
        <div className="hero-deco hero-deco-2" />
        <div className="hero-deco hero-deco-3" />

        {/* Left content */}
        <div className="hero-content">
          {user ? (
            <p className="hero-greeting">Hello, {firstName} 👋</p>
          ) : (
            <p className="hero-greeting">Welcome to TailorHub ✨</p>
          )}
          <h1 className="hero-title">
            Your Perfect Tailor,<br />
            <span className="hero-title-highlight">One Tap Away</span>
          </h1>
          <p className="hero-subtitle">
            Custom stitching, premium fabrics &amp; trusted tailors near you
          </p>
          <div className="hero-cta-row">
            <button className="hero-btn-primary" onClick={() => navigate('/browse-deals')}>Browse Tailors →</button>
            <button className="hero-btn-secondary" onClick={() => navigate('/browse-deals')}>View Deals</button>
          </div>

          {/* Trust badges */}
          <div className="hero-badges">
            <span className="hero-badge">⭐ 10k+ Tailors</span>
            <span className="hero-badge">✅ Verified</span>
            <span className="hero-badge">🚀 Quick Delivery</span>
          </div>
        </div>

        {/* Right illustration */}
        <div className="hero-illustration" aria-hidden="true">
          <div className="hero-illus-circle">
            <span className="hero-illus-icon">✂️</span>
          </div>
          <div className="hero-illus-float hero-illus-float-1">👗</div>
          <div className="hero-illus-float hero-illus-float-2">🧵</div>
          <div className="hero-illus-float hero-illus-float-3">🎀</div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroBanner;
