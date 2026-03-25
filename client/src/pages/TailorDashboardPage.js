import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/* ─── Tab Content Components ─────────────────────────────────── */

const HomeTab = ({ user }) => {
    const navigate = useNavigate();
    const stats = [
        { label: 'Pending Jobs', value: '3', icon: '⏳', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', path: '/tailor/pending-jobs' },
        { label: 'Completed', value: '28', icon: '✅', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', path: '/tailor/completed' },
        { label: 'Earnings', value: '₹14,200', icon: '💰', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', path: '/tailor/earnings' },
        { label: 'Rating', value: '4.8 ⭐', icon: '🏆', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', path: null },
    ];
    const recentOrders = [
        { id: '#1042', customer: 'Riya Sharma', item: 'Lehenga (Bridal)', status: 'In Progress', due: 'Feb 28' },
        { id: '#1041', customer: 'Arun Mehta', item: 'Sherwani', status: 'Pending', due: 'Mar 2' },
        { id: '#1040', customer: 'Priya Patel', item: 'Blouse (Silk)', status: 'Completed', due: 'Feb 22' },
    ];
    const statusColor = { 'In Progress': 'bg-blue-100 text-blue-700', 'Pending': 'bg-amber-100 text-amber-700', 'Completed': 'bg-green-100 text-green-700' };

    return (
        <div className="space-y-5">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl p-6 text-white">
                <p className="text-amber-200 text-sm font-medium">Good evening 👋</p>
                <h2 className="text-2xl font-bold mt-1">{user?.full_name?.split(' ')[0]}</h2>
                <p className="text-amber-100 text-sm mt-1">You have <span className="font-bold text-white">3 pending jobs</span> today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((s) => (
                    <motion.div key={s.label} whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => s.path && navigate(s.path)}
                        className={`${s.bg} border ${s.border} rounded-2xl p-4 flex items-center gap-3 ${s.path ? 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-amber-300 transition-shadow' : ''}`}>
                        <span className="text-2xl">{s.icon}</span>
                        <div className="flex-1">
                            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                        {s.path && <span className="text-gray-400 text-base">›</span>}
                    </motion.div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Orders</h3>
                <div className="space-y-3">
                    {recentOrders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div>
                                <p className="text-sm font-medium text-gray-800">{o.customer}</p>
                                <p className="text-xs text-gray-400">{o.id} · {o.item}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[o.status]}`}>{o.status}</span>
                                <p className="text-xs text-gray-400 mt-1">Due {o.due}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const OrdersTab = () => {
    const [filter, setFilter] = useState('All');
    const filters = ['All', 'Pending', 'In Progress', 'Completed'];
    const orders = [
        { id: '#1042', customer: 'Riya Sharma', item: 'Lehenga (Bridal)', status: 'In Progress', due: 'Feb 28', amount: '₹4,500' },
        { id: '#1041', customer: 'Arun Mehta', item: 'Sherwani', status: 'Pending', due: 'Mar 2', amount: '₹3,200' },
        { id: '#1040', customer: 'Priya Patel', item: 'Blouse (Silk)', status: 'Completed', due: 'Feb 22', amount: '₹800' },
        { id: '#1039', customer: 'Karan Singh', item: 'Suit (3-piece)', status: 'Completed', due: 'Feb 20', amount: '₹6,000' },
        { id: '#1038', customer: 'Anita Desai', item: 'Salwar Kameez', status: 'Pending', due: 'Mar 5', amount: '₹1,200' },
    ];
    const statusColor = { 'In Progress': 'bg-blue-100 text-blue-700', 'Pending': 'bg-amber-100 text-amber-700', 'Completed': 'bg-green-100 text-green-700' };
    const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">My Orders</h2>
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-amber-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {f}
                    </button>
                ))}
            </div>
            {/* Order Cards */}
            <div className="space-y-3">
                {filtered.map((o) => (
                    <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-sm font-bold text-gray-800">{o.customer}</p>
                                <p className="text-xs text-gray-400">{o.id} · {o.item}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor[o.status]}`}>{o.status}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                            <p className="text-xs text-gray-400">📅 Due: {o.due}</p>
                            <p className="text-sm font-bold text-amber-600">{o.amount}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const ManagementTab = () => {
    const sections = [
        { icon: '📐', title: 'Measurement Templates', desc: 'Save standard size templates for quick access', badge: null },
        { icon: '🖼️', title: 'Portfolio', desc: 'Showcase your best work to attract customers', badge: '5 items' },
        { icon: '📆', title: 'Availability', desc: 'Set your working hours and days off', badge: 'Open' },
        { icon: '💬', title: 'Customer Messages', desc: 'Manage inquiries and communicate with clients', badge: '2 new' },
        { icon: '🏷️', title: 'Pricing List', desc: 'Set prices for your services', badge: null },
        { icon: '⭐', title: 'Reviews & Ratings', desc: 'See what your customers are saying', badge: '4.8 avg' },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Management</h2>
            <div className="space-y-3">
                {sections.map((s) => (
                    <motion.button key={s.title} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                        className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 text-left">
                        <div className="bg-amber-50 rounded-xl p-3 text-2xl flex-shrink-0">{s.icon}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{s.desc}</p>
                        </div>
                        {s.badge && (
                            <span className="flex-shrink-0 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{s.badge}</span>
                        )}
                        <span className="text-gray-300 flex-shrink-0">›</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

const ProfileTab = ({ user, onLogout }) => {
    const [profileImg, setProfileImg] = useState(null);
    const [profileImgFile, setProfileImgFile] = useState(null);
    const [saved, setSaved] = useState(false);
    const [address, setAddress] = useState({ street: '', city: '', state: '', pin: '' });
    const [contact, setContact] = useState({ phone: '', whatsapp: '', instagram: '' });
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '' });
    const [gallery, setGallery] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [detecting, setDetecting] = useState(false);
    const [locationError, setLocationError] = useState('');

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }

        setDetecting(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    
                    if (data && data.address) {
                        const addr = data.address;
                        setAddress(prev => ({
                            ...prev,
                            street: addr.road || addr.suburb || addr.neighbourhood || '',
                            city: addr.city || addr.town || addr.village || addr.county || '',
                            state: addr.state || '',
                            pin: addr.postcode || ''
                        }));
                    } else {
                        setLocationError('Could not decode location data.');
                    }
                } catch (err) {
                    setLocationError('Error fetching location details from coordinates.');
                } finally {
                    setDetecting(false);
                }
            },
            (err) => {
                setLocationError('Failed to detect location. Please allow location access or map it manually.');
                setDetecting(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // ── Load saved profile from DB on mount ──────────────────────────────────
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetch(`${API_URL}/api/tailor/profile`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.profile) {
                    const p = data.profile;
                    if (p.profile_img) {
                        setProfileImg(p.profile_img.startsWith('/uploads') ? `${API_URL}${p.profile_img}` : p.profile_img);
                    }
                    setAddress({ street: p.street || '', city: p.city || '', state: p.state || '', pin: p.pin || '' });
                    setContact({ phone: p.phone || '', whatsapp: p.whatsapp || '', instagram: p.instagram || '' });
                    if (p.products && p.products.length > 0) {
                        setProducts(p.products.map((item, i) => ({ id: i + 1, name: item.name, price: item.price })));
                    }
                }
            })
            .catch(() => {})
            .finally(() => setLoadingProfile(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImgFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGallery = (e) => {
        const files = Array.from(e.target.files);
        const urls = files.map(f => URL.createObjectURL(f));
        setGallery(prev => [...prev, ...urls].slice(0, 9));
    };

    const addProduct = () => {
        if (!newProduct.name.trim() || !newProduct.price.trim()) return;
        setProducts(prev => [...prev, { id: Date.now(), ...newProduct }]);
        setNewProduct({ name: '', price: '' });
    };

    const removeProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        try {
            let finalImgUrl = profileImg || null;

            if (profileImgFile) {
                const formData = new FormData();
                formData.append('profile_img', profileImgFile);

                const uploadRes = await fetch(`${API_URL}/api/upload/profile-image`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) {
                    setSaveError(uploadData.message || 'Image upload failed');
                    setSaving(false);
                    return;
                }
                finalImgUrl = uploadData.imageUrl;
            }

            const res = await fetch(`${API_URL}/api/tailor/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    phone: contact.phone,
                    whatsapp: contact.whatsapp,
                    instagram: contact.instagram,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pin: address.pin,
                    products: products.map(({ name, price }) => ({ name, price })),
                    // gallery blob URLs are local-preview only; skip for now
                    gallery: [],
                    profile_img: finalImgUrl,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setSaveError(data.message || 'Save failed'); return; }
            setSaved(true);
            setProfileImgFile(null);
            // Safely update the displayed image URL
            if (finalImgUrl) {
                setProfileImg(
                    finalImgUrl.startsWith('/uploads')
                        ? `${API_URL}${finalImgUrl}`
                        : finalImgUrl
                );
            }
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Profile save error:', err);
            setSaveError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition bg-gray-50";
    const sectionHead = (icon, title) => (
        <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{icon}</span>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
        </div>
    );

    return (
        <div className="space-y-5 pb-4">

            {/* ── Profile Header ── */}
            <div className="bg-gradient-to-br from-amber-600 to-orange-500 rounded-2xl p-6 text-white text-center relative">
                <label htmlFor="profile-img-upload" className="cursor-pointer group inline-block">
                    <div className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center relative">
                        {profileImg
                            ? <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                            : <span className="text-4xl">🧵</span>}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <span className="text-white text-xs font-bold">Change</span>
                        </div>
                    </div>
                    <input id="profile-img-upload" type="file" accept="image/*" className="hidden" onChange={handleImgChange} />
                </label>
                <p className="text-xs text-amber-200 mt-1">Tap photo to change</p>
                <h2 className="text-xl font-bold mt-2">{user?.full_name}</h2>
                <p className="text-amber-200 text-sm">{user?.email}</p>
                <span className="mt-2 inline-block bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">Professional Tailor</span>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-3">
                {[{ label: 'Orders', val: '31' }, { label: 'Clients', val: '18' }, { label: 'Rating', val: '4.8' }].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                        <p className="text-xl font-bold text-amber-600">{s.val}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Address ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Address</h3>
                    </div>
                    <button 
                        onClick={handleDetectLocation}
                        disabled={detecting}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-70 border border-amber-100"
                    >
                        {detecting ? (
                            <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        ) : '🎯'} 
                        {detecting ? 'Detecting...' : 'Auto Detect'}
                    </button>
                </div>
                {locationError && (
                    <div className="mb-3 text-red-600 text-xs bg-red-50 p-2 rounded-lg border border-red-100">
                        {locationError}
                    </div>
                )}
                <div className="space-y-3">
                    <input className={inputCls} placeholder="Street / Area" value={address.street}
                        onChange={e => setAddress({ ...address, street: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                        <input className={inputCls} placeholder="City" value={address.city}
                            onChange={e => setAddress({ ...address, city: e.target.value })} />
                        <input className={inputCls} placeholder="State" value={address.state}
                            onChange={e => setAddress({ ...address, state: e.target.value })} />
                    </div>
                    <input className={inputCls} placeholder="PIN Code" value={address.pin} maxLength={6}
                        onChange={e => setAddress({ ...address, pin: e.target.value })} />
                </div>
            </div>

            {/* ── Contact ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {sectionHead('📞', 'Contact')}
                <div className="space-y-3">
                    <input className={inputCls} placeholder="Phone Number" value={contact.phone} maxLength={10}
                        onChange={e => setContact({ ...contact, phone: e.target.value })} />
                    <input className={inputCls} placeholder="WhatsApp Number" value={contact.whatsapp} maxLength={10}
                        onChange={e => setContact({ ...contact, whatsapp: e.target.value })} />
                    <input className={inputCls} placeholder="Instagram Handle (optional)" value={contact.instagram}
                        onChange={e => setContact({ ...contact, instagram: e.target.value })} />
                </div>
            </div>

            {/* ── Products & Pricing ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {sectionHead('🏷️', 'Products & Pricing')}
                <div className="space-y-2 mb-3">
                    {products.map(p => (
                        <motion.div key={p.id} layout
                            className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                            <span className="flex-1 text-sm font-medium text-gray-800">{p.name}</span>
                            <span className="text-sm font-bold text-amber-600">₹{p.price}</span>
                            <button onClick={() => removeProduct(p.id)}
                                className="text-red-400 hover:text-red-600 text-lg leading-none ml-1">×</button>
                        </motion.div>
                    ))}
                </div>
                {/* Add new product row */}
                <div className="flex gap-2">
                    <input className={`${inputCls} flex-[2]`} placeholder="Service name" value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                    <input className={`${inputCls} flex-1`} placeholder="₹ Price" value={newProduct.price}
                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                    <button onClick={addProduct}
                        className="bg-amber-600 text-white px-4 rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors flex-shrink-0">
                        + Add
                    </button>
                </div>
            </div>

            {/* ── Gallery ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {sectionHead('🖼️', 'Gallery')}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {gallery.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                            <img src={url} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                            <button onClick={() => setGallery(prev => prev.filter((_, j) => j !== i))}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                ×
                            </button>
                        </div>
                    ))}
                    {gallery.length < 9 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-amber-300 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50 transition-colors">
                            <span className="text-2xl text-amber-400">+</span>
                            <span className="text-xs text-amber-500 mt-1">Add Photo</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleGallery} />
                        </label>
                    )}
                </div>
                <p className="text-xs text-gray-400">Up to 9 photos · Tap × to remove</p>
            </div>

            {/* ── Save Button ── */}
            {saveError && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">{saveError}</p>
            )}
            <motion.button onClick={handleSave} disabled={saving || saved}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-amber-600 text-white font-bold text-sm py-4 rounded-2xl hover:bg-amber-700 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saved ? '✅ Profile Saved!' : saving ? 'Saving...' : '💾 Save Profile'}
            </motion.button>

            {/* ── Logout ── */}
            <button onClick={onLogout}
                className="w-full bg-red-50 border border-red-100 text-red-600 font-semibold text-sm py-4 rounded-2xl hover:bg-red-100 transition-colors">
                🚪 Logout
            </button>
        </div>
    );
};

/* ─── Bottom Navigation ───────────────────────────────────────── */
const NAV_TABS = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'management', label: 'Manage', icon: '⚙️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
];

/* ─── Main Component ─────────────────────────────────────────── */
const TailorDashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const renderTab = () => {
        const props = { user, onLogout: handleLogout };
        switch (activeTab) {
            case 'home': return <HomeTab {...props} />;
            case 'orders': return <OrdersTab />;
            case 'management': return <ManagementTab />;
            case 'profile': return <ProfileTab {...props} />;
            default: return <HomeTab {...props} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col w-full">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xl">✂️</span>
                    <span className="text-lg font-bold text-gray-800">TailorHub</span>
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full ml-1">Tailor</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <span className="text-xl">🔔</span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto pb-24">
                <div className="w-full px-6 py-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderTab()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
                <div className="w-full flex">
                    {NAV_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex-1 flex flex-col items-center justify-center py-3 relative transition-colors"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="tab-indicator"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-600 rounded-full"
                                    />
                                )}
                                <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                                    {tab.icon}
                                </span>
                                <span className={`text-xs mt-1 font-medium transition-colors ${isActive ? 'text-amber-600' : 'text-gray-400'}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default TailorDashboardPage;
