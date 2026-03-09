import React from 'react';
import { motion } from 'framer-motion';

const products = [
  {
    id: 1,
    emoji: '👗',
    name: 'Bridal Lehenga',
    category: 'Bridal',
    price: '₹8,999',
    originalPrice: '₹12,000',
    rating: 4.9,
    reviews: 128,
    tailor: 'Priya Boutique',
    tag: 'Best Seller',
    tagColor: 'fp-tag-gold',
  },
  {
    id: 2,
    emoji: '🤵',
    name: 'Men\'s 3-Piece Suit',
    category: 'Formal',
    price: '₹4,499',
    originalPrice: '₹6,000',
    rating: 4.7,
    reviews: 89,
    tailor: 'Khan & Sons',
    tag: 'Top Rated',
    tagColor: 'fp-tag-blue',
  },
  {
    id: 3,
    emoji: '🧥',
    name: 'Festive Kurta Set',
    category: 'Ethnic',
    price: '₹1,899',
    originalPrice: '₹2,500',
    rating: 4.8,
    reviews: 203,
    tailor: 'Meera Creations',
    tag: 'Hot Deal 🔥',
    tagColor: 'fp-tag-rose',
  },
  {
    id: 4,
    emoji: '👘',
    name: 'Silk Saree Blouse',
    category: 'Women',
    price: '₹650',
    originalPrice: '₹900',
    rating: 4.6,
    reviews: 64,
    tailor: 'Anita Tailors',
    tag: 'Quick Stitch',
    tagColor: 'fp-tag-teal',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="fp-stars">
      {'★'.repeat(full)}{half ? '½' : ''}
    </span>
  );
};

const FeaturedProducts = () => (
  <section className="fp-section">
    <div className="fp-header">
      <div>
        <h2 className="fp-title">Featured Styles</h2>
        <p className="fp-subtitle">Hand-picked from top tailors</p>
      </div>
      <button className="fp-view-all">View All →</button>
    </div>

    <motion.div
      className="fp-grid"
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {products.map((p) => {
        const disc = Math.round((1 - parseInt(p.price.replace(/\D/g,'')) / parseInt(p.originalPrice.replace(/\D/g,''))) * 100);
        return (
          <motion.div
            key={p.id}
            variants={cardVariants}
            whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
            className="fp-card"
          >
            {/* Tag */}
            <span className={`fp-tag ${p.tagColor}`}>{p.tag}</span>

            {/* Discount badge */}
            {disc > 0 && <span className="fp-disc-badge">{disc}% OFF</span>}

            {/* Emoji preview */}
            <div className="fp-emoji-wrap">
              <span className="fp-emoji">{p.emoji}</span>
            </div>

            {/* Info */}
            <div className="fp-info">
              <p className="fp-category">{p.category}</p>
              <h3 className="fp-name">{p.name}</h3>
              <p className="fp-tailor">by {p.tailor}</p>
              <div className="fp-rating-row">
                {renderStars(p.rating)}
                <span className="fp-rating-val">{p.rating}</span>
                <span className="fp-rating-count">({p.reviews})</span>
              </div>
              <div className="fp-price-row">
                <span className="fp-price">{p.price}</span>
                <span className="fp-original-price">{p.originalPrice}</span>
              </div>
              <button className="fp-btn">Book Now</button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  </section>
);

export default FeaturedProducts;
