import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { FaWhatsapp, FaInstagram, FaPhone, FaMapMarkerAlt, FaStar, FaArrowLeft, FaClock } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const CAT_META = {
    mens:   { label: "Men's Wear",   icon: '👔', badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400' },
    womens: { label: "Women's Wear", icon: '👗', badge: 'bg-pink-100 text-pink-700',   dot: 'bg-pink-400' },
    kids:   { label: 'Kids / Child', icon: '🧒', badge: 'bg-purple-100 text-purple-700',dot: 'bg-purple-400' },
    alter:  { label: 'Alterations',  icon: '✂️', badge: 'bg-teal-100 text-teal-700',   dot: 'bg-teal-400' },
};

/* Resolve a stored image path/URL to a displayable URL */
function resolveImg(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
}

/* Group flat products array by category */
function groupProducts(products) {
    if (!Array.isArray(products) || products.length === 0) return null;
    const hasCat = products.some(p => p.cat);
    if (hasCat) {
        const grouped = { mens: [], womens: [], kids: [], alter: [] };
        products.forEach(p => {
            const c = p.cat || 'mens';
            if (grouped[c]) grouped[c].push(p);
        });
        return grouped;
    }
    // Flat (old format) — put everything under a generic group
    return { all: products };
}

const FALLBACK_TAILORS = [
    { id:'f1', full_name:'Priya Boutique', specialty:'Bridal & Lehenga', rating:4.9, reviews:312, city:'New Delhi', state:'Delhi', products:[{name:'Bridal Lehenga',price:'2000'}], badge:'👑 Top Rated', avatarGradient:'bg-gradient-to-br from-rose-400 to-rose-600', phone:'9876543210', whatsapp:'9876543210', instagram:'@priyaboutique', gallery:[] },
    { id:'f2', full_name:'Khan & Sons', specialty:"Men's Formal Wear", rating:4.7, reviews:198, city:'Mumbai', state:'Maharashtra', products:[{name:'Suit Tailoring',price:'3500'}], badge:'✅ Verified', avatarGradient:'bg-gradient-to-br from-indigo-400 to-indigo-600', phone:'9876543211', whatsapp:'9876543211', gallery:[] },
    { id:'f3', full_name:'Meera Creations', specialty:'Ladies Ethnic Wear', rating:4.8, reviews:421, city:'Bangalore', state:'Karnataka', products:[{name:'Blouse Stitching',price:'500'}], badge:'⚡ Quick Stitch', avatarGradient:'bg-gradient-to-br from-amber-400 to-amber-600', phone:'9876543212', gallery:[] },
];

const TailorDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tailor, setTailor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCat, setActiveCat] = useState(null);

    useEffect(() => {
        if (id.startsWith('f')) {
            const found = FALLBACK_TAILORS.find(t => t.id === id);
            if (found) { setTailor(found); }
            else setError('Tailor not found');
            setLoading(false);
            return;
        }
        fetch(`${API_URL}/api/tailors/${id}`)
            .then(res => { if (!res.ok) throw new Error('Tailor not found'); return res.json(); })
            .then(data => { setTailor(data.tailor); })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    // Set default active category once tailor loads
    useEffect(() => {
        if (!tailor) return;
        const grouped = groupProducts(tailor.products);
        if (!grouped) return;
        const firstCat = Object.keys(grouped).find(k => grouped[k].length > 0);
        if (firstCat) setActiveCat(firstCat);
    }, [tailor]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 flex justify-center items-center">
                <span className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <BottomNav />
        </div>
    );

    if (error || !tailor) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
                <span className="text-5xl mb-4">😕</span>
                <h2 className="text-2xl font-bold text-gray-800">Tailor Not Found</h2>
                <p className="text-gray-500 mt-2">{error || 'Details are not available.'}</p>
                <button onClick={() => navigate(-1)} className="mt-5 px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 font-semibold">
                    ← Go Back
                </button>
            </div>
            <BottomNav />
        </div>
    );

    const initials = tailor.initials || (tailor.full_name ? tailor.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'T');
    const avatarGradient = tailor.avatarGradient || 'bg-gradient-to-br from-indigo-500 to-purple-600';
    const profileImgUrl = resolveImg(tailor.profile_img);
    const hasAddress = tailor.street || tailor.city || tailor.state || tailor.pin;
    const fullAddress = [tailor.street, tailor.city, tailor.state, tailor.pin].filter(Boolean).join(', ');
    const grouped = groupProducts(tailor.products);
    const isGrouped = grouped && !grouped.all;
    const allServices = isGrouped
        ? Object.entries(grouped).flatMap(([,list]) => list)
        : (grouped?.all || []);

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Sticky top bar */}
            <div className="bg-white shadow-sm sticky top-0 z-20">
                <div className="flex items-center px-4 py-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-base font-bold text-gray-800 ml-2 flex-1 truncate">{tailor.full_name}</h1>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">

                {/* ── Hero Card ── */}
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Gradient banner */}
                    <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                        {tailor.badge && (
                            <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 text-indigo-700 text-xs font-bold rounded-full shadow-sm">
                                {tailor.badge}
                            </span>
                        )}
                    </div>
                    <div className="px-5 pb-5">
                        {/* Avatar */}
                        <div className="flex items-end justify-between -mt-12 mb-3">
                            <div className={`w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 ${profileImgUrl ? '' : avatarGradient}`}>
                                {profileImgUrl
                                    ? <img src={profileImgUrl} alt={tailor.full_name} className="w-full h-full object-cover"/>
                                    : initials}
                            </div>
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full mb-1">
                                <FaStar className="text-amber-400 text-xs"/>
                                <span className="text-sm font-bold text-amber-700">{tailor.rating || '4.5'}</span>
                                {tailor.reviews && <span className="text-xs text-gray-400">({tailor.reviews})</span>}
                            </div>
                        </div>

                        {/* Name + specialty */}
                        <h2 className="text-xl font-bold text-gray-900">{tailor.full_name}</h2>
                        <p className="text-indigo-600 font-semibold text-sm mt-0.5">{tailor.specialty || 'Professional Tailor'}</p>

                        {/* Location pill */}
                        {(tailor.city || tailor.state) && (
                            <div className="flex items-center gap-1.5 mt-2 text-gray-500 text-sm">
                                <FaMapMarkerAlt className="text-indigo-400 text-xs flex-shrink-0"/>
                                <span>{[tailor.city, tailor.state].filter(Boolean).join(', ')}</span>
                            </div>
                        )}

                        {/* Email */}
                        {tailor.email && (
                            <p className="text-gray-400 text-xs mt-1">✉️ {tailor.email}</p>
                        )}
                    </div>
                </motion.div>

                {/* ── Contact Actions ── */}
                {(tailor.phone || tailor.whatsapp || tailor.instagram) && (
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
                        className="grid grid-cols-1 gap-2.5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Contact</p>
                        <div className="flex flex-wrap gap-2.5">
                            {tailor.phone && (
                                <a href={`tel:${tailor.phone}`}
                                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 px-4 rounded-2xl font-semibold hover:bg-blue-100 transition border border-blue-100 text-sm">
                                    <FaPhone className="text-xs"/> Call Now
                                    <span className="text-blue-400 text-xs font-normal">{tailor.phone}</span>
                                </a>
                            )}
                            {tailor.whatsapp && (
                                <a href={`https://wa.me/91${tailor.whatsapp}?text=Hi, I found your profile on TailorHub!`} target="_blank" rel="noreferrer"
                                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3 px-4 rounded-2xl font-semibold hover:bg-green-100 transition border border-green-100 text-sm">
                                    <FaWhatsapp /> WhatsApp
                                </a>
                            )}
                            {tailor.instagram && (
                                <a href={`https://instagram.com/${tailor.instagram.replace('@','')}`} target="_blank" rel="noreferrer"
                                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-pink-50 text-pink-600 py-3 px-4 rounded-2xl font-semibold hover:bg-pink-100 transition border border-pink-100 text-sm">
                                    <FaInstagram /> {tailor.instagram}
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── Address ── */}
                {hasAddress && (
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <FaMapMarkerAlt className="text-indigo-400"/>
                            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Shop Address</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {tailor.street && <>{tailor.street}<br/></>}
                            {[tailor.city, tailor.state].filter(Boolean).join(', ')}
                            {tailor.pin && <> – {tailor.pin}</>}
                        </p>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`} target="_blank" rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline">
                            📍 Open in Google Maps
                        </a>
                    </motion.div>
                )}

                {/* ── Services & Pricing ── */}
                {allServices.length > 0 && (
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                            <span className="text-base">🏷️</span>
                            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Services & Pricing</h3>
                        </div>

                        {/* Category tabs — only show when categorised */}
                        {isGrouped && (
                            <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto">
                                {Object.entries(grouped).filter(([,list])=>list.length>0).map(([key,list])=>{
                                    const m = CAT_META[key] || {label:key, icon:'🪡', badge:'bg-gray-100 text-gray-600', dot:'bg-gray-400'};
                                    return (
                                        <button key={key} onClick={()=>setActiveCat(key)}
                                            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition whitespace-nowrap
                                                ${activeCat===key ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300'}`}>
                                            <span>{m.icon}</span>{m.label}
                                            <span className={`ml-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeCat===key?'bg-white/20 text-white':m.badge}`}>{list.length}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Service list */}
                        <div className="p-4 flex flex-col gap-2">
                            {(isGrouped ? (grouped[activeCat]||[]) : allServices).map((item, idx) => {
                                const m = isGrouped && CAT_META[activeCat];
                                return (
                                    <div key={idx} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${m ? m.badge.replace('text-','border-').replace('bg-','')+'bg-gray-50' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex items-center gap-2.5">
                                            {m && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.dot}`}/>}
                                            <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                            ₹{Number(item.price).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Category summary strip */}
                        {isGrouped && (
                            <div className="grid grid-cols-4 border-t border-gray-50 divide-x divide-gray-50">
                                {Object.entries(CAT_META).map(([key,m])=>(
                                    <button key={key} onClick={()=>{ if((grouped[key]||[]).length>0) setActiveCat(key); }}
                                        className={`py-2.5 flex flex-col items-center gap-0.5 transition ${grouped[key]?.length?'cursor-pointer hover:bg-gray-50':' opacity-30 cursor-not-allowed'} ${activeCat===key?'bg-indigo-50':''}`}>
                                        <span className="text-base">{m.icon}</span>
                                        <span className={`text-[9px] font-black ${activeCat===key?'text-indigo-600':'text-gray-400'}`}>{grouped[key]?.length||0}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* No services placeholder */}
                {allServices.length === 0 && (
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <span className="text-4xl block mb-2">🪡</span>
                        <p className="text-gray-500 font-semibold">No services listed yet</p>
                        <p className="text-gray-400 text-sm mt-1">Contact the tailor directly for pricing</p>
                    </motion.div>
                )}

                {/* ── Gallery ── */}
                {tailor.gallery && tailor.gallery.length > 0 && (
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                            <span className="text-base">🖼️</span>
                            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Recent Work</h3>
                            <span className="ml-auto text-xs text-gray-400">{tailor.gallery.length} photos</span>
                        </div>
                        <div className="p-4 grid grid-cols-3 gap-2">
                            {tailor.gallery.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={resolveImg(img)} alt={`Work ${idx+1}`} className="w-full h-full object-cover"/>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Availability info ─ */}
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.24 }}
                    className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 flex items-center gap-3">
                    <FaClock className="text-indigo-400 text-lg flex-shrink-0"/>
                    <div>
                        <p className="text-sm font-bold text-indigo-700">Available for Custom Orders</p>
                        <p className="text-xs text-indigo-500 mt-0.5">Book an appointment to discuss your requirements</p>
                    </div>
                </motion.div>

                {/* Spacer for floating button */}
                <div className="h-4"/>
            </main>

            {/* ── Floating Book Appointment Button ── */}
            <div className="fixed bottom-16 left-0 right-0 px-4 z-30 flex justify-center pointer-events-none">
                <motion.button
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                    onClick={() => navigate(`/book-appointment/${id}`)}
                    className="pointer-events-auto w-full max-w-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base py-4 px-8 rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2">
                    ✂️ Book Appointment
                </motion.button>
            </div>
        </div>
    );
};

export default TailorDetailsPage;
