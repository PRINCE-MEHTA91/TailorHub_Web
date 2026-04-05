import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const resolveImg = (p) => { if (!p) return null; return p.startsWith('http') ? p : `${API_URL}${p}`; };

/* ── Gradient palette cycling per card ─────────────────── */
const GRADIENTS = [
  'from-rose-400 to-pink-600',
  'from-indigo-400 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
  'from-violet-400 to-fuchsia-600',
  'from-emerald-400 to-green-600',
];

/* ── Category accent colors ─────────────────────────────── */
const CAT_COLORS = {
  "Bridal":       { bg: 'bg-rose-100',   text: 'text-rose-700'   },
  "Men's Wear":   { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  "Women's Wear": { bg: 'bg-pink-100',   text: 'text-pink-700'   },
  "Kids Wear":    { bg: 'bg-purple-100', text: 'text-purple-700' },
  "Alterations":  { bg: 'bg-teal-100',   text: 'text-teal-700'   },
  "Other":        { bg: 'bg-gray-100',   text: 'text-gray-700'   },
};
const getCatColor = (cat) => CAT_COLORS[cat] || { bg: 'bg-indigo-100', text: 'text-indigo-700' };

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function FeaturedPricing() {
  const navigate   = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/tailors`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.tailors) return;
        // Collect all price_listings across all tailors, attach tailor info
        const all = [];
        data.tailors.forEach(t => {
          const listings = Array.isArray(t.price_listings) ? t.price_listings : [];
          listings.forEach(item => {
            all.push({
              ...item,
              tailorId:   t.id,
              shopName:   t.shop_name || t.full_name || 'Tailor Shop',
              tailorName: t.full_name,
            });
          });
        });
        // Pick 2 random items so it feels "curated"
        const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 2);
        setItems(shuffled);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Don't render section if no real data
  if (loading || items.length === 0) return null;

  return (
    <section style={{ padding: '0 16px 8px' }}>
      {/* Section header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
        <div>
          <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:900, fontSize:'15px', color:'#1c1917', margin:0 }}>
            🏷️ Pricing Catalog
          </h2>
          <p style={{ fontSize:'11px', color:'#78716c', margin:'2px 0 0', fontWeight:600 }}>
            Real prices from local tailors
          </p>
        </div>
        <button
          onClick={() => navigate('/tailors')}
          style={{ fontSize:'11px', fontWeight:800, color:'#f97316', background:'#fff7ed',
                   border:'1px solid #fed7aa', borderRadius:'20px', padding:'4px 12px', cursor:'pointer' }}>
          View All →
        </button>
      </div>

      {/* Cards row */}
      <motion.div
        variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.12 } } }}
        initial="hidden" whileInView="show" viewport={{ once:true, margin:'-40px' }}
        style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}
      >
        {items.map((item, idx) => {
          const grad   = GRADIENTS[idx % GRADIENTS.length];
          const cat    = getCatColor(item.cat);
          const imgUrl = resolveImg(item.img);

          return (
            <motion.div
              key={item.id || idx}
              variants={cardVariants}
              whileHover={{ y:-4, boxShadow:'0 16px 40px rgba(0,0,0,0.13)' }}
              style={{
                background:'#fff', borderRadius:'20px',
                border:'1px solid #f0f0f0',
                boxShadow:'0 2px 12px rgba(0,0,0,0.07)',
                overflow:'hidden', display:'flex', flexDirection:'column',
              }}
            >
              {/* Image / gradient hero */}
              <div style={{ position:'relative', height:'130px', flexShrink:0 }}>
                {imgUrl ? (
                  <img src={imgUrl} alt={item.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <div className={`bg-gradient-to-br ${grad}`}
                    style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                             justifyContent:'center', fontSize:'44px' }}>
                    🧵
                  </div>
                )}
                {/* Category badge */}
                <span className={`${cat.bg} ${cat.text}`}
                  style={{ position:'absolute', top:'8px', left:'8px', fontSize:'9px',
                           fontWeight:900, padding:'3px 8px', borderRadius:'999px',
                           textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  {item.cat || 'Fashion'}
                </span>
                {/* Featured badge */}
                <span style={{ position:'absolute', top:'8px', right:'8px', fontSize:'9px',
                               fontWeight:900, background:'rgba(249,115,22,0.95)',
                               color:'#fff', padding:'3px 8px', borderRadius:'999px' }}>
                  ⭐ Featured
                </span>
              </div>

              {/* Content */}
              <div style={{ padding:'10px 12px 12px', display:'flex', flexDirection:'column', flex:1 }}>
                {/* Product name */}
                <p style={{ fontFamily:'Sora,sans-serif', fontWeight:900, fontSize:'13px',
                            color:'#1c1917', margin:0, lineHeight:'1.3',
                            display:'-webkit-box', WebkitLineClamp:2,
                            WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  {item.name}
                </p>
                {/* Shop name */}
                <p style={{ fontSize:'10px', color:'#a78bfa', fontWeight:700,
                            margin:'3px 0 0', display:'flex', alignItems:'center', gap:'3px' }}>
                  <span>✂️</span> {item.shopName}
                </p>
                {item.desc && (
                  <p style={{ fontSize:'10px', color:'#78716c', margin:'4px 0 0',
                              display:'-webkit-box', WebkitLineClamp:2,
                              WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:'1.4' }}>
                    {item.desc}
                  </p>
                )}

                {/* Price + Book Now */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                              marginTop:'auto', paddingTop:'10px' }}>
                  <span style={{ fontFamily:'Sora,sans-serif', fontWeight:900, fontSize:'16px',
                                 color:'#f97316' }}>
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => navigate(`/tailor/${item.tailorId}`)}
                    style={{
                      background:'linear-gradient(135deg,#f97316,#ea580c)',
                      color:'#fff', fontWeight:800, fontSize:'11px',
                      padding:'7px 12px', borderRadius:'12px', border:'none',
                      cursor:'pointer', letterSpacing:'0.02em',
                      boxShadow:'0 4px 12px rgba(249,115,22,0.35)',
                      transition:'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 16px rgba(249,115,22,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(249,115,22,0.35)'; }}
                  >
                    Book Now ✂️
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
