import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://tailorhub-web.onrender.com';

function resolveImg(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

// ── AI Pick unique section ───────────────────────────────────────────────────
const aiStyles = [
  { icon: '👔', label: 'Formal Wear', desc: 'Suits, Blazers, Sherwanis', color: 'from-slate-800 to-slate-600', badge: 'Top Pick' },
  { icon: '👗', label: 'Ethnic Wear', desc: 'Sarees, Salwar, Lehenga', color: 'from-rose-700 to-pink-500', badge: 'Trending' },
  { icon: '🧵', label: 'Custom Stitch', desc: 'Your design, their craft', color: 'from-violet-700 to-indigo-500', badge: 'Popular' },
  { icon: '🎽', label: 'Casual Wear', desc: 'Everyday comfort fits', color: 'from-sky-600 to-cyan-400', badge: 'New' },
  { icon: '🤵', label: 'Wedding Outfit', desc: 'Groom & Bridal wear', color: 'from-amber-600 to-yellow-400', badge: 'Season' },
  { icon: '🪡', label: 'Alteration', desc: 'Perfect fit, every time', color: 'from-emerald-700 to-teal-500', badge: 'Quick' },
];

const aiTips = [
  { icon: '⭐', title: 'Rating Matters', desc: 'Our AI ranks tailors by verified customer ratings and review depth.' },
  { icon: '📅', title: 'Availability', desc: 'We surface tailors who are active and taking new orders right now.' },
  { icon: '📍', title: 'Near You', desc: 'Your city and state are factored in for faster delivery.' },
  { icon: '💬', title: 'Review Insights', desc: 'AI reads review patterns to detect consistent quality.' },
];

const AiPickSection = ({ navigate }) => (
  <motion.div
    key="ai-section"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    {/* Style picker */}
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">✨</span>
        <h2 className="text-lg font-black text-stone-800" style={{ fontFamily: 'Sora, sans-serif' }}>
          What are you looking for?
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {aiStyles.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/browse-tailors')}
            className={`relative bg-gradient-to-br ${s.color} rounded-2xl p-5 text-left text-white shadow-lg overflow-hidden group`}
          >
            <span className="absolute top-3 right-3 text-[10px] font-black bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {s.badge}
            </span>
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="font-black text-sm leading-tight">{s.label}</p>
            <p className="text-white/70 text-[11px] mt-1">{s.desc}</p>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-x-4 translate-y-6" />
          </motion.button>
        ))}
      </div>
    </div>

    {/* How AI works */}
    <div className="mb-8">
      <h2 className="text-lg font-black text-stone-800 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
        🤖 How our AI picks for you
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {aiTips.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-indigo-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              {tip.icon}
            </div>
            <div>
              <p className="font-black text-sm text-stone-800">{tip.title}</p>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{tip.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* CTA */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-3xl overflow-hidden shadow-xl"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0e7490 100%)' }}
    >
      <div className="p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/10 rounded-full translate-y-10 -translate-x-10 blur-2xl" />
        <div className="relative z-10">
          <p className="text-4xl mb-3">✨</p>
          <h3 className="text-white font-black text-xl mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            Let AI find your perfect tailor
          </h3>
          <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">
            Browse all tailors and let our smart matching connect you with the best fit for your style and budget.
          </p>
          <button
            onClick={() => navigate('/browse-tailors')}
            className="bg-white text-slate-900 font-black px-8 py-3 rounded-2xl hover:bg-cyan-50 transition-all hover:scale-105 active:scale-95 shadow-lg text-sm"
          >
            Browse All Tailors →
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ── Main page ────────────────────────────────────────────────────────────────
const ArrivalsAndTrendingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  const initialTab = tabParam === 'trending' ? 'trending' : 'arrivals';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    fetch(`${API_URL}/api/tailors`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.tailors) setTailors(data.tailors);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const displayedTailors =
    activeTab === 'arrivals'
      ? [...tailors].reverse().slice(0, 5)
      : [...tailors].sort((a, b) => (b.rating || 5) - (a.rating || 5)).slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const heroBg =
    activeTab === 'arrivals'
      ? 'bg-gradient-to-br from-emerald-800 to-teal-900'
      : activeTab === 'trending'
      ? 'bg-gradient-to-br from-violet-900 to-purple-900'
      : 'bg-gradient-to-br from-cyan-700 via-blue-800 to-indigo-900';

  return (
    <div className="bg-stone-50 min-h-screen pb-10 font-poppins">

      {/* Hero */}
      <div className={`pt-16 pb-16 px-6 relative overflow-hidden shadow-xl rounded-b-[40px] transition-colors duration-500 ${heroBg}`}>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-black rounded-full mix-blend-overlay filter blur-3xl opacity-20" />

        <div className="relative z-10 max-w-4xl mx-auto text-center md:text-left">
          <motion.h1
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black mb-3 text-white"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {activeTab === 'arrivals' ? (
              <>New <span className="text-emerald-300">Arrivals</span></>
            ) : activeTab === 'trending' ? (
              <>Trending <span className="text-violet-300">Now</span></>
            ) : (
              <>✨ <span className="text-cyan-300">AI</span> Recommended</>
            )}
          </motion.h1>
          <motion.p
            key={`${activeTab}-desc`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-lg md:text-xl font-medium max-w-2xl mx-auto md:mx-0"
          >
            {activeTab === 'arrivals'
              ? 'Discover the freshest talent and newest styles added this week.'
              : activeTab === 'trending'
              ? 'Explore the most popular tailors and hottest designs everyone is talking about.'
              : 'Smart picks tailored to your style — let AI do the work.'}
          </motion.p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">

        {/* Tab bar */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex mb-8 max-w-sm mx-auto md:mx-0 relative">
          <div className="absolute inset-0 rounded-2xl bg-white shadow-inner" />
          <button
            onClick={() => setActiveTab('arrivals')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all relative z-10 ${activeTab === 'arrivals' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-stone-400 hover:text-stone-600'}`}
          >
            🆕 New Arrivals
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all relative z-10 ${activeTab === 'trending' ? 'bg-violet-50 text-violet-700 shadow-sm border border-violet-100' : 'text-stone-400 hover:text-stone-600'}`}
          >
            📈 Trending
          </button>
          <button
            onClick={() => navigate('/ai-recommendations')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all relative z-10 text-stone-400 hover:text-cyan-600 hover:bg-cyan-50`}
          >
            ✨ AI Pick
          </button>
        </div>

        {/* Content — AI Pick gets its own section, others keep tailor cards */}
        <AnimatePresence mode="wait">
          {activeTab === 'ai-recommended' ? (
            <AiPickSection key="ai" navigate={navigate} />
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl">
              <span className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4 ${activeTab === 'arrivals' ? 'border-emerald-200 border-t-emerald-600' : 'border-violet-200 border-t-violet-600'}`} />
              <p className="text-stone-500 font-bold">Curating the best collections...</p>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {displayedTailors.map((tailor) => {
                const initials = tailor.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'T';
                const loc = tailor.city ? `${tailor.city}${tailor.state ? ', ' + tailor.state : ''}` : 'Location unknown';

                return (
                  <motion.div
                    key={tailor.id}
                    variants={itemVariants}
                    className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-stone-100 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group cursor-pointer"
                    onClick={() => navigate(`/tailor-profile/${tailor.id}`)}
                  >
                    <div className="p-6 flex items-start gap-5 relative">
                      {activeTab === 'arrivals' && (
                        <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">New</div>
                      )}
                      {activeTab === 'trending' && (
                        <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                          <span>🔥</span> Hot
                        </div>
                      )}

                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300 ${activeTab === 'arrivals' ? 'bg-emerald-50 border border-emerald-100' : 'bg-violet-50 border border-violet-100'}`}>
                        {tailor.profile_img ? (
                          <img src={resolveImg(tailor.profile_img)} alt={tailor.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className={`font-black text-2xl ${activeTab === 'arrivals' ? 'text-emerald-400' : 'text-violet-400'}`}>{initials}</span>
                        )}
                      </div>

                      <div className="flex-1 mt-1">
                        <h2 className="font-black text-xl text-stone-800 leading-tight group-hover:text-indigo-600 transition-colors" style={{ fontFamily: 'Sora, sans-serif' }}>
                          {tailor.shop_name || tailor.full_name}
                        </h2>
                        {tailor.tagline && <p className="text-xs font-semibold text-stone-500 mt-1 line-clamp-2 leading-relaxed">{tailor.tagline}</p>}
                        <div className="flex items-center gap-1 mt-3 opacity-80 bg-stone-50 self-start px-2 py-1 rounded-md border border-stone-100 inline-flex">
                          <span className="text-xs">📍</span>
                          <span className="text-[10px] font-bold tracking-wide uppercase text-stone-500">{loc}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {displayedTailors.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center py-16 bg-white rounded-3xl shadow-sm border border-stone-100">
                  <span className="text-5xl mb-4 block">✨</span>
                  <p className="text-stone-500 font-bold text-lg">More collections arriving soon.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ArrivalsAndTrendingPage;
