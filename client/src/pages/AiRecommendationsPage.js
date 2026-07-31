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
  { id: 'formal', icon: '👔', label: 'Formal Wear', desc: 'Suits, Blazers, Trousers & Dresses', color: '#1e293b', badge: 'Classic' },
  { id: 'ethnic', icon: '👗', label: 'Ethnic Wear', desc: 'Kurtas, Sherwanis, Sarees, Lehengas', color: '#9f1239', badge: 'Trending' },
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

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male', emoji: '👨', accent: '#6366f1' },
  { id: 'female', label: 'Female', emoji: '👩', accent: '#ec4899' },
  { id: 'nonbinary', label: 'Non-binary', emoji: '🧑', accent: '#8b5cf6' },
];

const SKIN_TONES = [
  { id: 'fair', label: 'Fair', color: '#FDDBB4' },
  { id: 'light', label: 'Light', color: '#F0C08A' },
  { id: 'medium', label: 'Medium', color: '#D4925A' },
  { id: 'olive', label: 'Olive', color: '#B87040' },
  { id: 'tan', label: 'Tan', color: '#8B5E3C' },
  { id: 'deep', label: 'Deep', color: '#4A2C1A' },
];

const BODY_SHAPES = [
  { id: 'slim', label: 'Slim / Lean', desc: 'Narrow, slim build', color: '#06b6d4', topY: '79' },
  { id: 'athletic', label: 'Athletic', desc: 'Broad shoulders, V-shape', color: '#6366f1', topY: '76' },
  { id: 'average', label: 'Average', desc: 'Proportional, balanced', color: '#f59e0b', topY: '79' },
  { id: 'plus', label: 'Plus Size', desc: 'Fuller, rounder build', color: '#10b981', topY: '72' },
];

const SCORE_KEY = 'tailorhub_ai_recommendations';
const HISTORY_KEY = 'tailorhub_ai_history';
const MAX_HISTORY = 5;

function getHexForColorName(colorName = '', idx = 0) {
  const c = String(colorName).trim().toLowerCase();
  const exactMap = {
    'cobalt blue': '#0047AB',
    'royal blue': '#1E40AF',
    'navy blue': '#1E293B',
    'rich navy': '#0F172A',
    'navy': '#1E293B',
    'emerald green': '#10B981',
    'emerald': '#059669',
    'deep plum': '#6D28D9',
    'deep wine': '#701A75',
    'wine': '#701A75',
    'burgundy': '#800020',
    'maroon': '#800000',
    'maroon gold': '#9A3412',
    'rust orange': '#C85A32',
    'burnt orange': '#EA580C',
    'rani pink': '#EC4899',
    'royal pink': '#F472B6',
    'coral pink': '#FB7185',
    'ruby red': '#BE123C',
    'crimson red': '#DC2626',
    'mustard gold': '#D97706',
    'sunset gold': '#F59E0B',
    'gold': '#D97706',
    'ivory white': '#F8FAFC',
    'ivory': '#FDFBF7',
    'ivory gold': '#FEF3C7',
    'white': '#F8FAFC',
    'teal blue': '#0D9488',
    'teal': '#14B8A6',
    'bright teal': '#06B6D4',
    'olive green': '#556B2F',
    'olive': '#556B2F',
    'muddy browns': '#78350F',
    'muddy brown': '#78350F',
    'dark brown': '#451A03',
    'olive brown': '#4A5D23',
    'neon green': '#22C55E',
    'dark charcoal': '#334155',
    'charcoal gray': '#475569',
    'pale yellow': '#FEF08A',
    'beige': '#D6C5B3',
    'pale beige': '#E7E5E4',
    'light gray': '#CBD5E1',
    'ash gray': '#94A3B8',
    'washed pastels': '#E0E7FF',
    'washed-out pastels': '#E0E7FF',
    'washed peach': '#FFDAB9'
  };
  if (exactMap[c]) return exactMap[c];
  if (c.includes('blue') || c.includes('navy')) return '#2563EB';
  if (c.includes('green') || c.includes('emerald')) return '#10B981';
  if (c.includes('orange') || c.includes('rust')) return '#EA580C';
  if (c.includes('red') || c.includes('wine') || c.includes('maroon') || c.includes('ruby')) return '#9F1239';
  if (c.includes('plum') || c.includes('purple') || c.includes('violet')) return '#6D28D9';
  if (c.includes('gold') || c.includes('mustard') || c.includes('yellow')) return '#D97706';
  if (c.includes('brown') || c.includes('tan') || c.includes('beige')) return '#78350F';
  if (c.includes('white') || c.includes('ivory')) return '#F8FAFC';
  if (c.includes('black') || c.includes('charcoal')) return '#1E293B';
  if (c.includes('teal')) return '#0D9488';
  if (c.includes('pink') || c.includes('rose') || c.includes('magenta')) return '#EC4899';
  if (c.includes('gray') || c.includes('grey')) return '#64748B';
  const fallbackHsl = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
  return fallbackHsl[idx % fallbackHsl.length];
}

function getOutfitExampleImage(style = 'formal', gender = 'female', idx = 0) {
  const s = String(style).toLowerCase();
  const isMale = gender && ['male', 'man', 'men', 'm', 'boy'].includes(String(gender).toLowerCase());
  const images = {
    formal: {
      female: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',  // woman professional suit
        'https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&auto=format&fit=crop&q=80',  // woman formal outfit
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'  // woman formal dress
      ],
      male: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',  // man in formal suit
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80',  // man in blazer
        'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&auto=format&fit=crop&q=80'   // man formal wear
      ]
    },
    ethnic: {
      female: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',  // woman in saree
        'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&auto=format&fit=crop&q=80',  // woman ethnic Indian
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'   // woman in lehenga
      ],
      male: [
        'https://images.unsplash.com/photo-1622350600745-ec1f37e08d8f?w=600&auto=format&fit=crop&q=80',  // man in kurta sherwani
        'https://images.unsplash.com/photo-1631333148151-7e9dd6ae79c9?w=600&auto=format&fit=crop&q=80',  // man in Indian ethnic wear
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80'   // man ethnic formal
      ]
    },
    wedding: {
      female: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',  // bridal lehenga
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',  // bride saree
        'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&auto=format&fit=crop&q=80'   // bride ethnic
      ],
      male: [
        'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80',  // groom sherwani
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80',  // groom formal suit
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'   // groom wedding suit
      ]
    },
    casual: {
      female: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',  // woman casual
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',  // woman casual outfit
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80'   // woman shopping casual
      ],
      male: [
        'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600&auto=format&fit=crop&q=80',  // man casual outfit
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',  // man casual style
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80'   // man casual street
      ]
    },
    custom: {
      female: [
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80'
      ],
      male: [
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&auto=format&fit=crop&q=80'
      ]
    },
    alteration: {
      female: [
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80'
      ],
      male: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600&auto=format&fit=crop&q=80'
      ]
    },
    default: {
      female: [
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80'
      ],
      male: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
      ]
    }
  };
  const cat = images[s] || images.default;
  const list = isMale ? cat.male : cat.female;
  return list[idx % list.length];
}


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

// ── Step 3: Body Profile ──────────────────────────────────────────────────────

const BodyProfileStep = ({ prefs, setPrefs }) => {
  const bp = prefs.bodyProfile || {};
  const updateBP = (field, value) =>
    setPrefs((p) => ({ ...p, bodyProfile: { ...(p.bodyProfile || {}), [field]: value } }));

  const bodyShapePaths = {
    slim: 'M22 26 L20 60 L24 60 L25 80 L35 80 L36 60 L40 60 L38 26 Z',
    athletic: 'M18 26 L14 56 L22 60 L24 76 L36 76 L38 60 L46 56 L42 26 Z',
    average: 'M19 26 L16 58 L24 62 L25 79 L35 79 L36 62 L44 58 L41 26 Z',
    plus: 'M15 26 Q8 40 8 56 Q12 68 30 72 Q48 68 52 56 Q52 40 45 26 Z',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Gender */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem' }}>
          <span style={{ fontSize: 18 }}>🧬</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>What is your gender?</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {GENDER_OPTIONS.map((g) => {
            const active = bp.gender === g.id;
            return (
              <motion.button key={g.id} whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={() => updateBP('gender', g.id)}
                style={{ background: active ? `linear-gradient(160deg, ${g.accent}20, ${g.accent}08)` : '#fff', border: active ? `2.5px solid ${g.accent}` : '2px solid #e2e8f0', borderRadius: 20, padding: '1.5rem 0.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, boxShadow: active ? `0 8px 24px ${g.accent}30` : '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.25s', position: 'relative' }}>
                {active && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: g.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </motion.div>
                )}
                <span style={{ fontSize: 36 }}>{g.emoji}</span>
                <span style={{ fontWeight: 800, fontSize: 13, color: active ? g.accent : '#374151', fontFamily: 'Sora, sans-serif' }}>{g.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Skin Tone */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem' }}>
          <span style={{ fontSize: 18 }}>🎨</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>
            Your skin tone <span style={{ fontWeight: 500, fontSize: 12, color: '#94a3b8' }}>(optional)</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {SKIN_TONES.map((st) => {
            const active = bp.skinTone === st.id;
            return (
              <motion.button key={st.id} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} onClick={() => updateBP('skinTone', st.id)} title={st.label}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: st.color, border: active ? '3px solid #6366f1' : '3px solid transparent', boxShadow: active ? '0 0 0 2px #6366f1, 0 4px 12px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.15)', transition: 'all 0.2s' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: active ? '#6366f1' : '#94a3b8', fontFamily: 'Sora, sans-serif' }}>{st.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Body Shape */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem' }}>
          <span style={{ fontSize: 18 }}>🧍</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>
            Your body shape <span style={{ fontWeight: 500, fontSize: 12, color: '#94a3b8' }}>(optional)</span>
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {BODY_SHAPES.map((bs) => {
            const active = bp.bodyShape === bs.id;
            return (
              <motion.button key={bs.id} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => updateBP('bodyShape', bs.id)}
                style={{ background: active ? `linear-gradient(160deg, ${bs.color}18, ${bs.color}05)` : '#fff', border: active ? `2.5px solid ${bs.color}` : '2px solid #e2e8f0', borderRadius: 20, padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: active ? `0 8px 24px ${bs.color}35` : '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.25s', position: 'relative' }}>
                {active && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: bs.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </motion.div>
                )}
                <svg viewBox="0 0 60 110" width="52" height="90" fill="none">
                  <circle cx="30" cy="13" r={bs.id === 'plus' ? 11 : 10} fill={bs.color} opacity="0.85" />
                  <path d={bodyShapePaths[bs.id]} fill={bs.color} opacity="0.72" />
                  <rect x="22" y={bs.topY} width="9" height="28" rx="4" fill={bs.color} opacity="0.6" />
                  <rect x="29" y={bs.topY} width="9" height="28" rx="4" fill={bs.color} opacity="0.6" />
                  {bs.id !== 'plus' && <>
                    <rect x="7" y="27" width="10" height="25" rx="4" fill={bs.color} opacity="0.5" />
                    <rect x="43" y="27" width="10" height="25" rx="4" fill={bs.color} opacity="0.5" />
                  </>}
                  {bs.id === 'plus' && <>
                    <rect x="4" y="28" width="11" height="26" rx="5" fill={bs.color} opacity="0.5" />
                    <rect x="45" y="28" width="11" height="26" rx="5" fill={bs.color} opacity="0.5" />
                  </>}
                </svg>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 14, fontFamily: 'Sora, sans-serif', color: active ? bs.color : '#0f172a', textAlign: 'center' }}>{bs.label}</p>
                  <p style={{ fontSize: 11, color: active ? bs.color : '#94a3b8', opacity: active ? 0.85 : 1, textAlign: 'center', marginTop: 2 }}>{bs.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Height & Weight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
            <span style={{ fontSize: 16 }}>📏</span>
            <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>Height</span>
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>cm</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#6366f1', fontFamily: 'Sora, sans-serif', textAlign: 'center', marginBottom: '0.5rem' }}>{bp.height || 170}</div>
          <input type="range" min={130} max={220} value={bp.height || 170} onChange={(e) => updateBP('height', parseInt(e.target.value))} style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#cbd5e1' }}>130cm</span>
            <span style={{ fontSize: 10, color: '#cbd5e1' }}>220cm</span>
          </div>
        </div>
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
            <span style={{ fontSize: 16 }}>⚖️</span>
            <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>Weight</span>
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>kg</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#8b5cf6', fontFamily: 'Sora, sans-serif', textAlign: 'center', marginBottom: '0.5rem' }}>{bp.weight || 65}</div>
          <input type="range" min={30} max={200} value={bp.weight || 65} onChange={(e) => updateBP('weight', parseInt(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#cbd5e1' }}>30kg</span>
            <span style={{ fontSize: 10, color: '#cbd5e1' }}>200kg</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #eef2ff, #f0fdf4)', border: '1.5px solid #c7d2fe', borderRadius: 16, padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>💡</span>
        <p style={{ fontSize: 12, color: '#4338ca', lineHeight: 1.6, fontWeight: 500 }}>
          Your body profile helps us find tailors who specialise in creating flattering fits for your unique shape and measurements.
        </p>
      </div>
    </div>
  );
};

// ── Step 1: Hero ──────────────────────────────────────────────────────────────

const HeroSection = ({ onGetStarted, onViewPrevious, hasPrevious }) => (
  <motion.div
    key="hero"
    variants={fadeUp}
    initial="hidden"
    animate="show"
    exit="exit"
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 1.5rem', maxWidth: 700, margin: '0 auto' }}
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

// ── AI Style Advice Panel ─────────────────────────────────────────────────────


const LANG_OPTIONS = [
  { id: 'english',  label: 'English',  flag: '🇬🇧' },
  { id: 'hinglish', label: 'Hinglish', flag: '🇮🇳' },
  { id: 'hindi',    label: 'हिंदी',    flag: '🇮🇳' },
];

const StyleAdvicePanel = ({ advice, loading, error, lang = 'english', onLangChange, prefs }) => {
  if (loading) return (
    <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 24, padding: '2rem', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', filter: 'blur(30px)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(139,92,246,0.4)', borderTopColor: '#8b5cf6', flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 900, fontSize: 16, color: '#fff', fontFamily: 'Sora, sans-serif' }}>✨ Gemini AI is styling you...</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Personalising advice based on your body profile</p>
        </div>
      </div>
      {[80, 60, 90, 50].map((w, i) => (
        <motion.div key={i} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 8, marginBottom: 10, width: `${w}%` }} />
      ))}
    </div>
  );

  if (!advice) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 24, padding: '1.75rem', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative' }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(6,182,212,0.08)', filter: 'blur(30px)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header row: icon + title + language toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>✨</div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>GEMINI AI • PERSONALISED STYLE ADVICE</p>
              <h3 style={{ fontWeight: 900, fontSize: 18, color: '#fff', fontFamily: 'Sora, sans-serif', lineHeight: 1.2 }}>{advice.headline}</h3>
            </div>
          </div>
          {/* Language Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 100, padding: 3, gap: 2, flexShrink: 0 }}>
            {LANG_OPTIONS.map(opt => (
              <motion.button
                key={opt.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLangChange && onLangChange(opt.id)}
                style={{
                  background: lang === opt.id ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                  color: lang === opt.id ? '#fff' : 'rgba(255,255,255,0.5)',
                  border: 'none', borderRadius: 100,
                  padding: '5px 12px',
                  fontSize: 11, fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif',
                  boxShadow: lang === opt.id ? '0 2px 10px rgba(139,92,246,0.5)' : 'none',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {opt.flag} {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '1.5rem', borderLeft: '3px solid #8b5cf6', paddingLeft: 12 }}>
          {advice.summary}
        </p>

        {/* Color Palette */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>🎨 Your Color Palette</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {advice.colorPalette?.recommended?.map((c, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 64, flex: '1 1 auto' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: getHexForColorName(c, i), border: '2.5px solid rgba(255,255,255,0.35)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: 700, maxWidth: 85, textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>{c}</span>
              </div>
            ))}
            <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
            {advice.colorPalette?.avoid?.map((c, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 64, flex: '1 1 auto' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: getHexForColorName(c, i + 3), border: '2.5px solid rgba(239,68,68,0.7)', opacity: 0.75, position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#ef4444' }}>✕</div>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(239,68,68,0.85)', fontWeight: 700, maxWidth: 85, textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>{c}</span>
              </div>
            ))}
          </div>
          {advice.colorPalette?.reason && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>{advice.colorPalette.reason}</p>}
        </div>

        {/* 2-column grid: Fabrics + Fit Tips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '0.9rem' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>🧶 Fabrics</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {advice.fabrics?.map((f, i) => (
                <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />{f}
                </span>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '0.9rem' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>📐 Fit Tips</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {advice.fitTips?.map((t, i) => (
                <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'flex-start', gap: 5, lineHeight: 1.4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#06b6d4', flexShrink: 0, marginTop: 4 }} />{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Outfit Ideas & Visual Examples */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>👔 Outfit Ideas & Example Looks</p>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 20 }}>
              {prefs?.bodyProfile?.gender ? `${prefs.bodyProfile.gender.charAt(0).toUpperCase() + prefs.bodyProfile.gender.slice(1)} • ` : ''}{prefs?.style ? prefs.style.charAt(0).toUpperCase() + prefs.style.slice(1) : 'Custom'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {advice.outfitIdeas?.map((idea, i) => {
              const imgUrl = getOutfitExampleImage(prefs?.style || 'formal', prefs?.bodyProfile?.gender || 'female', i);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ position: 'relative', flexShrink: 0, width: 72, height: 76, borderRadius: 10, overflow: 'hidden', background: '#1e293b' }}>
                    <img
                      src={imgUrl}
                      alt={`Outfit Example ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div style={{ position: 'absolute', top: 4, left: 4, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {i + 1}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.92)', lineHeight: 1.45, fontWeight: 500 }}>
                      {idea}
                    </span>
                    <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.03em' }}>
                      ✨ Personalized for {prefs?.bodyProfile?.gender || 'your'} profile
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dos & Don'ts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 14, padding: '0.9rem', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>✅ Do</p>
            {advice.dos?.map((d, i) => (
              <p key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 4, lineHeight: 1.4, display: 'flex', gap: 5 }}>
                <span style={{ color: '#34d399', flexShrink: 0 }}>✓</span>{d}
              </p>
            ))}
          </div>
          <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 14, padding: '0.9rem', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#f87171', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>❌ Don't</p>
            {advice.donts?.map((d, i) => (
              <p key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 4, lineHeight: 1.4, display: 'flex', gap: 5 }}>
                <span style={{ color: '#f87171', flexShrink: 0 }}>✗</span>{d}
              </p>
            ))}
          </div>
        </div>

        {/* Accessory Tip */}
        {advice.accessoryTip && (
          <div style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))', borderRadius: 14, padding: '0.9rem', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>💍</span>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Accessory Tip</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{advice.accessoryTip}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const QUIZ_TOTAL_STEPS = 3;

const AiRecommendationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [phase, setPhase] = useState('hero'); // hero | quiz | results | previous | history
  const [quizStep, setQuizStep] = useState(1);
  const [prefs, setPrefs] = useState({ style: '', budget: '', bodyProfile: { gender: '', skinTone: '', bodyShape: '', height: 170, weight: 65 }, experience: 'any' });
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [historyRecs, setHistoryRecs] = useState([]); // array of up to 5 sessions
  const [selectedHistory, setSelectedHistory] = useState(null); // the one being viewed
  const [styleAdvice, setStyleAdvice] = useState(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState(null);
  const [adviceLang, setAdviceLang] = useState('english'); // 'english' | 'hinglish' | 'hindi'

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

  // Load history from localStorage (array, fallback to legacy single-entry key)
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setHistoryRecs(JSON.parse(storedHistory));
      } else {
        // Migrate legacy single-entry key
        const legacy = localStorage.getItem(SCORE_KEY);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          const migrated = [parsed];
          setHistoryRecs(migrated);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(migrated));
        }
      }
    } catch (_) {}
  }, []);

  const handleGetStarted = () => {
    loadTailors();
    setQuizStep(1);
    setPrefs({ style: '', budget: '', bodyProfile: { gender: '', skinTone: '', bodyShape: '', height: 170, weight: 65 }, experience: 'any' });
    setPhase('quiz');
  };

  const handleViewPrevious = () => {
    if (historyRecs.length > 0) {
      setPhase('history');
    }
  };

  const handleViewHistoryEntry = (entry) => {
    setSelectedHistory(entry);
    setResults(entry.results);
    setStyleAdvice(null);
    setPhase('previous');
    // Fetch AI advice for this history entry's prefs
    if (entry.prefs) fetchStyleAdvice(entry.prefs);
  };

  const handleDeleteHistoryEntry = (idx) => {
    const updated = historyRecs.filter((_, i) => i !== idx);
    setHistoryRecs(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const getClientFallbackAdvice = (style = 'formal', bp = {}) => {
    const { skinTone = 'medium', bodyShape = 'average', height = 170, gender = '' } = bp;
    const isFemale = gender && ['female', 'woman', 'women', 'f', 'girl'].includes(String(gender).toLowerCase());
    const isMale = gender && ['male', 'man', 'men', 'm', 'boy'].includes(String(gender).toLowerCase());

    const getIndividualPalette = (st, sty, fem) => {
      const tone = (st || 'medium').toLowerCase();
      const s = (sty || 'formal').toLowerCase();
      const base = {
        fair: {
          female: { recommended: ['Rani Pink', 'Emerald Green', 'Royal Blue', 'Ruby Red'], avoid: ['Pale Yellow', 'Beige'], reason: 'Jewel tones contrast beautifully with fair complexion and enhance festive radiance.' },
          male: { recommended: ['Royal Blue', 'Emerald Green', 'Mustard Gold', 'Deep Wine'], avoid: ['Pale Yellow', 'Light Beige'], reason: 'Deep traditional hues highlight fair complexion with royal elegance.' },
          default: { recommended: ['Royal Blue', 'Emerald Green', 'Deep Wine', 'Rich Navy'], avoid: ['Pale Yellow', 'Beige'], reason: 'Jewel tones contrast beautifully with fair skin and bring out natural warmth.' }
        },
        light: {
          female: { recommended: ['Maroon Gold', 'Teal Blue', 'Rani Pink', 'Olive Green'], avoid: ['Washed Pastels', 'Light Gray'], reason: 'Rich ethnic saturations bring out a radiant glow in light undertones.' },
          male: { recommended: ['Navy Blue', 'Maroon', 'Teal Blue', 'Olive Green'], avoid: ['Washed Pastels', 'Light Gray'], reason: 'Deep traditional shades balance light skin tones perfectly.' },
          default: { recommended: ['Navy Blue', 'Maroon', 'Teal', 'Olive Green'], avoid: ['Washed-out Pastels', 'Light Gray'], reason: 'Rich, deep shades create an elegant contrast against light skin tones.' }
        },
        medium: {
          female: { recommended: ['Rani Pink', 'Emerald Green', 'Royal Blue', 'Maroon Gold'], avoid: ['Dull Olive', 'Pale Yellow'], reason: 'Vibrant jewel tones complement medium skin undertones perfectly.' },
          male: { recommended: ['Cobalt Blue', 'Rust Orange', 'Rich Navy', 'Deep Plum'], avoid: ['Muddy Brown', 'Neon Green'], reason: 'Sharp cobalt and rich navy elevate formal and ethnic wear on medium skin tones.' },
          default: { recommended: ['Cobalt Blue', 'Rust Orange', 'Emerald Green', 'Deep Plum'], avoid: ['Muddy Brown', 'Neon Green'], reason: 'Earthy and vibrant jewel tones complement medium skin undertones perfectly.' }
        },
        olive: {
          default: { recommended: ['Ruby Red', 'Mustard Gold', 'Teal Blue', 'Ivory White'], avoid: ['Olive Brown', 'Pale Gray'], reason: 'Warm golds and deep rubies enhance natural olive undertones.' }
        },
        tan: {
          default: { recommended: ['Ivory White', 'Crimson Red', 'Sapphire Blue', 'Burnt Orange'], avoid: ['Dull Olive', 'Ash Gray'], reason: 'Bright whites and rich saturations harmonize with tanned skin tones.' }
        },
        deep: {
          default: { recommended: ['Ivory White', 'Bright Teal', 'Royal Purple', 'Sunset Gold'], avoid: ['Dark Charcoal', 'Dark Brown'], reason: 'Bold, bright colors and clean whites create a stunning radiant appearance.' }
        }
      };
      const toneMap = base[tone] || base.medium;
      return (fem ? toneMap.female : toneMap.male) || toneMap.default || toneMap;
    };

    const styleOutfitMap = {
      female: {
        formal: ['Custom tailored trouser suit with structured shoulders in premium Italian wool.', 'Elegant pencil skirt paired with a tailored silk blouse and single-breasted blazer.', 'Double-breasted structured coat dress with custom waist tapering.'],
        ethnic: ['Banarasi Pure Silk Saree paired with a bespoke embroidered contrast blouse.', 'Hand-crafted Anarkali Suit with intricate Zari embroidery and sheer dupatta.', 'Contemporary Sharara Set with silk Kurta and tailored side slits.'],
        casual: ['Tailored linen tunic paired with custom high-waisted straight trousers.', 'Breathable organic cotton co-ord set for relaxed yet chic everyday styling.', 'Custom asymmetrical kurta dress with functional pockets and smart collar.'],
        wedding: ['Bridal Lehenga with royal Zardozi and Kundan hand-embroidery in rich jewel tones.', 'Handwoven Kanjivaram Bridal Saree customized with a designer gold zari border.', 'Designer Velvet Anarkali wedding gown tailored for effortless draping.'],
        custom: ['Bespoke fusion ensemble combining western tailoring with Indian textile artistry.', 'Tailored draped saree-gown with a structured embroidered jacket.', 'Signature custom piece crafted to your exact body measurements.'],
        alteration: ['Precision waist tapering and bust dart shaping for your favorite gowns and dresses.', 'Sleeve shortening and hemline customization for sarees, lehengas, and blouses.', 'Custom resizing to transform ready-made garments into luxury bespoke fits.']
      },
      male: {
        formal: ['Bespoke two-piece suit in premium Italian wool with a crisp cotton dress shirt.', 'Single-breasted structured blazer paired with tailored tapered trousers.', 'Classic Bandhgala or Jodhpuri suit for ceremonial elegance.'],
        ethnic: ['Handcrafted raw silk Kurta with churidar and contrasting Nehru jacket.', 'Regal sherwani with intricate zardozi embroidery and matching stole.', 'Classic silk festive Kurta ensemble tailored with comfortable side slits.'],
        casual: ['Custom linen shirt with tailored chinos for relaxed yet sophisticated styling.', 'Unstructured breathable cotton jacket over a fitted shirt.', 'Smart-casual tailored overshirt paired with stretch-weave trousers.'],
        wedding: ['Royal velvet or brocade Sherwani with regal gold embroidery and silk stole.', 'Three-piece ceremonial wedding Jodhpuri suit with silk pocket square.', 'Hand-loom silk ethnic groom attire customized for long ceremonial celebrations.'],
        custom: ['Signature fusion wear combining classic western tailoring with Indian textile motifs.', 'Tailored asymmetrical draped kurta with structured Nehru jacket.', 'Bespoke statement piece crafted to your precise measurements.'],
        alteration: ['Precision waist tapering and hem adjustment for your wardrobe favorites.', 'Sleeve shortening and shoulder realignment for a bespoke finish.', 'Custom reshaping to give off-the-rack garments a luxury tailored feel.']
      }
    };

    const shapeFitMap = {
      slim: ['Opt for layered outfits and structured fabrics to add subtle dimension.', 'Choose tailored fits that follow the silhouette without clinging too tightly.', 'Lightweight shoulder padding or structured collars enhance upper torso proportion.'],
      athletic: ['Highlight broad shoulders with sharp shoulder seams and clean waist tapering.', 'Choose slightly stretchy weaves or bespoke cuts for freedom of movement.', 'Avoid overly baggy garments that obscure your natural proportions.'],
      average: ['Balanced proportions mean you can experiment with both slim and classic fits.', 'Focus on proper sleeve and hem lengths for a sharp, polished appearance.', 'Use contrasting top and bottom shades to define the waistline.'],
      plus: ['Choose matte fabrics with nice drape that flow smoothly over curves.', 'Vertical seams, pin-stripes, and monochrome layers create a sleek silhouette.', 'Ensure comfortable room around the chest and hips without excess fabric.']
    };

    const genderMap = isFemale ? styleOutfitMap.female : styleOutfitMap.male;
    const outfitIdeas = (genderMap && genderMap[style.toLowerCase()]) || genderMap.formal;
    const fitTips = shapeFitMap[bodyShape.toLowerCase()] || shapeFitMap.average;
    const palette = getIndividualPalette(skinTone, style, isFemale);

    return {
      headline: `Tailored ${style.charAt(0).toUpperCase() + style.slice(1)} Elegance For ${isFemale ? 'Women' : isMale ? 'Men' : 'You'}`,
      summary: `Based on your ${bodyShape} build and ${skinTone} skin tone, our AI recommends structured silhouettes and rich color contrasts designed to flatter your ${height}cm frame.`,
      colorPalette: palette,
      fabrics: isFemale ? ['Handloom Pure Silk', 'Organza & Chiffon', 'Breathable Organic Cotton', 'Rich Linen Weave'] : ['Premium Merino Wool', 'Handloom Pure Silk', 'Breathable Organic Cotton', 'Rich Linen Weave'],
      fitTips,
      outfitIdeas,
      dos: [
        'Always request a second fitting to refine waist and shoulder alignment.',
        'Choose fabrics that match the climate and formality of your occasion.',
        'Communicate your comfort preferences clearly with your tailor.'
      ],
      donts: [
        'Don\'t settle for off-the-rack shoulder fits without custom alteration.',
        'Avoid heavy fabrics in high humidity or tight fits without stretch.',
        'Don\'t ignore hemline lengths—proper shoe break is essential.'
      ],
      accessoryTip: isFemale 
        ? 'Pair with traditional Kundan/Jhumka earrings and a handcrafted embroidered Potli bag or chic statement accessories.'
        : 'Complete the look with a contrasting silk pocket square, classic cufflinks, or handcrafted leather footwear.'
    };
  };

  const fetchStyleAdvice = async (currentPrefs, lang = adviceLang) => {
    setAdviceLoading(true);
    setAdviceError(null);
    setStyleAdvice(null);
    try {
      const res = await fetch(`${API_URL}/api/ai-style-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style: currentPrefs.style, bodyProfile: currentPrefs.bodyProfile, language: lang }),
      });
      const data = await res.json();
      if (data && (data.success || data.advice)) {
        setStyleAdvice(data.advice);
      } else {
        setStyleAdvice(getClientFallbackAdvice(currentPrefs.style, currentPrefs.bodyProfile));
      }
    } catch {
      setStyleAdvice(getClientFallbackAdvice(currentPrefs.style, currentPrefs.bodyProfile));
    }
    setAdviceLoading(false);
  };

  const handleAdviceLangChange = (lang, currentPrefs) => {
    setAdviceLang(lang);
    setStyleAdvice(null);
    fetchStyleAdvice(currentPrefs || prefs, lang);
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
      // Save to history array (max 5, newest first)
      const newEntry = { prefs, results: top, savedAt: new Date().toISOString() };
      const prevHistory = (() => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } })();
      const updatedHistory = [newEntry, ...prevHistory].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistoryRecs(updatedHistory);
      // Fetch AI style advice
      fetchStyleAdvice(prefs);
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

  const stepTitles = [
    `What style${greeting}?`,
    "What's your budget?",
    'Tell us about yourself',
  ];
  const stepSubtitles = [
    'Pick the clothing category you need stitched.',
    "We'll surface tailors who match your price range.",
    'Help us personalise your perfect fit recommendations.',
  ];

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

        {(phase === 'results' || phase === 'previous' || phase === 'history') && (
          <div style={{ display: 'flex', gap: 8 }}>
            {phase === 'previous' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPhase('history')}
                style={{ background: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: 13, border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '8px 14px', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
              >
                ← History
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 800, fontSize: 13, border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
            >
              Re-run ✨
            </motion.button>
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto', padding: '2rem 1.5rem 6rem', boxSizing: 'border-box' }}>
        <AnimatePresence mode="wait">

          {/* ── HERO ── */}
          {phase === 'hero' && (
            <HeroSection
              key="hero"
              onGetStarted={handleGetStarted}
              onViewPrevious={handleViewPrevious}
              hasPrevious={historyRecs.length > 0}
            />
          )}

          {/* ── HISTORY LIST ── */}
          {phase === 'history' && (
            <motion.div key="history" variants={fadeUp} initial="hidden" animate="show" exit="exit">
              {/* Header */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 28 }}>📋</span>
                  <div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 900, fontSize: 22, color: '#0f172a', margin: 0 }}>Recommendation History</h2>
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0, marginTop: 2 }}>Your {historyRecs.length} most recent AI matching session{historyRecs.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* History Cards */}
              <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {historyRecs.map((entry, idx) => {
                  const p = entry.prefs || {};
                  const bp = p.bodyProfile || {};
                  const styleLabel = STYLE_CATEGORIES.find(s => s.id === p.style)?.label || p.style || '—';
                  const styleIcon = STYLE_CATEGORIES.find(s => s.id === p.style)?.icon || '🧵';
                  const budgetLabel = BUDGET_OPTIONS.find(b => b.id === p.budget)?.label || p.budget || '—';
                  const chips = [
                    bp.gender && GENDER_OPTIONS.find(g => g.id === bp.gender)?.label,
                    bp.bodyShape && BODY_SHAPES.find(b => b.id === bp.bodyShape)?.label,
                    bp.height && `${bp.height}cm`,
                    bp.weight && `${bp.weight}kg`,
                    p.experience && p.experience !== 'any' && EXPERIENCE_OPTIONS.find(e => e.id === p.experience)?.label,
                  ].filter(Boolean);
                  const savedDate = entry.savedAt ? new Date(entry.savedAt) : null;
                  const isToday = savedDate && new Date().toDateString() === savedDate.toDateString();
                  const dateStr = savedDate ? (isToday ? `Today, ${savedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : savedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })) : 'Unknown date';
                  return (
                    <motion.div
                      key={idx}
                      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                      style={{
                        background: '#fff',
                        borderRadius: 20,
                        border: idx === 0 ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
                        boxShadow: idx === 0 ? '0 8px 32px rgba(99,102,241,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {idx === 0 && (
                        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '4px 14px', display: 'inline-block', position: 'absolute', top: 0, left: 0, borderRadius: '20px 0 16px 0' }}>
                          <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif', textTransform: 'uppercase' }}>Latest</span>
                        </div>
                      )}
                      <div style={{ padding: '1.25rem', paddingTop: idx === 0 ? '2rem' : '1.25rem' }}>
                        {/* Row 1: style + date */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                              {styleIcon}
                            </div>
                            <div>
                              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 900, fontSize: 16, color: '#0f172a', margin: 0 }}>{styleLabel}</p>
                              <p style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, margin: 0, marginTop: 2 }}>{budgetLabel}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>🕐 {dateStr}</p>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0, marginTop: 3 }}>{entry.results?.length || 0} tailors matched</p>
                          </div>
                        </div>

                        {/* Chips */}
                        {chips.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                            {chips.map(c => (
                              <span key={c} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 100, fontSize: 11, fontWeight: 600, color: '#475569', padding: '3px 10px' }}>{c}</span>
                            ))}
                          </div>
                        )}

                        {/* Tailor avatars preview */}
                        {entry.results && entry.results.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                            <div style={{ display: 'flex' }}>
                              {entry.results.slice(0, 4).map((t, ti) => {
                                const initials = t.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'T';
                                return (
                                  <div key={ti} style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #fff', marginLeft: ti === 0 ? 0 : -8, background: t.profile_img ? 'transparent' : `hsl(${ti * 60 + 220},60%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', zIndex: 4 - ti, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
                                    {t.profile_img
                                      ? <img src={resolveImg(t.profile_img)} alt={t.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      : <span style={{ fontSize: 10, fontWeight: 900, color: '#fff' }}>{initials}</span>}
                                  </div>
                                );
                              })}
                            </div>
                            {entry.results.length > 4 && <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>+{entry.results.length - 4} more</span>}
                            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>tailors</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 10 }}>
                          <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleViewHistoryEntry(entry)}
                            style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 13, border: 'none', borderRadius: 12, padding: '10px 0', cursor: 'pointer' }}
                          >
                            View Results →
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteHistoryEntry(idx)}
                            style={{ width: 42, background: '#fff5f5', color: '#ef4444', fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 16, border: '1.5px solid #fecaca', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Remove this entry"
                          >
                            🗑
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Re-run CTA */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 900, fontSize: 15, color: '#0f172a', margin: 0 }}>Want fresher results?</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>Run the AI quiz again for updated recommendations.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleGetStarted}
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontFamily: 'Sora, sans-serif', fontWeight: 900, fontSize: 13, border: 'none', borderRadius: 14, padding: '10px 20px', cursor: 'pointer', flexShrink: 0 }}
                >
                  ✨ Re-run
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ── QUIZ ── */}
          {phase === 'quiz' && (
            <motion.div key={`quiz-${quizStep}`} variants={fadeUp} initial="hidden" animate="show" exit="exit">
              <div style={{ maxWidth: 700, margin: '0 auto' }}>
              <QuizStep
                step={quizStep}
                total={QUIZ_TOTAL_STEPS}
                title={stepTitles[quizStep - 1]}
                subtitle={stepSubtitles[quizStep - 1]}
              >
                {/* Step 1: Style */}
                {quizStep === 1 && (
                  <motion.div variants={stagger} initial="hidden" animate="show"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
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

                {/* Step 3: Body Profile */}
                {quizStep === 3 && <BodyProfileStep prefs={prefs} setPrefs={setPrefs} />}
              </QuizStep>

              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: '2rem', maxWidth: 700, margin: '2rem auto 0' }}>
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
            <motion.div key={phase === 'previous' ? `prev-${selectedHistory?.savedAt}` : 'results'} variants={fadeUp} initial="hidden" animate="show" exit="exit">
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
                    {phase === 'previous' && selectedHistory?.savedAt
                      ? `Saved on ${new Date(selectedHistory.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · ${results.length} tailors`
                      : `${results.length} tailors ranked by AI score — based on your style, budget & experience preferences.`}
                  </p>

                  {/* Prefs summary chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {(phase === 'previous' ? selectedHistory?.prefs : prefs) && (() => {
                      const p = phase === 'previous' ? selectedHistory.prefs : prefs;
                      const bp = p.bodyProfile || {};
                      return [
                        p.style && STYLE_CATEGORIES.find((s) => s.id === p.style)?.label,
                        p.budget && BUDGET_OPTIONS.find((b) => b.id === p.budget)?.label,
                        bp.gender && GENDER_OPTIONS.find((g) => g.id === bp.gender)?.label,
                        bp.bodyShape && BODY_SHAPES.find((b) => b.id === bp.bodyShape)?.label,
                        bp.height && `${bp.height}cm`,
                        bp.weight && `${bp.weight}kg`,
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
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10,
                marginBottom: '1.5rem',
              }}>
                {[
                  { icon: '⭐', label: 'Rating Score', desc: 'Highest rated first' },
                  { icon: '🧵', label: 'Style Match', desc: 'Speciality aligned' },
                  { icon: '💰', label: 'Budget Fit', desc: 'Price range checked' },
                  { icon: '🧍', label: 'Body Profile', desc: 'Personalised for you' },
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

              {/* ── Gemini AI Style Advice ── */}
              {(phase === 'results' || phase === 'previous') && (
                <StyleAdvicePanel
                  advice={styleAdvice}
                  loading={adviceLoading}
                  error={adviceError}
                  lang={adviceLang}
                  prefs={phase === 'previous' ? selectedHistory?.prefs : prefs}
                  onLangChange={(lang) => handleAdviceLangChange(lang, phase === 'previous' ? selectedHistory?.prefs : prefs)}
                />
              )}

              {/* Recommended Tailors Heading */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16, marginTop: 28
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>🧵</span>
                  <div>
                    <h3 style={{ fontWeight: 900, fontSize: 20, color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>
                      Recommended Tailors For Your Style
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                      Top tailors ranked by compatibility with your preferences
                    </p>
                  </div>
                </div>
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
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}
                  key={`cards-${phase}-${results.length}`}
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
        input[type=range] { -webkit-appearance: none; height: 6px; border-radius: 100px; outline: none; background: #e2e8f0; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
};

export default AiRecommendationsPage;
