import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://tailorhub-web.onrender.com';

function resolveImg(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const STYLE_CATEGORIES = [
  { id: 'formal', icon: '👔', label: 'Formal Wear', desc: 'Suits, Blazers, Sherwanis', color: '#1e293b', badge: 'Classic' },
  { id: 'ethnic', icon: '👗', label: 'Ethnic Wear', desc: 'Sarees, Salwar, Lehenga', color: '#9f1239', badge: 'Trending' },
  { id: 'custom', icon: '🧵', label: 'Custom Stitch', desc: 'Your design, their craft', color: '#4c1d95', badge: 'Popular' },
  { id: 'casual', icon: '🎽', label: 'Casual Wear', desc: 'Everyday comfort fits', color: '#0369a1', badge: 'New' },
  { id: 'wedding', icon: '🤵', label: 'Wedding Outfit', desc: 'Groom & Bridal wear', color: '#92400e', badge: 'Season' },
  { id: 'alteration', icon: '🪡', label: 'Alteration', desc: 'Perfect fit, every time', color: '#065f46', badge: 'Quick' },
];

const BUDGET_OPTIONS = [
  { id: 'budget', icon: '💰', label: 'Budget Friendly', desc: 'Under ₹1,000', range: [0, 1000] },
  { id: 'mid', icon: '💎', label: 'Mid Range', desc: '₹1,000 – ₹5,000', range: [1000, 5000] },
  { id: 'premium', icon: '👑', label: 'Premium', desc: '₹5,000 – ₹15,000', range: [5000, 15000] },
  { id: 'luxury', icon: '✨', label: 'Luxury', desc: '₹15,000+', range: [15000, Infinity] },
];

const EXPERIENCE_OPTIONS = [
  { id: 'any', label: 'Any Experience', desc: 'Open to all', icon: '🌟' },
  { id: 'emerging', label: 'Emerging Talent', desc: '1–3 years', icon: '🌱' },
  { id: 'skilled', label: 'Skilled Artisan', desc: '3–7 years', icon: '✂️' },
  { id: 'master', label: 'Master Tailor', desc: '7+ years', icon: '🏆' },
];

const SCORE_KEY = 'tailorhub_ai_recommendations';

function scoreAndRankTailors(tailors, prefs) {
  return tailors
    .map((t) => {
      let score = 0;

      // Rating: max 40 pts
      const rating = parseFloat(t.avg_rating) || 0;
      score += rating * 8;

      // Reviews: max 15 pts
      const reviews = parseInt(t.total_reviews) || 0;
      score += Math.min(reviews / 5, 15);

      // Speciality match: 25 pts
      const specs = Array.isArray(t.specialities) ? t.specialities : [];
      const styleMap = {
        formal: ['formal', 'suit', 'blazer', 'sherwani'],
        ethnic: ['ethnic', 'saree', 'salwar', 'lehenga', 'kurta'],
        custom: ['custom', 'design', 'bespoke'],
        casual: ['casual', 'everyday', 'comfort'],
        wedding: ['wedding', 'bridal', 'groom'],
        alteration: ['alteration', 'repair', 'fitting'],
      };
      const keywords = styleMap[prefs.style] || [];
      const matched = specs.some((s) =>
        keywords.some((k) => s.toLowerCase().includes(k))
      );
      if (matched) score += 25;

      // Price match: 15 pts
      if (prefs.budget && t.price_listings && t.price_listings.length > 0) {
        const [min, max] = BUDGET_OPTIONS.find((b) => b.id === prefs.budget)?.range || [0, Infinity];
        const prices = t.price_listings.map((p) => parseFloat(p.price || p.amount || 0)).filter(Boolean);
        if (prices.length > 0) {
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          if (avg >= min && avg <= max) score += 15;
        }
      }

      // Experience match: 5 pts
      const expYears = parseInt(t.experience) || 0;
      const expMatch = {
        any: true,
        emerging: expYears >= 1 && expYears <= 3,
        skilled: expYears >= 3 && expYears <= 7,
        master: expYears >= 7,
      };
      if (expMatch[prefs.experience]) score += 5;

      return { ...t, _aiScore: Math.round(score) };
    })
    .sort((a, b) => b._aiScore - a._aiScore);
}

// ── Sub-components ────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// ── Step 1: Hero ──────────────────────────────────────────────────────────────

const HeroSection = ({ onGetStarted, onViewPrevious, hasPrevious }) => (
  <motion.div
    key="hero"
    variants={fadeUp}
    initial="hidden"
    animate="show"
    exit="exit"
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 1rem' }}
  >
    {/* Animated sparkle orbs */}
    <div style={{ position: 'relative', marginBottom: '2rem' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 120, height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 60px rgba(99,102,241,0.25)',
        }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(139,92,246,0.3))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
          }}
        >
          ✨
        </motion.div>
      </motion.div>
      {/* Floating dots */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <motion.div
          key={deg}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 8, height: 8,
            borderRadius: '50%',
            background: `hsl(${220 + i * 20}, 70%, 65%)`,
            transform: `rotate(${deg}deg) translateX(65px) translateY(-50%)`,
          }}
        />
      ))}
    </div>

    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.12))',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 100, padding: '6px 16px',
        marginBottom: '1rem',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', letterSpacing: '0.05em' }}>AI POWERED</span>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: '#06b6d4' }}>SMART MATCHING</span>
    </motion.div>

    <h1
      style={{
        fontFamily: 'Sora, sans-serif',
        fontSize: 'clamp(2rem, 6vw, 3.5rem)',
        fontWeight: 900,
        lineHeight: 1.1,
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #1e293b 0%, #6366f1 50%, #06b6d4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      ✨ AI Recommended
    </h1>
    <p style={{
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      color: '#64748b',
      maxWidth: 480,
      lineHeight: 1.7,
      marginBottom: '2.5rem',
      fontWeight: 500,
    }}>
      Smart picks tailored to your style — answer a few quick questions and let our AI match you with the perfect tailor.
    </p>

    {/* Buttons */}
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onGetStarted}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          fontFamily: 'Sora, sans-serif',
          fontWeight: 800,
          fontSize: 16,
          border: 'none',
          borderRadius: 16,
          padding: '14px 32px',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          letterSpacing: '-0.01em',
        }}
      >
        <span style={{ fontSize: 20 }}>🚀</span>
        Get Started
      </motion.button>

      {hasPrevious && (
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onViewPrevious}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff',
            color: '#374151',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 800,
            fontSize: 16,
            border: '2px solid #e5e7eb',
            borderRadius: 16,
            padding: '12px 28px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            letterSpacing: '-0.01em',
          }}
        >
          <span style={{ fontSize: 20 }}>📋</span>
          View Previous Recommendations
        </motion.button>
      )}
    </div>

    {/* Feature pills */}
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: '3rem' }}
    >
      {[
        { icon: '⭐', text: 'Rating-based ranking' },
        { icon: '📍', text: 'City-aware matching' },
        { icon: '💬', text: 'Review-driven insights' },
        { icon: '⚡', text: 'Instant results' },
      ].map((f) => (
        <motion.div
          key={f.text}
          variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 100,
            padding: '8px 16px',
          }}
        >
          <span>{f.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{f.text}</span>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);

// ── Step 2: Style Quiz ────────────────────────────────────────────────────────

const QuizStep = ({ step, total, title, subtitle, children }) => (
  <motion.div key={`quiz-${step}`} variants={fadeUp} initial="hidden" animate="show" exit="exit">
    {/* Progress */}
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>Step {step} of {total}</span>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{Math.round((step / total) * 100)}% complete</span>
      </div>
      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: `${((step - 1) / total) * 100}%` }}
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: 100 }}
        />
      </div>
    </div>

    <h2 style={{
      fontFamily: 'Sora, sans-serif', fontWeight: 900,
      fontSize: 'clamp(1.3rem, 4vw, 2rem)',
      color: '#0f172a', marginBottom: 6,
    }}>{title}</h2>
    <p style={{ fontSize: 15, color: '#64748b', marginBottom: '1.75rem', lineHeight: 1.6 }}>{subtitle}</p>
    {children}
  </motion.div>
);

// ── Step 3: Results ───────────────────────────────────────────────────────────

const MatchScore = ({ score }) => {
  const percent = Math.min(100, Math.max(0, Math.round((score / 100) * 100)));
  const color = percent >= 80 ? '#10b981' : percent >= 60 ? '#6366f1' : '#f59e0b';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: `${color}15`, border: `1.5px solid ${color}30`,
      borderRadius: 100, padding: '4px 12px',
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'Sora, sans-serif' }}>
        {percent}% Match
      </span>
    </div>
  );
};

const TailorResultCard = ({ tailor, rank, navigate }) => {
  const initials = tailor.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'T';
  const loc = tailor.city ? `${tailor.city}${tailor.state ? ', ' + tailor.state : ''}` : 'Location unknown';
  const rating = parseFloat(tailor.avg_rating) || 0;
  const stars = '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(Math.max(0, 5 - Math.ceil(rating)));
  const rankColors = ['linear-gradient(135deg,#f59e0b,#fbbf24)', 'linear-gradient(135deg,#94a3b8,#cbd5e1)', 'linear-gradient(135deg,#b45309,#d97706)'];
  const rankColor = rankColors[rank - 1] || 'linear-gradient(135deg,#6366f1,#8b5cf6)';

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(99,102,241,0.12)' }}
      onClick={() => navigate(`/tailor-profile/${tailor.id}`)}
      style={{
        background: '#fff',
        borderRadius: 24,
        border: rank === 1 ? '2px solid #6366f1' : '1.5px solid #f1f5f9',
        boxShadow: rank === 1
          ? '0 8px 32px rgba(99,102,241,0.15)'
          : '0 4px 16px rgba(0,0,0,0.04)',
        padding: '1.25rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s',
      }}
    >
      {/* Top badge */}
      {rank <= 3 && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: rankColor,
          color: '#fff',
          fontFamily: 'Sora, sans-serif',
          fontWeight: 900, fontSize: 10,
          borderRadius: 100, padding: '4px 10px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {rank === 1 ? '🥇 Best Match' : rank === 2 ? '🥈 2nd Pick' : '🥉 3rd Pick'}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72,
          borderRadius: 18,
          flexShrink: 0,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #e0e7ff, #ddd6fe)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #e0e7ff',
        }}>
          {tailor.profile_img ? (
            <img
              src={resolveImg(tailor.profile_img)}
              alt={tailor.full_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontWeight: 900, fontSize: 24, color: '#6366f1' }}>{initials}</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 900,
            fontSize: 17, color: '#0f172a', marginBottom: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {tailor.shop_name || tailor.full_name}
          </h3>
          {tailor.tagline && (
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6, lineHeight: 1.5 }}>
              {tailor.tagline}
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#f59e0b', fontSize: 12, letterSpacing: -1 }}>{stars.slice(0, 5)}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
                {rating > 0 ? rating.toFixed(1) : 'New'}
              </span>
              {tailor.total_reviews > 0 && (
                <span style={{ fontSize: 11, color: '#94a3b8' }}>({tailor.total_reviews})</span>
              )}
            </div>

            {/* Location */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#f8fafc', borderRadius: 100,
              padding: '3px 10px', border: '1px solid #e2e8f0',
            }}>
              <span style={{ fontSize: 10 }}>📍</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {loc}
              </span>
            </div>

            {/* Match score */}
            <MatchScore score={tailor._aiScore} />
          </div>

          {/* Specialities */}
          {Array.isArray(tailor.specialities) && tailor.specialities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {tailor.specialities.slice(0, 3).map((s, i) => (
                <span key={i} style={{
                  fontSize: 10, fontWeight: 700, color: '#6366f1',
                  background: '#eef2ff', borderRadius: 100, padding: '2px 8px',
                  border: '1px solid #c7d2fe',
                }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: 8 }}>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/tailor-profile/${tailor.id}`); }}
          style={{
            flex: 1,
            background: rank === 1 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f8fafc',
            color: rank === 1 ? '#fff' : '#374151',
            fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 13,
            border: rank === 1 ? 'none' : '1.5px solid #e2e8f0',
            borderRadius: 12, padding: '10px',
            cursor: 'pointer',
          }}
        >
          View Profile →
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/book-appointment/${tailor.id}`); }}
          style={{
            background: '#fff',
            color: '#6366f1',
            fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 13,
            border: '1.5px solid #c7d2fe',
            borderRadius: 12, padding: '10px 16px',
            cursor: 'pointer',
          }}
        >
          Book
        </button>
      </div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const QUIZ_TOTAL_STEPS = 3;

const AiRecommendationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [phase, setPhase] = useState('hero'); // hero | quiz | results | previous
  const [quizStep, setQuizStep] = useState(1);
  const [prefs, setPrefs] = useState({ style: '', budget: '', experience: 'any' });
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [previousRecs, setPreviousRecs] = useState(null);

  // Load tailors once
  const loadTailors = useCallback(async () => {
    if (tailors.length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tailors`);
      const data = res.ok ? await res.json() : null;
      if (data?.tailors) setTailors(data.tailors);
    } catch (_) {}
    finally { setLoading(false); }
  }, [tailors.length]);

  // Load previous recommendations from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SCORE_KEY);
    if (stored) {
      try { setPreviousRecs(JSON.parse(stored)); } catch (_) {}
    }
  }, []);

  const handleGetStarted = () => {
    loadTailors();
    setQuizStep(1);
    setPrefs({ style: '', budget: '', experience: 'any' });
    setPhase('quiz');
  };

  const handleViewPrevious = () => {
    if (previousRecs) {
      setResults(previousRecs.results);
      setPhase('previous');
    }
  };

  const handleNextStep = () => {
    if (quizStep < QUIZ_TOTAL_STEPS) {
      setQuizStep((s) => s + 1);
    } else {
      // Generate results
      const ranked = scoreAndRankTailors(tailors, prefs);
      const top = ranked.slice(0, 8);
      setResults(top);
      // Persist
      localStorage.setItem(SCORE_KEY, JSON.stringify({ prefs, results: top, savedAt: new Date().toISOString() }));
      setPhase('results');
    }
  };

  const handleBack = () => {
    if (phase === 'quiz' && quizStep > 1) {
      setQuizStep((s) => s - 1);
    } else {
      setPhase('hero');
      setQuizStep(1);
    }
  };

  const canProceed = () => {
    if (quizStep === 1) return !!prefs.style;
    if (quizStep === 2) return !!prefs.budget;
    return true;
  };

  const greeting = user?.full_name ? `, ${user.full_name.split(' ')[0]}` : '';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f8faff 0%, #f0f4ff 40%, #e8f4ff 100%)',
      fontFamily: 'Sora, Poppins, sans-serif',
    }}>
      {/* ── Header bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 40, height: 40,
            borderRadius: '50%',
            background: '#f1f5f9',
            border: '1.5px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <span style={{
              fontWeight: 900, fontSize: 16, color: '#0f172a',
              fontFamily: 'Sora, sans-serif',
            }}>
              AI Recommended
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
            Smart picks tailored to your style.
          </p>
        </div>

        {(phase === 'results' || phase === 'previous') && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 800, fontSize: 13,
              border: 'none', borderRadius: 12,
              padding: '8px 16px', cursor: 'pointer',
              fontFamily: 'Sora, sans-serif',
            }}
          >
            Re-run ✨
          </motion.button>
        )}
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.25rem 6rem' }}>
        <AnimatePresence mode="wait">

          {/* ── HERO ── */}
          {phase === 'hero' && (
            <HeroSection
              key="hero"
              onGetStarted={handleGetStarted}
              onViewPrevious={handleViewPrevious}
              hasPrevious={!!previousRecs}
            />
          )}

          {/* ── QUIZ ── */}
          {phase === 'quiz' && (
            <motion.div key={`quiz-${quizStep}`} variants={fadeUp} initial="hidden" animate="show" exit="exit">
              <QuizStep
                step={quizStep}
                total={QUIZ_TOTAL_STEPS}
                title={
                  quizStep === 1 ? `What style${greeting}?` :
                  quizStep === 2 ? 'What\'s your budget?' :
                  'Preferred experience level?'
                }
                subtitle={
                  quizStep === 1 ? 'Pick the clothing category you need stitched.' :
                  quizStep === 2 ? 'We\'ll surface tailors who match your price range.' :
                  'Filter by years of craftsmanship.'
                }
              >
                {/* Step 1: Style */}
                {quizStep === 1 && (
                  <motion.div variants={stagger} initial="hidden" animate="show"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {STYLE_CATEGORIES.map((s) => (
                      <motion.button
                        key={s.id}
                        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPrefs((p) => ({ ...p, style: s.id }))}
                        style={{
                          position: 'relative',
                          background: prefs.style === s.id
                            ? `linear-gradient(135deg, ${s.color}ee, ${s.color}cc)`
                            : '#fff',
                          border: prefs.style === s.id ? `2px solid ${s.color}` : '2px solid #e2e8f0',
                          borderRadius: 20,
                          padding: '1.25rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          boxShadow: prefs.style === s.id
                            ? `0 8px 24px ${s.color}30`
                            : '0 2px 8px rgba(0,0,0,0.04)',
                          transition: 'all 0.25s',
                          overflow: 'hidden',
                        }}
                      >
                        {prefs.style === s.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              position: 'absolute', top: 10, right: 10,
                              width: 22, height: 22, borderRadius: '50%',
                              background: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                        <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>{s.icon}</span>
                        <p style={{
                          fontWeight: 900, fontSize: 14,
                          color: prefs.style === s.id ? '#fff' : '#0f172a',
                          fontFamily: 'Sora, sans-serif',
                        }}>{s.label}</p>
                        <p style={{
                          fontSize: 11, marginTop: 2, lineHeight: 1.5,
                          color: prefs.style === s.id ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                        }}>{s.desc}</p>
                        <span style={{
                          position: 'absolute', bottom: 10, right: 10,
                          fontSize: 9, fontWeight: 800,
                          color: prefs.style === s.id ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                          textTransform: 'uppercase', letterSpacing: '0.07em',
                        }}>{s.badge}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Step 2: Budget */}
                {quizStep === 2 && (
                  <motion.div variants={stagger} initial="hidden" animate="show"
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {BUDGET_OPTIONS.map((b) => (
                      <motion.button
                        key={b.id}
                        variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPrefs((p) => ({ ...p, budget: b.id }))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          background: prefs.budget === b.id
                            ? 'linear-gradient(135deg, #eef2ff, #f0fdf4)'
                            : '#fff',
                          border: prefs.budget === b.id ? '2px solid #6366f1' : '2px solid #e2e8f0',
                          borderRadius: 18,
                          padding: '1rem 1.25rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          boxShadow: prefs.budget === b.id ? '0 4px 20px rgba(99,102,241,0.12)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: 32, flexShrink: 0 }}>{b.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 900, fontSize: 15, color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>
                            {b.label}
                          </p>
                          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{b.desc}</p>
                        </div>
                        {prefs.budget === b.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              width: 26, height: 26, borderRadius: '50%',
                              background: '#6366f1',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Step 3: Experience */}
                {quizStep === 3 && (
                  <motion.div variants={stagger} initial="hidden" animate="show"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {EXPERIENCE_OPTIONS.map((e) => (
                      <motion.button
                        key={e.id}
                        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPrefs((p) => ({ ...p, experience: e.id }))}
                        style={{
                          background: prefs.experience === e.id
                            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                            : '#fff',
                          border: prefs.experience === e.id ? '2px solid #6366f1' : '2px solid #e2e8f0',
                          borderRadius: 20,
                          padding: '1.25rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.25s',
                          boxShadow: prefs.experience === e.id ? '0 8px 24px rgba(99,102,241,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                      >
                        <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>{e.icon}</span>
                        <p style={{
                          fontWeight: 900, fontSize: 14, fontFamily: 'Sora, sans-serif',
                          color: prefs.experience === e.id ? '#fff' : '#0f172a',
                        }}>{e.label}</p>
                        <p style={{
                          fontSize: 12, marginTop: 4,
                          color: prefs.experience === e.id ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                        }}>{e.desc}</p>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </QuizStep>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: '2rem' }}>
                <button
                  onClick={handleBack}
                  style={{
                    padding: '12px 24px',
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 14,
                    fontWeight: 700, fontSize: 14,
                    color: '#475569',
                    cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif',
                  }}
                >
                  ← Back
                </button>
                <motion.button
                  whileHover={{ scale: canProceed() ? 1.03 : 1 }}
                  whileTap={{ scale: canProceed() ? 0.97 : 1 }}
                  onClick={canProceed() ? handleNextStep : undefined}
                  disabled={!canProceed()}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: canProceed()
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : '#e2e8f0',
                    border: 'none',
                    borderRadius: 14,
                    fontWeight: 800, fontSize: 15,
                    color: canProceed() ? '#fff' : '#94a3b8',
                    cursor: canProceed() ? 'pointer' : 'not-allowed',
                    fontFamily: 'Sora, sans-serif',
                    boxShadow: canProceed() ? '0 8px 24px rgba(99,102,241,0.3)' : 'none',
                    transition: 'all 0.25s',
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                      Loading tailors...
                    </span>
                  ) : quizStep < QUIZ_TOTAL_STEPS ? 'Continue →' : '✨ Find My Tailors'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── RESULTS ── */}
          {(phase === 'results' || phase === 'previous') && (
            <motion.div key="results" variants={fadeUp} initial="hidden" animate="show" exit="exit">
              {/* Results header */}
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 24,
                padding: '1.5rem',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 100, height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                }} />
                <div style={{
                  position: 'absolute', bottom: -30, left: -10,
                  width: 80, height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 22 }}>✨</span>
                    <span style={{
                      fontWeight: 900, fontSize: 18, color: '#fff',
                      fontFamily: 'Sora, sans-serif',
                    }}>
                      {phase === 'previous' ? 'Previous Recommendations' : 'Your AI Matches'}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.6 }}>
                    {phase === 'previous' && previousRecs?.savedAt
                      ? `Saved on ${new Date(previousRecs.savedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}`
                      : `${results.length} tailors ranked by AI score — based on your style, budget & experience preferences.`}
                  </p>

                  {/* Prefs summary chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {(phase === 'previous' ? previousRecs?.prefs : prefs) && (() => {
                      const p = phase === 'previous' ? previousRecs.prefs : prefs;
                      return [
                        p.style && STYLE_CATEGORIES.find((s) => s.id === p.style)?.label,
                        p.budget && BUDGET_OPTIONS.find((b) => b.id === p.budget)?.label,
                        p.experience && p.experience !== 'any' && EXPERIENCE_OPTIONS.find((e) => e.id === p.experience)?.label,
                      ].filter(Boolean).map((chip) => (
                        <span key={chip} style={{
                          background: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          fontSize: 11, fontWeight: 700,
                          borderRadius: 100, padding: '4px 12px',
                          border: '1px solid rgba(255,255,255,0.3)',
                        }}>
                          {chip}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* How AI works row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
                marginBottom: '1.5rem',
              }}>
                {[
                  { icon: '⭐', label: 'Rating Score', desc: 'Highest rated first' },
                  { icon: '🧵', label: 'Style Match', desc: 'Speciality aligned' },
                  { icon: '💰', label: 'Budget Fit', desc: 'Price range checked' },
                  { icon: '📍', label: 'Availability', desc: 'Active tailors only' },
                ].map((item) => (
                  <div key={item.label} style={{
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 12, color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tailor cards */}
              {results.length === 0 ? (
                <div style={{
                  background: '#fff',
                  borderRadius: 24,
                  border: '1.5px solid #e2e8f0',
                  padding: '3rem',
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🔍</span>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
                    No tailors found yet
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: 14 }}>
                    Try broadening your preferences, or check back as more tailors join TailorHub.
                  </p>
                  <button
                    onClick={handleGetStarted}
                    style={{
                      marginTop: '1.5rem',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', fontWeight: 800, fontSize: 14,
                      border: 'none', borderRadius: 14,
                      padding: '12px 24px', cursor: 'pointer',
                      fontFamily: 'Sora, sans-serif',
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  {results.map((tailor, i) => (
                    <TailorResultCard
                      key={tailor.id}
                      tailor={tailor}
                      rank={i + 1}
                      navigate={navigate}
                    />
                  ))}
                </motion.div>
              )}

              {/* Browse all CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  marginTop: '2rem',
                  background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                  borderRadius: 24,
                  padding: '1.5rem',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: -30, right: -30,
                  width: 120, height: 120,
                  borderRadius: '50%',
                  background: 'rgba(6,182,212,0.1)',
                  filter: 'blur(20px)',
                }} />
                <p style={{ fontSize: 28, marginBottom: 8 }}>🌐</p>
                <h3 style={{
                  color: '#fff', fontFamily: 'Sora, sans-serif',
                  fontWeight: 900, fontSize: 18, marginBottom: 6,
                }}>
                  Explore All Tailors
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: '1.25rem' }}>
                  Browse the full directory and find more talented tailors near you.
                </p>
                <button
                  onClick={() => navigate('/browse-deals')}
                  style={{
                    background: '#fff',
                    color: '#0f172a',
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 900, fontSize: 14,
                    border: 'none', borderRadius: 14,
                    padding: '12px 28px',
                    cursor: 'pointer',
                  }}
                >
                  Browse All Tailors →
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
};

export default AiRecommendationsPage;
