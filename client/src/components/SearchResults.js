import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const gradients = ['tc-av-rose', 'tc-av-indigo', 'tc-av-amber'];
const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

/* ── Single result card ── */
const ResultCard = ({ tailor, index, query }) => {
    const navigate = useNavigate();
    const id = tailor.id || tailor.user_id;
    const initials = getInitials(tailor.full_name);
    const gradient = gradients[index % gradients.length];
    const city = tailor.city || '';
    const state = tailor.state || '';
    const area = [city, state].filter(Boolean).join(', ') || '—';
    const products = tailor.products || [];
    const startingPrice = products.length > 0
        ? `From ₹${Math.min(...products.map(p => Number(p.price) || 0))}`
        : null;

    // Highlight matching product names
    const matchedProducts = products.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className="sr-card"
            onClick={() => navigate(`/tailor-profile/${id}`)}
        >
            {/* Avatar */}
            <div className={`sr-avatar ${gradient}`}>{initials}</div>

            {/* Info */}
            <div className="sr-info">
                <div className="sr-name-row">
                    <span className="sr-name">{tailor.full_name}</span>
                    <span className="sr-area">📍 {area}</span>
                </div>

                {matchedProducts.length > 0 && (
                    <div className="sr-matched-products">
                        {matchedProducts.slice(0, 3).map((p, i) => (
                            <span key={i} className="sr-product-chip">
                                ✂️ {p.name}{p.price ? ` · ₹${p.price}` : ''}
                            </span>
                        ))}
                    </div>
                )}

                {matchedProducts.length === 0 && products.length > 0 && (
                    <p className="sr-specialty">
                        {products.slice(0, 2).map(p => p.name).join(' · ')}
                    </p>
                )}

                <div className="sr-bottom">
                    {startingPrice && <span className="sr-price">{startingPrice}</span>}
                    <button
                        className="sr-btn"
                        onClick={e => { e.stopPropagation(); navigate(`/tailor-profile/${id}`); }}
                    >
                        View Profile →
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/* ── Main SearchResults Component ── */
const SearchResults = ({ query, onClear }) => {
    const [allTailors, setAllTailors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/api/tailors')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.tailors) setAllTailors(data.tailors);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return allTailors.filter(t => {
            const nameMatch = t.full_name?.toLowerCase().includes(q);
            const cityMatch = t.city?.toLowerCase().includes(q);
            const stateMatch = t.state?.toLowerCase().includes(q);
            const productMatch = (t.products || []).some(p =>
                p.name?.toLowerCase().includes(q)
            );
            return nameMatch || cityMatch || stateMatch || productMatch;
        });
    }, [query, allTailors]);

    return (
        <div className="sr-container">
            {/* Header */}
            <div className="sr-header">
                <div>
                    <h2 className="sr-title">
                        {loading ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''} for`}
                        {!loading && <span className="sr-query"> "{query}"</span>}
                    </h2>
                    {!loading && results.length > 0 && (
                        <p className="sr-subtitle">Showing tailors near your area</p>
                    )}
                </div>
                <button className="sr-clear-btn" onClick={onClear}>✕ Clear</button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="sr-loading">
                    <span className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <p>Looking for tailors…</p>
                </div>
            )}

            {/* No results */}
            {!loading && results.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="sr-empty"
                >
                    <span className="sr-empty-icon">🔍</span>
                    <p className="sr-empty-title">No tailors found</p>
                    <p className="sr-empty-sub">
                        Try searching by tailor name, city, or product like "Shirt" or "Bridal"
                    </p>
                </motion.div>
            )}

            {/* Results */}
            <AnimatePresence>
                <div className="sr-list">
                    {results.map((t, i) => (
                        <ResultCard
                            key={t.id || t.user_id || i}
                            tailor={t}
                            index={i}
                            query={query}
                        />
                    ))}
                </div>
            </AnimatePresence>
        </div>
    );
};

export default SearchResults;
