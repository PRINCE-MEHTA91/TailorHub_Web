import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { FaWhatsapp, FaInstagram, FaPhone, FaMapMarkerAlt, FaStar, FaArrowLeft } from 'react-icons/fa';

const TailorDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tailor, setTailor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        if (id.startsWith('f')) {
            const fallbackTailors = [
                {
                    id: 'f1', full_name: 'Priya Boutique', initials: 'PB',
                    specialty: 'Bridal & Lehenga', rating: 4.9, reviews: 312,
                    city: 'New Delhi', state: 'Delhi', products: [{ name: 'Bridal Lehenga', price: '2000' }],
                    badge: '👑 Top Rated', avatarGradient: 'bg-gradient-to-br from-rose-400 to-rose-600',
                    phone: '9876543210', whatsapp: '9876543210', instagram: '@priyaboutique',
                    gallery: []
                },
                {
                    id: 'f2', full_name: 'Khan & Sons', initials: 'KS',
                    specialty: "Men's Formal Wear", rating: 4.7, reviews: 198,
                    city: 'Mumbai', state: 'Maharashtra', products: [{ name: 'Suit Tailoring', price: '3500' }],
                    badge: '✅ Verified', avatarGradient: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
                    phone: '9876543211', whatsapp: '9876543211',
                    gallery: []
                },
                {
                    id: 'f3', full_name: 'Meera Creations', initials: 'MC',
                    specialty: 'Ladies Ethnic Wear', rating: 4.8, reviews: 421,
                    city: 'Bangalore', state: 'Karnataka', products: [{ name: 'Blouse Stitching', price: '500' }],
                    badge: '⚡ Quick Stitch', avatarGradient: 'bg-gradient-to-br from-amber-400 to-amber-600',
                    phone: '9876543212',
                    gallery: []
                },
            ];
            const found = fallbackTailors.find(t => t.id === id);
            if (found) setTailor(found);
            else setError('Tailor not found');
            setLoading(false);
            return;
        }

        fetch(`http://localhost:3000/api/tailors/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Tailor not found');
                return res.json();
            })
            .then(data => {
                setTailor(data.tailor);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

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
                <h2 className="text-2xl font-bold text-gray-800">Oops!</h2>
                <p className="text-gray-600 mt-2">{error || 'Tailor details not available.'}</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700">
                    Go Back
                </button>
            </div>
            <BottomNav />
        </div>
    );

    const initials = tailor.initials || (tailor.full_name ? tailor.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'T');
    const avatarGradient = tailor.avatarGradient || 'bg-gradient-to-br from-indigo-500 to-purple-600';
    const address = [tailor.street, tailor.city, tailor.state, tailor.pin].filter(Boolean).join(', ');

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Area */}
            <div className="bg-white shadow-sm sticky top-0 z-20">
                <div className="flex items-center p-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800 ml-2 flex-1 line-clamp-1">{tailor.full_name}</h1>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Hero Profile Section */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    {/* Avatar */}
                    {tailor.profile_img ? (
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden shrink-0">
                            <img src={`http://localhost:3000${tailor.profile_img}`} alt={tailor.full_name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl md:text-5xl font-bold text-white shrink-0 ${avatarGradient}`}>
                            {initials}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{tailor.full_name}</h2>
                            {tailor.badge && <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full w-max mx-auto md:mx-0">{tailor.badge}</span>}
                        </div>
                        <p className="text-indigo-600 font-medium">{tailor.specialty || 'Professional Tailor'}</p>

                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mt-2">
                            {tailor.rating && (
                                <div className="flex items-center gap-1 font-semibold text-gray-800">
                                    <FaStar className="text-amber-400" />
                                    <span>{tailor.rating}</span>
                                    <span className="text-gray-400 font-normal">({tailor.reviews || 0} reviews)</span>
                                </div>
                            )}
                            {address && (
                                <div className="flex items-center gap-1">
                                    <FaMapMarkerAlt className="text-gray-400" />
                                    <span className="line-clamp-1">{tailor.city || tailor.state ? `${tailor.city}, ${tailor.state}` : 'Location available'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Contact Actions */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3">
                    {tailor.phone && (
                        <a href={`tel:${tailor.phone}`} className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 px-4 rounded-xl font-semibold hover:bg-blue-100 transition-colors border border-blue-100">
                            <FaPhone /> Call Now
                        </a>
                    )}
                    {tailor.whatsapp && (
                        <a href={`https://wa.me/${tailor.whatsapp}?text=Hi, I found your profile on TailorHub!`} target="_blank" rel="noreferrer" className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3 px-4 rounded-xl font-semibold hover:bg-green-100 transition-colors border border-green-100">
                            <FaWhatsapp /> WhatsApp
                        </a>
                    )}
                    {tailor.instagram && (
                        <a href={`https://instagram.com/${tailor.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-pink-50 text-pink-600 py-3 px-4 rounded-xl font-semibold hover:bg-pink-100 transition-colors border border-pink-100">
                            <FaInstagram /> Instagram
                        </a>
                    )}
                </motion.div>

                {/* About & Address Segment */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">Location Details</h3>
                    {address ? (
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-gray-50 rounded-xl text-indigo-500">
                                <FaMapMarkerAlt className="text-xl" />
                            </div>
                            <p className="text-gray-600 leading-relaxed pt-1">
                                {tailor.street && <>{tailor.street}<br /></>}
                                {tailor.city}{tailor.state && `, ${tailor.state}`} {tailor.pin}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Complete address not provided.</p>
                    )}
                </motion.div>

                {/* Services / Products */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 px-2">Services & Pricing</h3>
                    {tailor.products && tailor.products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {tailor.products.map((item, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                    <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg">₹{item.price}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center text-gray-500">
                            <p>No specific services listed yet.</p>
                        </div>
                    )}
                </motion.div>

                {/* Gallery Segment */}
                {tailor.gallery && tailor.gallery.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4 pt-4">
                        <h3 className="text-lg font-bold text-gray-800 px-2">Recent Work</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {tailor.gallery.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                                    <img src={img.startsWith('http') ? img : `http://localhost:3000${img}`} alt={`Work ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Floating Book Button Segment */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="fixed bottom-6 left-0 right-0 px-4 md:static md:px-0 md:mt-8 z-30 flex justify-center w-full max-w-4xl mx-auto">
                    <button 
                        onClick={() => navigate(`/book-appointment/${id}`)}
                        className="w-full md:w-auto md:min-w-[300px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg py-4 px-8 rounded-full shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 hover:from-indigo-700 hover:to-purple-700 active:translate-y-0 transition-all duration-300"
                    >
                        ✂️ Book Appointment
                    </button>
                </motion.div>

            </main>
        </div>
    );
};

export default TailorDetailsPage;
