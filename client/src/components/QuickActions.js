import React from 'react';
import { motion } from 'framer-motion';

const actions = [
  {
    icon: '🗂️',
    label: 'Categories',
    gradient: 'qa-amber',
    desc: '50+ types',
  },
  {
    icon: '🔥',
    label: 'Deals',
    gradient: 'qa-rose',
    desc: 'Up to 40% off',
    badge: 'HOT',
  },
  {
    icon: '🆕',
    label: 'New Arrivals',
    gradient: 'qa-emerald',
    desc: 'Just added',
  },
  {
    icon: '📈',
    label: 'Trending',
    gradient: 'qa-violet',
    desc: 'This week',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const QuickActions = () => (
  <section className="qa-section">
    <motion.div
      className="qa-grid"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {actions.map((action) => (
        <motion.button
          key={action.label}
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={`qa-card ${action.gradient}`}
        >
          {action.badge && (
            <span className="qa-badge">{action.badge}</span>
          )}
          <span className="qa-icon">{action.icon}</span>
          <span className="qa-label">{action.label}</span>
          <span className="qa-desc">{action.desc}</span>
        </motion.button>
      ))}
    </motion.div>
  </section>
);

export default QuickActions;
