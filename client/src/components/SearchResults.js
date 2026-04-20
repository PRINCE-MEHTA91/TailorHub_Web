import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const gradients = ['tc-av-rose', 'tc-av-indigo', 'tc-av-amber'];
const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

function resolveImg(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
}

function getTodayTiming(timings) {
    if (!timings) return null;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = days[new Date().getDay()];
    return timings[today] || null;
}

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
    const profileImgUrl = resolveImg(tailor.profile_img);
    const todayTiming = getTodayTiming(tailor.timings);
    const isOpen = todayTiming && !todayTiming.closed;
    const specialities = Array.isArray(tailor.specialities) ? tailor.specialities : [];

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
            {/* Top: Avatar + Info */}
            <div className="sr-card-top">
                {/* Avatar */}
                <div className="tc-avatar-wrap">
                    {profileImgUrl ? (
                        <img src={profileImgUrl} alt={tailor.full_name} className="tc-avatar-img" />
                    ) : (
                        <div className={`sr-avatar ${gradient}`}>{initials}</div>
                    )}
                    {todayTiming && (
                        <span className={`tc-availability-dot ${isOpen ? 'tc-dot-open' : 'tc-dot-closed'}`} />
                    )}
                </div>

                {/* Info */}
                <div className="sr-info">
                    <div className="sr-name-row">
                        <span className="sr-name">{tailor.full_name}</span>
                        <span className="sr-area">📍 {area}</span>
                    </div>

                    {/* Tagline */}
                    {tailor.tagline && (
                        <p className="tc-tagline" style={{ marginBottom: '0.25rem' }}>"{tailor.tagline}"</p>
                    )}

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
                </div>
            </div>

            {/* Pills row: experience, timing, specialities, rating */}
            {(tailor.experience || todayTiming || specialities.length > 0 || tailor.avg_rating > 0) && (
                <div className="tc-pills-row" style={{ marginTop: '0.6rem' }}>
                    {tailor.avg_rating > 0 && (
                        <span className="tc-pill tc-pill-rating" style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                            ⭐ {tailor.avg_rating} ({tailor.total_reviews})
                        </span>
                    )}
                    {tailor.experience && (
                        <span className="tc-pill tc-pill-exp">🏆 {tailor.experience}</span>
                    )}
                    {todayTiming && (
                        <span className={`tc-pill ${isOpen ? 'tc-pill-open' : 'tc-pill-closed'}`}>
                            🕐 {isOpen ? `${todayTiming.open} – ${todayTiming.close}` : 'Closed Today'}
                        </span>
                    )}
                    {specialities.slice(0, 1).map(s => (
                        <span key={s} className="tc-pill tc-pill-spec">{s}</span>
                    ))}
                </div>
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
        </motion.div>
    );
};

/* ── Main SearchResults Component ── */
const SearchResults = ({ query, onClear }) => {
    const [allTailors, setAllTailors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/tailors`)
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
            const taglineMatch = t.tagline?.toLowerCase().includes(q);
            const productMatch = (t.products || []).some(p =>
                p.name?.toLowerCase().includes(q)
            );
            const specialityMatch = (t.specialities || []).some(s =>
                s?.toLowerCase().includes(q)
            );
            return nameMatch || cityMatch || stateMatch || productMatch || taglineMatch || specialityMatch;
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
                        Try searching by tailor name, city, product like "Shirt", speciality like "Bridal" or "Ethnic Wear"
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
