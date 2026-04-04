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
    const [imgLightbox, setImgLightbox] = useState(false);
    const [deals, setDeals] = useState([]);

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
            .then(data => {
                setTailor(data.tailor);
                // Also set deals from profile if present
                if (Array.isArray(data.tailor?.deals)) setDeals(data.tailor.deals);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
        // Fetch deals separately as fallback
        fetch(`${API_URL}/api/tailors/${id}/deals`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.deals?.length) setDeals(d.deals); })
            .catch(() => {});
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
    const activeDeals = deals.filter(d => d.active !== false);
    const now = new Date();
    const validDeals = activeDeals.filter(d => !d.validUntil || new Date(d.validUntil) >= now);

    return (
        <div className="min-h-screen bg-gray-50 pb-24" style={{background:'linear-gradient(135deg,#f8f9ff 0%,#f0f2fb 100%)'}}>
            {/* Sticky top bar */}
            <div className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-100">
                <div className="flex items-center px-4 py-3 max-w-screen-xl mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-1 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-base font-bold text-gray-800 ml-2 flex-1 truncate">{tailor.full_name}</h1>
                    {todayStatus && (
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full mr-1 flex items-center gap-1.5 ${todayStatus.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            <span className={`w-2 h-2 rounded-full inline-block ${todayStatus.open ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}/>
                            {todayStatus.open ? 'Open' : 'Closed'}
                        </span>
                    )}
                </div>
            </div>

            <main className="w-full px-0">

                {/* ── Full-Width Hero Banner ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                    {/* Wide gradient banner */}
                    <div className={`w-full bg-gradient-to-br ${avatarGradient} relative`} style={{minHeight:'220px'}}>
                        {/* Decorative circles */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/10" />
                            <div className="absolute top-10 right-32 w-32 h-32 rounded-full bg-white/5" />
                            <div className="absolute -bottom-8 left-20 w-48 h-48 rounded-full bg-black/10" />
                        </div>
                        {tailor.badge && (
                            <span className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 text-indigo-700 text-xs font-bold rounded-full shadow-md z-10">
                                {tailor.badge}
                            </span>
                        )}
                        {todayStatus && (
                            <span className={`absolute bottom-4 right-4 text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm border z-10 flex items-center gap-1.5 ${todayStatus.open ? 'bg-green-500/90 text-white border-green-400' : 'bg-red-500/90 text-white border-red-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${todayStatus.open ? 'bg-white animate-pulse' : 'bg-red-200'}`}/>
                                {todayStatus.open ? `Open · ${todayStatus.label}` : 'Closed Today'}
                            </span>
                        )}
                    </div>

                    {/* Profile info row - full width, avatar sits on the banner/white boundary */}
                    <div className="bg-white w-full px-4 md:px-8 pb-5 shadow-sm relative" style={{paddingTop:'72px'}}>
                        {/* Avatar — absolutely positioned so it spans the border, fully visible */}
                        <div
                            className={`absolute -top-16 left-4 md:left-8 w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center text-4xl font-bold text-white flex-shrink-0 cursor-pointer ring-2 ring-white hover:ring-indigo-300 transition-all duration-200 ${profileImgUrl ? '' : `bg-gradient-to-br ${avatarGradient}`}`}
                            onClick={() => profileImgUrl && setImgLightbox(true)}
                            title={profileImgUrl ? 'Click to view photo' : ''}
                        >
                            {profileImgUrl
                                ? <img src={profileImgUrl} alt={tailor.full_name} className="w-full h-full object-cover" />
                                : initials}
                            {/* Zoom hint overlay on hover */}
                            {profileImgUrl && (
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center transition-all duration-200 rounded-full">
                                    <span className="text-white text-2xl opacity-0 hover:opacity-100 transition-opacity">🔍</span>
                                </div>
                            )}
                        </div>
                        <div className="max-w-screen-xl mx-auto">
                            {/* Rating row aligned to right */}
                            <div className="flex items-start justify-end mb-4">
                                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full shadow-sm">
                                    <FaStar className="text-amber-400" />
                                    <span className="text-base font-black text-amber-700">{tailor.rating || '4.5'}</span>
                                    {tailor.reviews && <span className="text-xs text-gray-400 font-medium">({tailor.reviews} reviews)</span>}
                                </div>
                            </div>

                            {/* Name + details */}
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{tailor.full_name}</h2>
                            {tailor.shop_name && tailor.shop_name !== tailor.full_name && (
                                <p className="text-indigo-600 font-bold text-base mt-1">{tailor.shop_name}</p>
                            )}
                            {(tailor.tagline || tailor.specialty) && (
                                <p className="text-gray-500 text-sm italic mt-2 flex items-start gap-1.5">
                                    <FaQuoteLeft className="text-indigo-300 text-sm mt-0.5 flex-shrink-0" />
                                    {tailor.tagline || tailor.specialty}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                {(tailor.city || tailor.state) && (
                                    <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                                        <FaMapMarkerAlt className="text-indigo-400 text-xs" />
                                        {[tailor.city, tailor.state].filter(Boolean).join(', ')}
                                    </span>
                                )}
                                {tailor.email && (
                                    <span className="text-gray-400 text-xs">✉️ {tailor.email}</span>
                                )}
                            </div>
                            {(tailor.experience || specialities.length > 0) && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {tailor.experience && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full">
                                            🏆 {tailor.experience}
                                        </span>
                                    )}
                                    {specialities.map(s => (
                                        <span key={s} className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Content Grid (responsive 1 or 2 col) ── */}
                <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* ── Left column ── */}
                <div className="lg:col-span-1 flex flex-col gap-4">

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
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact</p>
                        <div className="flex flex-col gap-2.5">
                            {tailor.phone && (
                                <a href={`tel:${tailor.phone}`}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 px-4 rounded-xl font-semibold hover:bg-blue-100 transition border border-blue-100 text-sm">
                                    <FaPhone className="text-xs" /> Call Now
                                    <span className="text-blue-400 text-xs font-normal ml-1">{tailor.phone}</span>
                                </a>
                            )}
                            {tailor.whatsapp && (
                                <a href={`https://wa.me/91${tailor.whatsapp}?text=Hi, I found your profile on TailorHub!`} target="_blank" rel="noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3 px-4 rounded-xl font-semibold hover:bg-green-100 transition border border-green-100 text-sm">
                                    <FaWhatsapp /> WhatsApp
                                </a>
                            )}
                            {tailor.instagram && (
                                <a href={`https://instagram.com/${tailor.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-pink-50 text-pink-600 py-3 px-4 rounded-xl font-semibold hover:bg-pink-100 transition border border-pink-100 text-sm">
                                    <FaInstagram /> {tailor.instagram}
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── Address (inside left column) ── */}
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

                {/* ── Quick Stats strip (left col) ── */}
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

                </div>{/* end left col */}

                {/* ── Right column (2 cols wide) ── */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                {/* ── Special Deals & Offers ── */}
                {validDeals.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-50 bg-gradient-to-r from-orange-50 to-amber-50">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🎁</span>
                                <h3 className="font-bold text-sm text-orange-800 uppercase tracking-wide">Special Deals & Offers</h3>
                            </div>
                            <span className="text-xs font-black bg-orange-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                                {validDeals.length} Active
                            </span>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                            {validDeals.map((deal, idx) => (
                                <div key={idx} className="relative rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 overflow-hidden">
                                    {/* bg glow */}
                                    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-orange-300/20" />
                                    <div className="flex items-start justify-between gap-3 relative">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className="text-sm font-black text-gray-900">{deal.title}</span>
                                                {deal.occasion && (
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-white border border-indigo-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                                        🎉 {deal.occasion}
                                                    </span>
                                                )}
                                            </div>
                                            {deal.description && (
                                                <p className="text-xs text-gray-600 leading-relaxed mb-2">{deal.description}</p>
                                            )}
                                            {deal.validUntil && (
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                                    <span>📅</span>
                                                    <span>Valid until <strong className="text-orange-600">{new Date(deal.validUntil).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</strong></span>
                                                </p>
                                            )}
                                        </div>
                                        {deal.discount && (
                                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-200">
                                                <span className="text-white font-black text-xl leading-none">{deal.discount}%</span>
                                                <span className="text-orange-100 text-[9px] font-bold uppercase tracking-wider">OFF</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <p className="text-center text-[11px] text-orange-400 font-semibold">🌟 Book an appointment to avail these offers!</p>
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

                {/* Address is now in left col above */}

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

                {/* ── Pricing Catalog ── */}
                {tailor.price_listings && tailor.price_listings.length > 0 && (() => {
                    const cats = [...new Set(tailor.price_listings.map(i=>i.cat).filter(Boolean))];
                    return (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">🏷️</span>
                                    <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Pricing Catalog</h3>
                                </div>
                                <span className="text-xs text-gray-400">{tailor.price_listings.length} items</span>
                            </div>
                            <div className="p-4 space-y-5">
                                {cats.map(cat => (
                                    <div key={cat}>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">{cat}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {tailor.price_listings.filter(i=>i.cat===cat).map((item,idx) => (
                                                <div key={idx} className="rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-50">
                                                    <div className="h-28 bg-gray-100 relative">
                                                        {resolveImg(item.img)
                                                            ? <img src={resolveImg(item.img)} alt={item.name} className="w-full h-full object-cover"/>
                                                            : <div className="w-full h-full flex items-center justify-center text-3xl">🧵</div>}
                                                        <span className="absolute top-1.5 left-1.5 text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">{cat}</span>
                                                    </div>
                                                    <div className="p-2.5">
                                                        <p className="text-xs font-bold text-gray-800 leading-tight">{item.name}</p>
                                                        {item.desc && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{item.desc}</p>}
                                                        <p className="text-indigo-600 font-black text-sm mt-1.5">₹{Number(item.price).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })()}

                {/* ── Gallery ── */}
                {tailor.gallery && tailor.gallery.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                            <span className="text-base">🖼️</span>
                            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Recent Work</h3>
                            <span className="ml-auto text-xs text-gray-400">{tailor.gallery.length} photos</span>
                        </div>
                        <div className="p-4 grid grid-cols-3 md:grid-cols-4 gap-2">
                            {tailor.gallery.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={resolveImg(img)} alt={`Work ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                </div>{/* end right col */}
                </div>{/* end grid */}
                </div>{/* end content wrapper */}

                {/* Spacer for floating button */}
                <div className="h-4" />
            </main>

            {/* ── Floating Book Appointment Button ── */}
            <div className="fixed bottom-16 left-0 right-0 px-4 z-30 flex justify-center pointer-events-none">
                <motion.button
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    onClick={() => navigate(`/book-appointment/${id}`)}
                    className="pointer-events-auto w-full max-w-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base py-4 px-8 rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2">
                    ✂️ Book Appointment
                </motion.button>
            </div>

            {/* ── Profile Image Lightbox ── */}
            {imgLightbox && profileImgUrl && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
                    onClick={() => setImgLightbox(false)}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                        className="relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={profileImgUrl}
                            alt={tailor.full_name}
                            className="max-w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl object-contain border-4 border-white"
                        />
                        <p className="text-white text-center mt-3 font-semibold text-sm opacity-80">{tailor.full_name}</p>
                        <button
                            onClick={() => setImgLightbox(false)}
                            className="absolute -top-4 -right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-700 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-lg"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </motion.div>
                    <p className="absolute bottom-8 text-white/50 text-xs">Tap anywhere to close</p>
                </motion.div>
            )}
        </div>
    );
};

export default TailorDetailsPage;
