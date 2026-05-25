import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function resolveImg(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

const ArrivalsAndTrendingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') === 'trending' ? 'trending' : 'arrivals';

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
        if (data?.tailors) {
         
          setTailors(data.tailors);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const displayedTailors = activeTab === 'arrivals' 
    ? [...tailors].reverse().slice(0, 5) 
    : [...tailors].sort((a, b) => (b.rating || 5) - (a.rating || 5)).slice(0, 5); 

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-10 font-poppins">
      
     
      <div className={`pt-16 pb-16 px-6 relative overflow-hidden shadow-xl rounded-b-[40px] transition-colors duration-500 ${activeTab === 'arrivals' ? 'bg-gradient-to-br from-emerald-800 to-teal-900' : 'bg-gradient-to-br from-violet-900 to-purple-900'}`}>
        
      
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
            style={{fontFamily: 'Sora, sans-serif'}}
          >
            {activeTab === 'arrivals' ? (
              <>New <span className="text-emerald-300">Arrivals</span></>
            ) : (
              <>Trending <span className="text-violet-300">Now</span></>
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
              : 'Explore the most popular tailors and hottest designs everyone is talking about.'}
          </motion.p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
      
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
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl">
            <span className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4 ${activeTab === 'arrivals' ? 'border-emerald-200 border-t-emerald-600' : 'border-violet-200 border-t-violet-600'}`} />
            <p className="text-stone-500 font-bold">Curating the best collections...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {displayedTailors.map((tailor, idx) => {
                const initials = tailor.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'T';
                const location = tailor.city ? `${tailor.city}${tailor.state ? ', ' + tailor.state : ''}` : 'Location unknown';
                
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
                        <h2 className="font-black text-xl text-stone-800 leading-tight group-hover:text-indigo-600 transition-colors" style={{fontFamily: 'Sora, sans-serif'}}>
                          {tailor.shop_name || tailor.full_name}
                        </h2>
                        {tailor.tagline && <p className="text-xs font-semibold text-stone-500 mt-1 line-clamp-2 leading-relaxed">{tailor.tagline}</p>}
                        <div className="flex items-center gap-1 mt-3 opacity-80 bg-stone-50 self-start px-2 py-1 rounded-md border border-stone-100 inline-flex">
                          <span className="text-xs">📍</span>
                          <span className="text-[10px] font-bold tracking-wide uppercase text-stone-500">{location}</span>
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
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default ArrivalsAndTrendingPage;
