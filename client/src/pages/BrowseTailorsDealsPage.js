import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const API_URL = process.env.REACT_APP_API_URL;

function resolveImg(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

const BrowseTailorsDealsPage = () => {
  const [tailors, setTailors] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/tailors`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_URL}/api/offers/active`).then(r => r.ok ? r.json() : null).catch(() => null)
    ])
    .then(([tailorData, offerData]) => {
      if (tailorData?.tailors) setTailors(tailorData.tailors);
      if (offerData?.offers) setOffers(offerData.offers);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-stone-50 min-h-screen pb-20 font-poppins">
      <Header />
      
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 text-white pt-10 pb-16 px-6 relative overflow-hidden shadow-xl rounded-b-[40px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s'}} />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-3" style={{fontFamily: 'Sora, sans-serif'}}
          >
            Explore Tailors & <span className="text-amber-400">Deals</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-indigo-200 text-lg md:text-xl font-medium max-w-2xl"
          >
            Discover top-rated tailors across the city and claim exclusive seasonal offers just for you.
          </motion.p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl">
            <span className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-stone-500 font-bold">Unlocking the best deals...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tailors.map((tailor, idx) => {
            const profileDeals = (tailor.deals || []).filter(d => {
              if (!d.active) return false;
              if (d.validUntil) {
                const daysLeft = Math.ceil(
                  (new Date(d.validUntil + 'T23:59:59') - new Date()) / (1000 * 60 * 60 * 24)
                );
                return daysLeft >= 0;
              }
              return true; // active with no validUntil = always show
            }).map(d => ({
               title: d.title, discountText: d.discount + '% OFF', occasion: d.occasion,
               validUntil: d.validUntil ? d.validUntil + 'T12:00:00' : null
            }));
            const tailorOffers = offers.filter(o => Number(o.tailor_id) === Number(tailor.id)).map(o => ({
               title: o.title, discountText: o.discount + (o.discount_type === 'percent' ? '% OFF' : '₹ OFF'),
               occasion: 'Special Offer',
               validUntil: o.end_date ? `${o.end_date}T12:00:00` : null
            }));
              const activeDeals = [...profileDeals, ...tailorOffers];

              const initials = tailor.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'T';
              const location = tailor.city ? `${tailor.city}${tailor.state ? ', ' + tailor.state : ''}` : 'Location unknown';
              
              return (
                <motion.div 
                  key={tailor.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-stone-100 hover:shadow-[0_15px_40px_rgb(0,0,0,0.1)] transition-all duration-300"
                >
                  <div className="p-5 md:p-6 flex flex-col md:flex-row gap-5">
                    {/* Tailor Avatar & Info */}
                    <div className="flex items-center gap-4 md:w-1/3 border-b md:border-b-0 md:border-r border-stone-100 pb-4 md:pb-0 md:pr-6 cursor-pointer group" onClick={() => navigate(`/tailor-profile/${tailor.id}`)}>
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-indigo-400 transition-colors">
                        {tailor.profile_img ? (
                          <img src={resolveImg(tailor.profile_img)} alt={tailor.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-indigo-400 font-black text-xl md:text-2xl">{initials}</span>
                        )}
                      </div>
                      <div>
                        <h2 className="font-black text-lg md:text-xl text-stone-800 leading-tight group-hover:text-indigo-600 transition-colors" style={{fontFamily: 'Sora, sans-serif'}}>
                          {tailor.shop_name || tailor.full_name}
                        </h2>
                        {tailor.tagline && <p className="text-xs font-semibold text-stone-500 mt-0.5 line-clamp-1">{tailor.tagline}</p>}
                        <div className="flex items-center gap-1 mt-1.5 opacity-80">
                          <span className="text-xs">📍</span>
                          <span className="text-[11px] font-bold tracking-wide uppercase text-stone-400">{location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Deals Section */}
                    <div className="flex-1 flex flex-col justify-center">
                      {activeDeals.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeDeals.map((deal, dIdx) => (
                            <div key={dIdx} className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between relative overflow-hidden group/deal hover:from-amber-100 hover:to-orange-100 transition-colors">
                              <div className="absolute -right-6 -top-6 w-16 h-16 bg-amber-400 opacity-20 rounded-full blur-xl group-hover/deal:opacity-40 transition-opacity" />
                              <div className="relative z-10 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex-shrink-0">{deal.discountText}</span>
                                  {deal.occasion && <span className="text-[10px] font-bold text-amber-900 truncate">🎉 {deal.occasion}</span>}
                                </div>
                                <h4 className="font-black text-sm text-stone-800 truncate">{deal.title}</h4>
                                {deal.validUntil && (
                                  <p className="text-[10px] text-stone-500 font-semibold mt-1">
                                    Ends: {new Date(deal.validUntil).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}
                                  </p>
                                )}
                              </div>
                              <button onClick={() => navigate(`/tailor-profile/${tailor.id}`)} className="relative z-10 w-8 h-8 rounded-full bg-white border border-amber-300 text-amber-500 flex items-center justify-center flex-shrink-0 ml-2 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm">
                                ›
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center bg-stone-50 border border-stone-100 border-dashed rounded-2xl p-4">
                          <p className="text-xs font-semibold text-stone-400 text-center">
                            No special offers right now.<br/>
                            <button onClick={() => navigate(`/tailor-profile/${tailor.id}`)} className="text-indigo-500 hover:underline mt-1 font-bold">View Regular Services &rarr;</button>
                          </p>
                        </div>
                      )}
                    </div>
                    
                  </div>
                </motion.div>
              );
            })}
            
            {tailors.length === 0 && (
              <div className="text-center py-10 bg-white rounded-3xl shadow-sm border border-stone-100">
                <span className="text-4xl mb-3 block">🧵</span>
                <p className="text-stone-500 font-bold">No tailors found at the moment.</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default BrowseTailorsDealsPage;
