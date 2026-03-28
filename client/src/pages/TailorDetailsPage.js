import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import {
    FaWhatsapp, FaInstagram, FaPhone, FaMapMarkerAlt,
    FaStar, FaArrowLeft, FaClock, FaQuoteLeft
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CAT_META = {
    mens:   { label: "Men's Wear",   icon: '👔', badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400', activeBg: 'bg-blue-600' },
    womens: { label: "Women's Wear", icon: '👗', badge: 'bg-pink-100 text-pink-700',   dot: 'bg-pink-400', activeBg: 'bg-pink-600' },
    kids:   { label: 'Kids / Child', icon: '🧒', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400', activeBg: 'bg-purple-600' },
    alter:  { label: 'Alterations',  icon: '✂️', badge: 'bg-teal-100 text-teal-700',   dot: 'bg-teal-400', activeBg: 'bg-teal-600' },
};

function resolveImg(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
}

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
    return { all: products };
}

/* Get today's timing label */
function getTodayStatus(timings) {
    if (!timings) return null;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = dayNames[new Date().getDay()];
    const t = timings[today];
    if (!t) return null;
    return t.closed ? { open: false, label: 'Closed Today', today } : { open: true, label: `${t.open} – ${t.close}`, today };
}

const FALLBACK_TAILORS = [
    {
        id: 'f1', full_name: 'Priya Boutique', specialty: 'Bridal & Lehenga',
        tagline: 'Stitching dreams, one thread at a time',
        bio: 'We specialise in exquisite bridal and ethnic wear, bringing your vision to life with fine craftsmanship.',
        experience: '6-10 years', specialities: ['Bridal Wear', 'Embroidery', 'Ethnic Wear'],
        rating: 4.9, reviews: 312, city: 'New Delhi', state: 'Delhi',
        products: [{ name: 'Bridal Lehenga', price: '2000' }],
        badge: '👑 Top Rated', avatarGradient: 'from-rose-400 to-rose-600',
        phone: '9876543210', whatsapp: '9876543210', instagram: '@priyaboutique', gallery: [],
        timings: { Mon:{open:'09:00',close:'20:00',closed:false}, Tue:{open:'09:00',close:'20:00',closed:false}, Wed:{open:'09:00',close:'20:00',closed:false}, Thu:{open:'09:00',close:'20:00',closed:false}, Fri:{open:'09:00',close:'20:00',closed:false}, Sat:{open:'09:00',close:'21:00',closed:false}, Sun:{open:'10:00',close:'17:00',closed:true} },
    },
    {
        id: 'f2', full_name: 'Khan & Sons', specialty: "Men's Formal Wear",
        tagline: 'Precision cuts for the modern gentleman',
        bio: 'Crafting bespoke suits and formal wear for over a decade. Every stitch tells a story of perfection.',
        experience: '11-15 years', specialities: ['Bespoke Suits', 'Uniform Stitching', 'Western Wear'],
        rating: 4.7, reviews: 198, city: 'Mumbai', state: 'Maharashtra',
        products: [{ name: 'Suit Tailoring', price: '3500' }],
        badge: '✅ Verified', avatarGradient: 'from-indigo-400 to-indigo-600',
        phone: '9876543211', whatsapp: '9876543211', gallery: [],
        timings: { Mon:{open:'10:00',close:'20:00',closed:false}, Tue:{open:'10:00',close:'20:00',closed:false}, Wed:{open:'10:00',close:'20:00',closed:false}, Thu:{open:'10:00',close:'20:00',closed:false}, Fri:{open:'10:00',close:'20:00',closed:false}, Sat:{open:'10:00',close:'18:00',closed:false}, Sun:{open:'10:00',close:'14:00',closed:true} },
    },
    {
        id: 'f3', full_name: 'Meera Creations', specialty: 'Ladies Ethnic Wear',
        tagline: 'Where fabric meets art',
        bio: 'Dedicated to creating beautiful ethnic and fusion designs that make every woman feel special.',
        experience: '3-5 years', specialities: ['Ethnic Wear', 'Alterations', 'Kids Wear'],
        rating: 4.8, reviews: 421, city: 'Bangalore', state: 'Karnataka',
        products: [{ name: 'Blouse Stitching', price: '500' }],
        badge: '⚡ Quick Stitch', avatarGradient: 'from-amber-400 to-amber-600',
        phone: '9876543212', gallery: [],
        timings: { Mon:{open:'09:00',close:'19:00',closed:false}, Tue:{open:'09:00',close:'19:00',closed:false}, Wed:{open:'09:00',close:'19:00',closed:false}, Thu:{open:'09:00',close:'19:00',closed:false}, Fri:{open:'09:00',close:'19:00',closed:false}, Sat:{open:'09:00',close:'17:00',closed:false}, Sun:{open:'10:00',close:'14:00',closed:false} },
    },
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
            if (found) setTailor(found);
            else setError('Tailor not found');
            setLoading(false);
            return;
        }
        fetch(`${API_URL}/api/tailors/${id}`)
            .then(res => { if (!res.ok) throw new Error('Tailor not found'); return res.json(); })
            .then(data => setTailor(data.tailor))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

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

    const initials = tailor.initials || (tailor.full_name
        ? tailor.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'T');
    const avatarGradient = tailor.avatarGradient || 'from-indigo-500 to-purple-600';
    const profileImgUrl = resolveImg(tailor.profile_img);
    const hasAddress = tailor.street || tailor.city || tailor.state || tailor.pin;
    const fullAddress = [tailor.street, tailor.city, tailor.state, tailor.pin].filter(Boolean).join(', ');
    const grouped = groupProducts(tailor.products);
    const isGrouped = grouped && !grouped.all;
    const allServices = isGrouped
        ? Object.entries(grouped).flatMap(([, list]) => list)
        : (grouped?.all || []);
    const specialities = Array.isArray(tailor.specialities) ? tailor.specialities : [];
    const timings = tailor.timings || null;
    const todayStatus = getTodayStatus(timings);
    const hasTimings = timings && Object.keys(timings).length > 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Sticky top bar */}
            <div className="bg-white shadow-sm sticky top-0 z-20">
                <div className="flex items-center px-4 py-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-base font-bold text-gray-800 ml-2 flex-1 truncate">{tailor.full_name}</h1>
                    {/* Today status badge in topbar */}
                    {todayStatus && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full mr-1 ${todayStatus.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {todayStatus.open ? '🟢 Open' : '🔴 Closed'}
                        </span>
                    )}
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">

                {/* ── Hero Card ── */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Gradient banner */}
                    <div className={`h-28 bg-gradient-to-br ${avatarGradient} relative`}>
                        {tailor.badge && (
                            <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 text-indigo-700 text-xs font-bold rounded-full shadow-sm">
                                {tailor.badge}
                            </span>
                        )}
                        {/* Today timing pill on banner */}
                        {todayStatus && (
                            <span className={`absolute bottom-3 left-4 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border ${todayStatus.open ? 'bg-green-500/90 text-white border-green-400' : 'bg-red-500/90 text-white border-red-400'}`}>
                                🕐 {todayStatus.open ? `Open · ${todayStatus.label}` : 'Closed Today'}
                            </span>
                        )}
                    </div>
                    <div className="px-5 pb-5">
                        {/* Avatar row */}
                        <div className="flex items-end justify-between -mt-12 mb-3">
                            <div className={`w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 ${profileImgUrl ? '' : `bg-gradient-to-br ${avatarGradient}`}`}>
                                {profileImgUrl
                                    ? <img src={profileImgUrl} alt={tailor.full_name} className="w-full h-full object-cover" />
                                    : initials}
                            </div>
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full mb-1">
                                <FaStar className="text-amber-400 text-xs" />
                                <span className="text-sm font-bold text-amber-700">{tailor.rating || '4.5'}</span>
                                {tailor.reviews && <span className="text-xs text-gray-400">({tailor.reviews})</span>}
                            </div>
                        </div>

                        {/* Name */}
                        <h2 className="text-xl font-bold text-gray-900">{tailor.full_name}</h2>

                        {/* Shop name if different */}
                        {tailor.shop_name && tailor.shop_name !== tailor.full_name && (
                            <p className="text-indigo-600 font-semibold text-sm mt-0.5">{tailor.shop_name}</p>
                        )}

                        {/* Specialty / tagline */}
                        {(tailor.tagline || tailor.specialty) && (
                            <p className="text-gray-500 text-sm italic mt-1 flex items-start gap-1">
                                <FaQuoteLeft className="text-indigo-200 text-xs mt-0.5 flex-shrink-0" />
                                {tailor.tagline || tailor.specialty}
                            </p>
                        )}

                        {/* Location pill */}
                        {(tailor.city || tailor.state) && (
                            <div className="flex items-center gap-1.5 mt-2 text-gray-500 text-sm">
                                <FaMapMarkerAlt className="text-indigo-400 text-xs flex-shrink-0" />
                                <span>{[tailor.city, tailor.state].filter(Boolean).join(', ')}</span>
                            </div>
                        )}

                        {/* Email */}
                        {tailor.email && (
                            <p className="text-gray-400 text-xs mt-1">✉️ {tailor.email}</p>
                        )}

                        {/* Experience + Specialities pills */}
                        {(tailor.experience || specialities.length > 0) && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {tailor.experience && (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                                        🏆 {tailor.experience}
                                    </span>
                                )}
                                {specialities.map(s => (
                                    <span key={s} className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── About / Bio ── */}
                {tailor.bio && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-base">✨</span>
                            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">About</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{tailor.bio}</p>
                    </motion.div>
                )}

                {/* ── Contact Actions ── */}
                {(tailor.phone || tailor.whatsapp || tailor.instagram) && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                        className="grid grid-cols-1 gap-2.5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Contact</p>
                        <div className="flex flex-wrap gap-2.5">
                            {tailor.phone && (
                                <a href={`tel:${tailor.phone}`}
                                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 px-4 rounded-2xl font-semibold hover:bg-blue-100 transition border border-blue-100 text-sm">
                                    <FaPhone className="text-xs" /> Call Now
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
                                <a href={`https://instagram.com/${tailor.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
                                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-pink-50 text-pink-600 py-3 px-4 rounded-2xl font-semibold hover:bg-pink-100 transition border border-pink-100 text-sm">
                                    <FaInstagram /> {tailor.instagram}
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── Shop Timings ── */}
                {hasTimings && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <FaClock className="text-indigo-400" />
                                <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Shop Timings</h3>
                            </div>
                            {todayStatus && (
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${todayStatus.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    Today: {todayStatus.label}
                                </span>
                            )}
                        </div>
                        <div className="px-4 py-2 divide-y divide-gray-50">
                            {DAYS.map(day => {
                                const t = timings[day];
                                if (!t) return null;
                                const isToday = day === todayStatus?.today;
                                return (
                                    <div key={day} className={`flex items-center justify-between py-2.5 ${isToday ? 'bg-indigo-50 -mx-4 px-4 rounded-lg' : ''}`}>
                                        <div className="flex items-center gap-2.5">
                                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0
                                                ${t.closed ? 'bg-gray-100 text-gray-400' : isToday ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {day}
                                            </span>
                                            {isToday && <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Today</span>}
                                        </div>
                                        {t.closed ? (
                                            <span className="text-xs font-bold text-red-400 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">Closed</span>
                                        ) : (
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${isToday ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                                                {t.open} – {t.close}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ── Address ── */}
                {hasAddress && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <FaMapMarkerAlt className="text-indigo-400" />
                            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Shop Address</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {tailor.street && <>{tailor.street}<br /></>}
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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                            <span className="text-base">🏷️</span>
                            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Services & Pricing</h3>
                            <span className="ml-auto text-xs text-gray-400">{allServices.length} services</span>
                        </div>

                        {/* Category tabs */}
                        {isGrouped && (
                            <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto">
                                {Object.entries(grouped).filter(([, list]) => list.length > 0).map(([key, list]) => {
                                    const m = CAT_META[key] || { label: key, icon: '🪡', badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
                                    return (
                                        <button key={key} onClick={() => setActiveCat(key)}
                                            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition whitespace-nowrap
                                                ${activeCat === key ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300'}`}>
                                            <span>{m.icon}</span>{m.label}
                                            <span className={`ml-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeCat === key ? 'bg-white/20 text-white' : m.badge}`}>{list.length}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Service list */}
                        <div className="p-4 flex flex-col gap-2">
                            {(isGrouped ? (grouped[activeCat] || []) : allServices).map((item, idx) => {
                                const m = isGrouped && CAT_META[activeCat];
                                return (
                                    <div key={idx} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${m ? m.badge.replace('text-', 'border-').replace('bg-', '') + 'bg-gray-50' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex items-center gap-2.5">
                                            {m && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.dot}`} />}
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
                                {Object.entries(CAT_META).map(([key, m]) => (
                                    <button key={key} onClick={() => { if ((grouped[key] || []).length > 0) setActiveCat(key); }}
                                        className={`py-2.5 flex flex-col items-center gap-0.5 transition ${grouped[key]?.length ? 'cursor-pointer hover:bg-gray-50' : 'opacity-30 cursor-not-allowed'} ${activeCat === key ? 'bg-indigo-50' : ''}`}>
                                        <span className="text-base">{m.icon}</span>
                                        <span className={`text-[9px] font-black ${activeCat === key ? 'text-indigo-600' : 'text-gray-400'}`}>{grouped[key]?.length || 0}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* No services placeholder */}
                {allServices.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <span className="text-4xl block mb-2">🪡</span>
                        <p className="text-gray-500 font-semibold">No services listed yet</p>
                        <p className="text-gray-400 text-sm mt-1">Contact the tailor directly for pricing</p>
                    </motion.div>
                )}

                {/* ── Gallery ── */}
                {tailor.gallery && tailor.gallery.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                            <span className="text-base">🖼️</span>
                            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Recent Work</h3>
                            <span className="ml-auto text-xs text-gray-400">{tailor.gallery.length} photos</span>
                        </div>
                        <div className="p-4 grid grid-cols-3 gap-2">
                            {tailor.gallery.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={resolveImg(img)} alt={`Work ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Quick Stats strip ── */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-3 divide-x divide-gray-100">
                        <div className="flex flex-col items-center py-4 gap-0.5">
                            <span className="text-xl font-black text-indigo-600">{allServices.length || '—'}</span>
                            <span className="text-[11px] text-gray-400 font-semibold">Services</span>
                        </div>
                        <div className="flex flex-col items-center py-4 gap-0.5">
                            <span className="text-xl font-black text-amber-500">{tailor.rating || '4.5'}⭐</span>
                            <span className="text-[11px] text-gray-400 font-semibold">Rating</span>
                        </div>
                        <div className="flex flex-col items-center py-4 gap-0.5">
                            <span className="text-xl font-black text-green-600">
                                {hasTimings ? Object.values(timings).filter(t => !t.closed).length : '—'}
                            </span>
                            <span className="text-[11px] text-gray-400 font-semibold">Days Open</span>
                        </div>
                    </div>
                </motion.div>

                {/* Spacer for floating button */}
                <div className="h-4" />
            </main>

            {/* ── Floating Book Appointment Button ── */}
            <div className="fixed bottom-16 left-0 right-0 px-4 z-30 flex justify-center pointer-events-none">
                <motion.button
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    onClick={() => navigate(`/book-appointment/${id}`)}
                    className="pointer-events-auto w-full max-w-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base py-4 px-8 rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2">
                    ✂️ Book Appointment
                </motion.button>
            </div>
        </div>
    );
};

export default TailorDetailsPage;
