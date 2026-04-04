import React, { useState, useEffect } from 'react';
import QuickActions from '../components/QuickActions';
import HeroBanner from '../components/HeroBanner';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryGrid from '../components/CategoryGrid';
import TailorConnect from '../components/TailorConnect';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

/* ──── Deals of the Day ─────────────────────────────── */
const deals = [
  { id: 1, emoji: '👔', label: 'Shirt Stitching', cut: '35%', price: '₹299', bg: '#ffe4e6' },
  { id: 2, emoji: '👗', label: 'Dress Alteration', cut: '25%', price: '₹149', bg: '#ede9fe' },
  { id: 3, emoji: '🩱', label: 'Blouse Design', cut: '40%', price: '₹399', bg: '#fef3c7' },
  { id: 4, emoji: '🕴️', label: 'Suit Tailoring', cut: '20%', price: '₹1,299', bg: '#d1fae5' },
  { id: 5, emoji: '🧣', label: 'Kurta Custom', cut: '30%', price: '₹549', bg: '#cffafe' },
];

const DealsStrip = () => (
  <section className="deals-section">
    <div className="deals-header">
      <span className="deals-title">🔥 Deals of the Day</span>
      <span className="deals-timer">⏰ Ends in 06:42:19</span>
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
          style={{ background: d.bg }}
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

/* ──── Main Index Page ─────────────────────────────── */
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
            <DealsStrip />
            <FeaturedProducts />
            <CategoryGrid onCategoryClick={onCategoryClick} />
            <TailorConnect />
        </>
    );
};

export default IndexPage;
