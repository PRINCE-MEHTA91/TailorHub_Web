import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL;

export default function ActiveOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/offers/active`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_URL}/api/tailors`).then(r => r.ok ? r.json() : null).catch(() => null)
    ])
    .then(([offersData, tailorsData]) => {
      let combined = [];

      if (Array.isArray(offersData?.offers)) {
        offersData.offers.forEach(o => {
          const daysLeft = Number(o.days_left);
          if (daysLeft < 0) return;
          combined.push({
            id: `offer_${o.id}`,
            title: o.title,
            description: o.description || '',
            discount: o.discount,
            discount_type: o.discount_type || 'percent',
            end_date: o.end_date ? `${o.end_date}T12:00:00` : null,
            days_left: daysLeft,
            tailor_id: o.tailor_id,
            shop_name: o.shop_name || o.full_name || 'Tailor Shop',
            profile_img: o.profile_img || null,
          });
        });
      }

      if (Array.isArray(tailorsData?.tailors)) {
        tailorsData.tailors.forEach(t => {
          const tailorDeals = Array.isArray(t.deals) ? t.deals : [];
          tailorDeals.forEach(d => {
            if (!d.active) return;
            if (d.validUntil) {
              const daysLeft = Math.ceil(
                (new Date(d.validUntil + 'T23:59:59') - new Date()) / (1000 * 60 * 60 * 24)
              );
              if (daysLeft < 0) return;
            }
            const daysLeft = d.validUntil
              ? Math.ceil((new Date(d.validUntil + 'T23:59:59') - new Date()) / (1000 * 60 * 60 * 24))
              : 30;
            const endDate = d.validUntil
              ? `${d.validUntil}T12:00:00`
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            combined.push({
              id: `deal_${t.id}_${d.id || d.title}`,
              title: d.title,
              description: d.description || '',
              discount: d.discount,
              discount_type: 'percent',
              end_date: endDate,
              days_left: daysLeft,
              tailor_id: t.id || t.user_id,
              shop_name: t.shop_name || t.full_name || 'Tailor Shop',
              profile_img: t.profile_img || null,
            });
          });
        });
      }

      console.log('[ActiveOffers] combined offers:', combined.length, combined);
      setOffers(combined);
    })
    .catch(err => console.error('ActiveOffers fetch error:', err))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (offers.length === 0) return null;

  return (
    <section className="px-4 pb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-black text-[15px] text-stone-900 flex items-center gap-1.5" style={{ fontFamily: 'Sora,sans-serif' }}>
            🔥 Active Offers Near You
          </h2>
          <p className="text-[11px] text-stone-500 font-bold mt-0.5">Top discounts around you</p>
        </div>
        <button
          onClick={() => navigate('/browse-deals')}
          className="text-[11px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition"
        >
          See All →
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'none' }}>
        {offers.map(o => (
          <motion.div
            key={o.id}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/tailor-profile/${o.tailor_id}`)}
            className="flex-shrink-0 w-64 snap-center bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden cursor-pointer"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <span className="absolute top-3 right-3 bg-white text-red-500 text-[9px] font-black uppercase px-2 py-1 rounded-full shadow-sm animate-pulse">
              Active Offer
            </span>

            <div className="flex items-center gap-2 mb-3 relative z-10">
              {o.profile_img ? (
                <img
                  src={o.profile_img.startsWith('http') ? o.profile_img : `${API_URL}${o.profile_img}`}
                  alt={o.shop_name}
                  className="w-8 h-8 rounded-full border-2 border-white/30 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {(o.shop_name || 'T').charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Tailor Shop</p>
                <p className="text-xs font-bold truncate">{o.shop_name || 'Tailor'}</p>
              </div>
            </div>

            <div className="mb-3 relative z-10">
              <h3 className="font-black text-base leading-tight mb-0.5">{o.title}</h3>
              {o.description && (
                <p className="text-[10px] text-white/90 line-clamp-2">{o.description}</p>
              )}
            </div>

            <div className="relative z-10 mb-3">
              <span className="block text-2xl font-black">
                {o.discount}{o.discount_type === 'percent' ? '% OFF' : '₹ OFF'}
              </span>
              <span className="text-[10px] font-bold text-white/80 bg-black/10 px-2 py-0.5 rounded-full inline-block mt-1">
                Ends {new Date(o.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                {o.days_left !== null && o.days_left >= 0
                  ? o.days_left === 0 ? ' · Ends Today!' : ` · ${o.days_left}d left`
                  : ''}
              </span>
            </div>

            <button
              onClick={e => { e.stopPropagation(); navigate(`/tailor-profile/${o.tailor_id}`); }}
              className="w-full bg-white text-red-600 font-bold py-2 rounded-xl text-xs hover:bg-red-50 transition shadow-sm relative z-10"
            >
              Claim Offer ✂️
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
