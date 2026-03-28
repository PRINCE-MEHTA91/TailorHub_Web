import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

/* ── Resolve image path to full URL ── */
function resolveImg(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

/* ── Get today's timing from saved timings object ── */
function getTodayTiming(timings) {
  if (!timings) return null;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = days[new Date().getDay()];
  return timings[today] || null;
}

/* ── Hardcoded fallback tailors ── */
const fallbackTailors = [
  {
    id: 'f1', full_name: 'Priya Boutique', initials: 'PB',
    specialty: 'Bridal & Lehenga', tagline: 'Stitching dreams, one thread at a time',
    experience: '6-10 years',
    rating: 4.9, reviews: 312,
    city: 'New Delhi', state: 'Delhi',
    products: [{ name: 'Bridal Lehenga', price: '2000' }],
    badge: '👑 Top Rated', avatarGradient: 'tc-av-rose',
    specialities: ['Bridal Wear', 'Embroidery'],
    timings: { Mon:{open:'09:00',close:'20:00',closed:false}, Tue:{open:'09:00',close:'20:00',closed:false}, Wed:{open:'09:00',close:'20:00',closed:false}, Thu:{open:'09:00',close:'20:00',closed:false}, Fri:{open:'09:00',close:'20:00',closed:false}, Sat:{open:'09:00',close:'21:00',closed:false}, Sun:{open:'10:00',close:'17:00',closed:true} },
  },
  {
    id: 'f2', full_name: 'Khan & Sons', initials: 'KS',
    specialty: "Men's Formal Wear", tagline: 'Precision cuts for the modern gentleman',
    experience: '11-15 years',
    rating: 4.7, reviews: 198,
    city: 'Mumbai', state: 'Maharashtra',
    products: [{ name: 'Suit Tailoring', price: '3500' }],
    badge: '✅ Verified', avatarGradient: 'tc-av-indigo',
    specialities: ['Bespoke Suits', 'Uniform Stitching'],
    timings: { Mon:{open:'10:00',close:'20:00',closed:false}, Tue:{open:'10:00',close:'20:00',closed:false}, Wed:{open:'10:00',close:'20:00',closed:false}, Thu:{open:'10:00',close:'20:00',closed:false}, Fri:{open:'10:00',close:'20:00',closed:false}, Sat:{open:'10:00',close:'18:00',closed:false}, Sun:{open:'10:00',close:'14:00',closed:true} },
  },
  {
    id: 'f3', full_name: 'Meera Creations', initials: 'MC',
    specialty: 'Ladies Ethnic Wear', tagline: 'Where fabric meets art',
    experience: '3-5 years',
    rating: 4.8, reviews: 421,
    city: 'Bangalore', state: 'Karnataka',
    products: [{ name: 'Blouse Stitching', price: '500' }],
    badge: '⚡ Quick Stitch', avatarGradient: 'tc-av-amber',
    specialities: ['Ethnic Wear', 'Alterations'],
    timings: { Mon:{open:'09:00',close:'19:00',closed:false}, Tue:{open:'09:00',close:'19:00',closed:false}, Wed:{open:'09:00',close:'19:00',closed:false}, Thu:{open:'09:00',close:'19:00',closed:false}, Fri:{open:'09:00',close:'19:00',closed:false}, Sat:{open:'09:00',close:'17:00',closed:false}, Sun:{open:'10:00',close:'14:00',closed:false} },
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
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
  const profileImgUrl = resolveImg(tailor.profile_img);
  const todayTiming = getTodayTiming(tailor.timings);
  const isOpen = todayTiming && !todayTiming.closed;
  const specialities = Array.isArray(tailor.specialities) ? tailor.specialities : [];

  const navigate = useNavigate();

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-30px' }}
      whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(67,56,202,0.14)' }}
      className="tc-card cursor-pointer"
      onClick={() => navigate(`/tailor-profile/${tailor.id || tailor.user_id}`)}
    >
      {/* Top section: Avatar + Info side by side */}
      <div className="tc-card-top">
        {/* Avatar */}
        <div className="tc-avatar-wrap">
          {profileImgUrl ? (
            <img src={profileImgUrl} alt={tailor.full_name} className="tc-avatar-img" />
          ) : (
            <div className={`tc-avatar ${avatarGradient}`}>{initials}</div>
          )}
          {/* Open/Closed dot */}
          {todayTiming && (
            <span className={`tc-availability-dot ${isOpen ? 'tc-dot-open' : 'tc-dot-closed'}`} title={isOpen ? 'Open today' : 'Closed today'} />
          )}
        </div>

        {/* Info */}
        <div className="tc-info">
          <div className="tc-name-row">
            <span className="tc-name">{tailor.full_name}</span>
            {tailor.badge && <span className="tc-badge">{tailor.badge}</span>}
          </div>

          {/* Tagline */}
          {(tailor.tagline || tailor.specialty) && (
            <p className="tc-tagline">
              {tailor.tagline || tailor.specialty}
            </p>
          )}

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
        </div>
      </div>

      {/* Divider */}
      <div className="tc-divider" />

      {/* Detail pills row */}
      <div className="tc-pills-row">
        {/* Experience */}
        {tailor.experience && (
          <span className="tc-pill tc-pill-exp">
            🏆 {tailor.experience}
          </span>
        )}
        {/* Timing */}
        {todayTiming && (
          <span className={`tc-pill ${isOpen ? 'tc-pill-open' : 'tc-pill-closed'}`}>
            🕐 {isOpen ? `${todayTiming.open} – ${todayTiming.close}` : 'Closed Today'}
          </span>
        )}
        {/* Speciality chips (first 2) */}
        {specialities.slice(0, 2).map(s => (
          <span key={s} className="tc-pill tc-pill-spec">{s}</span>
        ))}
      </div>

      {/* Products specialty line */}
      {tailor.products && tailor.products.length > 0 && (
        <p className="tc-specialty">
          ✂️ {tailor.products.slice(0, 2).map(p => p.name).join(' · ')}
        </p>
      )}

      {/* Bottom: price + CTA */}
      <div className="tc-bottom">
        {startingPrice && <span className="tc-price">{startingPrice}</span>}
        <button className="tc-btn" onClick={(e) => {
          e.stopPropagation();
          navigate(`/tailor-profile/${tailor.id || tailor.user_id}`);
        }}>View Profile →</button>
      </div>
    </motion.div>
  );
};

/* ── Main Component ── */
const TailorConnect = () => {
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/tailors`)
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
