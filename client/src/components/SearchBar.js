import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SearchBar = () => {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <div className="sb-wrap">
      <motion.div
        animate={{ scale: focused ? 1.01 : 1 }}
        transition={{ duration: 0.15 }}
        className="sb-inner"
      >
        {/* Search Icon */}
        <span className="sb-search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sb-icon-svg">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search for tailors, fabrics, and more…"
          className="sb-input"
        />

        <button className="sb-btn" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, marginRight: 5 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Search
        </button>
      </motion.div>

      {/* Quick search chips */}
      <div className="sb-chips">
        {['Bridal Wear', 'Men\'s Suit', 'Alterations', 'Kurta'].map((chip) => (
          <button key={chip} onClick={() => setQuery(chip)} className="sb-chip">
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
