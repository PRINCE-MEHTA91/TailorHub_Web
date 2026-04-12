import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuickActions from '../components/QuickActions';
import HeroBanner from '../components/HeroBanner';
import ActiveOffers from '../components/ActiveOffers';
import FeaturedProducts from '../components/FeaturedProducts';
import FeaturedPricing from '../components/FeaturedPricing';
import CategoryGrid from '../components/CategoryGrid';
import TailorConnect from '../components/TailorConnect';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const deals = [
  { id: 1, emoji: '👔', label: 'Shirt Stitching', cut: '35%', price: '₹299', bg: '#ffe4e6' },
  { id: 2, emoji: '👗', label: 'Dress Alteration', cut: '25%', price: '₹149', bg: '#ede9fe' },
  { id: 3, emoji: '🩱', label: 'Blouse Design', cut: '40%', price: '₹399', bg: '#fef3c7' },
  { id: 4, emoji: '🕴️', label: 'Suit Tailoring', cut: '20%', price: '₹1,299', bg: '#d1fae5' },
  { id: 5, emoji: '🧣', label: 'Kurta Custom', cut: '30%', price: '₹549', bg: '#cffafe' },
];

const DealsStrip = () => {
  const navigate = useNavigate();
  return (
  <section className="deals-section">
    <div className="deals-header">
      <span className="deals-title">🔥 Deals of the Day</span>
      <span
        className="deals-timer"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/browse-deals')}
      >
        See All Deals →
      </span>
    </div>
    <div className="deals-scroll">
      {deals.map((d, i) => (
        <motion.button
          key={d.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="deal-card"
          style={{ background: d.bg, cursor: 'pointer' }}
          onClick={() => navigate('/browse-deals')}
        >
          <span className="deal-emoji">{d.emoji}</span>
          <span className="deal-cut">-{d.cut}</span>
          <span className="deal-label">{d.label}</span>
          <span className="deal-price">{d.price}</span>
        </motion.button>
      ))}
    </div>
  </section>
  );
};

const IndexPage = ({ onCategoryClick }) => {
    const { user, loading } = useAuth();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            const timer = setTimeout(() => setShowModal(true), 800);
            return () => clearTimeout(timer);
        }
    }, [loading, user]);

    return (
        <>
            {showModal && <AuthModal onClose={() => setShowModal(false)} />}
            <QuickActions />
            <HeroBanner />
            <ActiveOffers />
            <DealsStrip />
            <FeaturedProducts />
            <FeaturedPricing />
            <CategoryGrid onCategoryClick={onCategoryClick} />
            <TailorConnect />
        </>
    );
};

export default IndexPage;
