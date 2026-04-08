import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL;

export default function ActiveOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/offers/active`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.offers) setOffers(data.offers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || offers.length === 0) return null;

  return (
    <section className="px-4 pb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-black text-[15px] text-stone-900 flex items-center gap-1.5" style={{fontFamily:'Sora,sans-serif'}}>
            🔥 Active Offers Near You
          </h2>
          <p className="text-[11px] text-stone-500 font-bold mt-0.5">Top discounts around you</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
        {offers.map(o => (
          <motion.div
            key={o.id}
            whileHover={{ y: -3 }}
            className="flex-shrink-0 w-64 snap-center bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden"
          >
            {/* Background Decor */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            {/* Badge */}
            <span className="absolute top-3 right-3 bg-white text-red-500 text-[9px] font-black uppercase px-2 py-1 rounded-full shadow-sm animate-pulse">
              Active Offer
            </span>

            {/* Shop info */}
            <div className="flex items-center gap-2 mb-3 relative z-10">
              {o.profile_img ? (
                <img src={o.profile_img} alt={o.shop_name} className="w-8 h-8 rounded-full border-2 border-white/30 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                  {o.shop_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Tailor Shop</p>
                <p className="text-xs font-bold truncate w-28">{o.shop_name}</p>
              </div>
            </div>

            {/* Offer details */}
            <div className="mb-4 relative z-10">
              <h3 className="font-black text-lg leading-tight mb-1">{o.title}</h3>
              {o.description && <p className="text-[10px] text-white/90 line-clamp-2">{o.description}</p>}
            </div>

            {/* Display discount & CTA */}
            <div className="flex items-end justify-between relative z-10">
              <div>
                <span className="block text-2xl font-black">{o.discount_label}</span>
                <span className="text-[10px] font-bold text-white/80 bg-black/10 px-2 py-0.5 rounded-full inline-block mt-1">
                  Valid till {new Date(o.end_date).toLocaleDateString()}
                  {o.days_left !== null && o.days_left > 0 ? ` (${o.days_left}d left)` : o.days_left === 0 ? ' (Ends Today)' : ''}
                </span>
              </div>
            </div>

            <button
               onClick={() => navigate(`/tailor/${o.tailor_id}`)}
               className="w-full mt-4 bg-white text-red-600 font-bold py-2 rounded-xl text-xs hover:bg-red-50 transition shadow-sm relative z-10">
               Claim Custom Fit ✂️
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
