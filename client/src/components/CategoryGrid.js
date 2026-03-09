import React from 'react';
import { motion } from 'framer-motion';

const categories = [
  { id: 1, emoji: '👰', name: 'Bridal', count: '240+ designs', gradient: 'cg-rose' },
  { id: 2, emoji: '🤵', name: 'Suits', count: '180+ styles', gradient: 'cg-indigo' },
  { id: 3, emoji: '🧥', name: 'Kurta', count: '320+ styles', gradient: 'cg-amber' },
  { id: 4, emoji: '✂️', name: 'Blouses', count: '150+ cuts', gradient: 'cg-pink' },
  { id: 5, emoji: '🧒', name: 'Kids Wear', count: '90+ designs', gradient: 'cg-cyan' },
  { id: 6, emoji: '🔧', name: 'Alterations', count: 'Quick fix', gradient: 'cg-violet' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
};

const CategoryGrid = () => (
  <section className="cg-section">
    <div className="cg-header">
      <h2 className="cg-title">Shop by Category</h2>
      <button className="cg-view-all">See all →</button>
    </div>
    <motion.div
      className="cg-grid"
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {categories.map((cat) => (
        <motion.button
          key={cat.id}
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.97 }}
          className={`cg-card ${cat.gradient}`}
        >
          <span className="cg-emoji">{cat.emoji}</span>
          <span className="cg-name">{cat.name}</span>
          <span className="cg-count">{cat.count}</span>
        </motion.button>
      ))}
    </motion.div>
  </section>
);

export default CategoryGrid;
