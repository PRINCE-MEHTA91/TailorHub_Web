import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/* ── Hardcoded fallback tailors (shown if no tailor has saved a profile yet) ── */
const fallbackTailors = [
  {
    id: 'f1', full_name: 'Priya Boutique', initials: 'PB',
    specialty: 'Bridal & Lehenga', rating: 4.9, reviews: 312,
    city: '1.2 km away', products: [{ name: 'Bridal Lehenga', price: '2000' }],
    badge: '👑 Top Rated', avatarGradient: 'tc-av-rose',
  },
  {
    id: 'f2', full_name: 'Khan & Sons', initials: 'KS',
    specialty: "Men's Formal Wear", rating: 4.7, reviews: 198,
    city: '2.5 km away', products: [{ name: 'Suit Tailoring', price: '3500' }],
    badge: '✅ Verified', avatarGradient: 'tc-av-indigo',
  },
  {
    id: 'f3', full_name: 'Meera Creations', initials: 'MC',
    specialty: 'Ladies Ethnic Wear', rating: 4.8, reviews: 421,
    city: '0.8 km away', products: [{ name: 'Blouse Stitching', price: '500' }],
    badge: '⚡ Quick Stitch', avatarGradient: 'tc-av-amber',
  },
];

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  show: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const gradients = ['tc-av-rose', 'tc-av-indigo', 'tc-av-amber'];

/* ── Tailor Card ── */
const TailorCard = ({ tailor, index }) => {
  const initials = tailor.initials || getInitials(tailor.full_name);
  const avatarGradient = tailor.avatarGradient || gradients[index % gradients.length];
  const location = tailor.city ? `${tailor.city}${tailor.state ? ', ' + tailor.state : ''}` : '—';
  const startingPrice = tailor.products && tailor.products.length > 0
    ? `From ₹${Math.min(...tailor.products.map(p => Number(p.price) || 0))}`
    : null;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-30px' }}
      whileHover={{ x: 4 }}
      className="tc-card"
    >
      {/* Avatar */}
      <div className={`tc-avatar ${avatarGradient}`}>{initials}</div>

      {/* Info */}
      <div className="tc-info">
        <div className="tc-name-row">
          <span className="tc-name">{tailor.full_name}</span>
          {tailor.badge && <span className="tc-badge">{tailor.badge}</span>}
        </div>

        {/* Products as specialty line */}
        <p className="tc-specialty">
          {tailor.products && tailor.products.length > 0
            ? tailor.products.slice(0, 2).map(p => p.name).join(' · ')
            : 'Tailoring Services'}
        </p>

        <div className="tc-meta">
          {tailor.rating && (
            <>
              <span className="tc-stars">{'★'.repeat(Math.floor(tailor.rating))}</span>
              <span className="tc-rating">{tailor.rating}</span>
              {tailor.reviews && <span className="tc-reviews">({tailor.reviews})</span>}
              <span className="tc-dot">·</span>
            </>
          )}
          <span className="tc-dist">📍 {location}</span>
        </div>

        <div className="tc-bottom">
          {startingPrice && <span className="tc-price">{startingPrice}</span>}
          <button className="tc-btn">View Profile</button>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main Component ── */
const TailorConnect = () => {
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/tailors')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.tailors && data.tailors.length > 0) {
          setTailors(data.tailors);
        } else {
          setTailors(fallbackTailors);
        }
      })
      .catch(() => setTailors(fallbackTailors))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="tc-section">
      <div className="tc-header">
        <div>
          <h2 className="tc-title">Top Tailors Near You</h2>
          <p className="tc-subtitle">Trusted by thousands of customers</p>
        </div>
        <button className="tc-view-all">View All →</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="tc-list">
          {tailors.map((t, i) => (
            <TailorCard key={t.id || t.user_id || i} tailor={t} index={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default TailorConnect;
