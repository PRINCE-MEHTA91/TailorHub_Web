import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import IndexPage from './IndexPage';

const FeedbackModal = ({ order, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!order) return null;

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            const API_URL = process.env.REACT_APP_API_URL;
            const res = await fetch(`${API_URL}/api/add-feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    orderId: order.id,
                    customerId: order.customer_id,
                    tailorId: order.tailor_id,
                    rating,
                    message
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Failed to submit feedback');
                return;
            }
            onSuccess();
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-gray-800">Share Feedback</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
                </div>

                <div className="mb-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">How was your experience with</p>
                    <p className="text-lg font-bold text-indigo-600">{order.tailor_name}</p>
                    <p className="text-xs text-gray-400">for {order.product_name}</p>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-3xl transition-all duration-200 hover:scale-125 active:scale-95 ${star <= rating ? 'grayscale-0' : 'grayscale opacity-30 hover:grayscale-0 hover:opacity-100'}`}
                        >
                            ⭐
                        </button>
                    ))}
                </div>

                <textarea
                    placeholder="Write a short message (optional)..."
                    className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px] mb-4 bg-gray-50"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                {error && <p className="text-red-500 text-xs text-center mb-4 bg-red-50 py-2 rounded-xl border border-red-100">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-[2] bg-indigo-600 text-white font-bold text-sm py-3.5 px-8 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all"
                    >
                        {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        Submit
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CustomerProfileTab = ({ user, onLogout }) => {
    const [contact, setContact] = useState({ phone: '', whatsapp: '' });
    const [address, setAddress] = useState({ street: '', city: '', state: '', pin: '' });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileImg, setProfileImg] = useState(null);
    const [imgUploading, setImgUploading] = useState(false);
    const [imgError, setImgError] = useState('');
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        const API_URL = process.env.REACT_APP_API_URL;
        fetch(`${API_URL}/api/customer/profile`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.profile) {
                    const p = data.profile;
                    setContact({ phone: p.phone || '', whatsapp: p.whatsapp || '' });
                    setAddress({ street: p.street || '', city: p.city || '', state: p.state || '', pin: p.pin || '' });
                    if (p.profile_img) {
                        setProfileImg(
                            p.profile_img.startsWith('http')
                                ? p.profile_img
                                : `${API_URL}${p.profile_img}`
                        );
                    }
                }
            })
            .catch(() => {})
            .finally(() => setLoadingProfile(false));
    }, []);

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Optimistic preview
        const localUrl = URL.createObjectURL(file);
        setProfileImg(localUrl);
        setImgError('');
        setImgUploading(true);
        try {
            const API_URL = process.env.REACT_APP_API_URL;
            const formData = new FormData();
            formData.append('profile_img', file);
            const res = await fetch(`${API_URL}/api/customer/upload/profile-image`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            let data = {};
            try { data = await res.json(); } catch { /* ignore parse errors */ }
            if (!res.ok) {
                setImgError(data.message || `Upload failed (${res.status})`);
                // Keep the optimistic preview — don't clear it on soft errors
                return;
            }
            // Replace optimistic URL with the permanent server URL
            const serverUrl = (data.imageUrl || '').startsWith('http')
                ? data.imageUrl
                : `${API_URL}${data.imageUrl}`;
            setProfileImg(serverUrl);
            URL.revokeObjectURL(localUrl);
        } catch (err) {
            console.error('Profile image upload error:', err);
            setImgError('Could not reach server. Check your connection.');
            // Keep the optimistic preview visible
        } finally {
            setImgUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        try {
            const API_URL = process.env.REACT_APP_API_URL;
            const res = await fetch(`${API_URL}/api/customer/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    phone: contact.phone,
                    whatsapp: contact.whatsapp,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pin: address.pin,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setSaveError(data.message || 'Save failed'); return; }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch {
            setSaveError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50";
    const sectionHead = (icon, title) => (
        <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{icon}</span>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
        </div>
    );

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <div className="space-y-5 pb-4">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
            />
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center">
                {/* Tappable avatar */}
                <div
                    className="relative w-24 h-24 rounded-full mx-auto mb-3 cursor-pointer group"
                    onClick={() => !imgUploading && fileInputRef.current?.click()}
                    title="Tap to change profile photo"
                >
                    {profileImg ? (
                        <img
                            src={profileImg}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-white/40 shadow-lg"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">{initials}</span>
                        </div>
                    )}
                    {/* Overlay on hover/upload */}
                    <div className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
                        imgUploading
                            ? 'bg-black/50'
                            : 'bg-black/0 group-hover:bg-black/40'
                    }`}>
                        {imgUploading ? (
                            <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity">📷</span>
                        )}
                    </div>
                </div>
                <h2 className="text-xl font-bold">{user?.full_name || 'Customer'}</h2>
                <p className="text-indigo-200 text-sm mt-0.5">{user?.email}</p>
                <span className="mt-2 inline-block bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">Customer</span>
                {imgError && (
                    <p className="mt-2 text-red-200 text-xs bg-red-500/20 rounded-xl px-3 py-1">{imgError}</p>
                )}
                <p className="mt-1 text-white/60 text-[10px]">Tap photo to change</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {sectionHead('👤', 'Account Info')}
                <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Full Name</span>
                        <span className="text-sm font-semibold text-gray-800">{user?.full_name || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="text-sm font-semibold text-gray-800">{user?.email || '—'}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {sectionHead('📞', 'Contact')}
                {loadingProfile ? (
                    <div className="flex justify-center py-4">
                        <span className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <PhoneInput
                            id="customer-phone"
                            value={contact.phone}
                            onChange={val => setContact({ ...contact, phone: val })}
                            placeholder="Enter phone number"
                            icon="📱"
                            iconBg="bg-indigo-50"
                            inputStyle="customer"
                        />
                        <PhoneInput
                            id="customer-whatsapp"
                            value={contact.whatsapp}
                            onChange={val => setContact({ ...contact, whatsapp: val })}
                            placeholder="WhatsApp number"
                            icon="💬"
                            iconBg="bg-green-50"
                            inputStyle="customer"
                        />
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {sectionHead('📍', 'Delivery Address')}
                {loadingProfile ? (
                    <div className="flex justify-center py-4">
                        <span className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
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
                )}
            </div>

            {saveError && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">{saveError}</p>
            )}
            <motion.button onClick={handleSave} disabled={saving || saved || loadingProfile}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-indigo-600 text-white font-bold text-sm py-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saved ? '✅ Profile Saved!' : saving ? 'Saving...' : '💾 Save Profile'}
            </motion.button>

            <button onClick={onLogout}
                className="w-full bg-red-50 border border-red-100 text-red-600 font-semibold text-sm py-4 rounded-2xl hover:bg-red-100 transition-colors">
                🚪 Logout
            </button>
        </div>
    );
};

const OrdersTab = () => {
    const API_URL_O = process.env.REACT_APP_API_URL;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyModal, setHistoryModal] = useState(null);
    const [history, setHistory] = useState([]);
    const [feedbackModalOrder, setFeedbackModalOrder] = useState(null);

    const fetchOrders = () => {
        setLoading(true);
        fetch(`${API_URL_O}/api/orders/customer`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.orders) setOrders(data.orders); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrders();
    }, [API_URL_O]);

    const handleViewHistory = async (orderId) => {
        setHistoryModal(orderId);
        setHistory([]);
        try {
            const res = await fetch(`${API_URL_O}/api/orders/${orderId}/history`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setHistory(data.history);
            }
        } catch {}
    };

    const sc = {
        'Order Placed': 'bg-stone-100 text-stone-700',
        'Cutting': 'bg-blue-100 text-blue-700',
        'Stitching': 'bg-indigo-100 text-indigo-700',
        'Trial Ready': 'bg-amber-100 text-amber-700',
        'Completed': 'bg-green-100 text-green-700',
        'Delivered': 'bg-emerald-100 text-emerald-700'
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">My Orders</h2>
            
            {loading && <p className="text-center text-gray-400 text-sm">Loading orders...</p>}
            
            {!loading && orders.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-3 text-center">
                    <span className="text-4xl">📦</span>
                    <p className="text-gray-600 font-semibold">No orders yet</p>
                    <p className="text-gray-400 text-sm">Browse tailors and place your first order!</p>
                </div>
            )}

            {orders.map(o => (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-bold text-gray-800">{o.product_name}</p>
                            <p className="text-xs text-gray-500">Tailor: <span className="font-semibold">{o.tailor_name} {o.shop_name ? `(${o.shop_name})` : ''}</span></p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Order ID: #{o.id}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${sc[o.current_status]||sc['Completed']}`}>
                            {o.current_status}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-y border-gray-50 my-2">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
                            {Number(o.discount_amount) > 0 ? (
                                <div>
                                    <p className="text-xs text-gray-400 line-through">₹{Number(o.total_amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                    <p className="text-sm font-black text-gray-800">
                                        ₹{Number(o.final_amount || o.total_amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                                        <span className="text-[10px] font-bold text-green-500 ml-1">(-₹{Number(o.discount_amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})})</span>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm font-black text-gray-800">₹{Number(o.total_amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            )}
                        </div>
                        <div className="text-center flex flex-col justify-end">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Advance</p>
                            <p className="text-sm font-bold text-gray-600">₹{Number(o.advance_payment).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                        <div className="text-right flex flex-col justify-end">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Remaining</p>
                            <p className="text-sm font-black text-indigo-600">₹{Number(o.remaining_amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 gap-2">
                        <p className="text-xs text-gray-500">
                            Delivery: <span className="font-bold text-gray-800">{o.delivery_date ? new Date(o.delivery_date).toLocaleDateString() : 'TBD'}</span>
                        </p>
                        <div className="flex gap-2">
                            {(o.current_status === 'Delivered' || o.current_status === 'Completed') && o.feedback_submitted === 0 && (
                                <button
                                    onClick={() => setFeedbackModalOrder(o)}
                                    className="text-white text-xs font-bold bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition shadow-sm"
                                >
                                    ⭐ Give Feedback
                                </button>
                            )}
                            <button onClick={() => handleViewHistory(o.id)} className="text-indigo-600 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition">
                                Track Status
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <AnimatePresence>
                {historyModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end">
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto w-full md:max-w-md md:m-auto md:rounded-3xl shadow-xl">
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 pt-5 pb-3 flex justify-between items-center z-10 rounded-t-3xl md:rounded-t-3xl">
                                <h3 className="font-black text-lg">Order Tracking</h3>
                                <button onClick={() => setHistoryModal(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition font-bold">&times;</button>
                            </div>
                            <div className="p-5">
                                {(() => {
                                    const selectedOrder = orders.find(o => o.id === historyModal);
                                    const TRACKING_STEPS = ['Order Placed', 'Cutting', 'Stitching', 'Trial Ready', 'Completed', 'Delivered'];
                                    const currentStatusIdx = selectedOrder ? TRACKING_STEPS.indexOf(selectedOrder.current_status) : -1;

                                    return (
                                        <div className="relative space-y-0 pl-2">
                                            {TRACKING_STEPS.map((stepName, i) => {
                                                const stepHistories = history.filter(h => h.status === stepName);
                                                const mainHistory = stepHistories[stepHistories.length - 1]; // latest occurrence
                                                
                                                const isCompleted = currentStatusIdx > i;
                                                const isCurrent = currentStatusIdx === i;
                                                const isPending = currentStatusIdx < i;

                                                return (
                                                    <div key={stepName} className="relative z-10 flex gap-4 items-start pb-8">
                                                        <div className="relative flex flex-col items-center h-full">
                                                            <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 z-10 mt-1 transition-colors duration-300 shadow-sm
                                                                ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-indigo-500 ring-4 ring-indigo-100' : 'bg-gray-200'}
                                                            `} />
                                                            {i < TRACKING_STEPS.length - 1 && (
                                                                <div className={`w-0.5 absolute top-5 bottom-[-24px] ${isCompleted ? 'bg-green-500' : 'bg-gray-100'} transition-all duration-300`} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 pb-1">
                                                            <p className={`text-sm font-black ${isPending ? 'text-gray-400' : 'text-gray-800'}`}>{stepName}</p>
                                                            
                                                            {mainHistory ? (
                                                                <>
                                                                    <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">
                                                                        {new Date(mainHistory.updated_at).toLocaleString('en-IN')}
                                                                    </p>
                                                                    {mainHistory.note && (
                                                                        <div className="mt-2 text-xs text-gray-600 bg-gray-50/80 border border-gray-100 rounded-xl p-3 shadow-sm inline-block">
                                                                            {mainHistory.note}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : isPending ? (
                                                                <p className="text-[10px] text-gray-400 mt-0.5 italic">Pending</p>
                                                            ) : (
                                                                <p className="text-[10px] text-green-600 mt-0.5 font-bold">Successfully Completed ✓</p>
                                                            )}
                                                            
                                                            {stepHistories.length > 1 && (
                                                                <div className="mt-3 pl-3 border-l-2 border-gray-100 space-y-1.5">
                                                                    {stepHistories.slice(0, -1).map(sh => sh.note && (
                                                                        <p key={sh.id} className="text-[10px] text-gray-500 flex items-center gap-1">
                                                                            <span>↳</span> <span>{sh.note} ({new Date(sh.updated_at).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})})</span>
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {feedbackModalOrder && (
                    <FeedbackModal
                        order={feedbackModalOrder}
                        onClose={() => setFeedbackModalOrder(null)}
                        onSuccess={() => {
                            setFeedbackModalOrder(null);
                            fetchOrders();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const API_URL = process.env.REACT_APP_API_URL;
const catEmojiMap = {
    Bridal: '👰', Suits: '🤵', Kurta: '🧥', Blouses: '✂️', 'Kids Wear': '🧒', Alterations: '🔧',
};

const CategoryResults = ({ category, onBack }) => {
    const navigate = useNavigate();
    const [allTailors, setAllTailors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/tailors`)
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.tailors) setAllTailors(data.tailors); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const q = category.toLowerCase();
    const results = allTailors.filter(t =>
        (t.products || []).some(p => p.name?.toLowerCase().includes(q)) ||
        (t.specialities || []).some(s => s?.toLowerCase().includes(q)) ||
        t.full_name?.toLowerCase().includes(q) ||
        t.tagline?.toLowerCase().includes(q)
    );

    const gradients = ['tc-av-rose', 'tc-av-indigo', 'tc-av-amber'];
    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const resolveImg = (path) => { if (!path) return null; return path.startsWith('http') ? path : `${API_URL}${path}`; };
    const getTodayTiming = (timings) => {
        if (!timings) return null;
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        return timings[days[new Date().getDay()]] || null;
    };

    return (
        <div className="sr-container">
            <div className="sr-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6366f1', fontWeight: 600, fontSize: '0.875rem', padding: 0,
                    }}
                >
                    ← Back to Home
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div>
                        <h2 className="sr-title">
                            {catEmojiMap[category] || '✂️'} {category}
                        </h2>
                        {!loading && (
                            <p className="sr-subtitle">
                                {results.length > 0
                                    ? `${results.length} shop${results.length !== 1 ? 's' : ''} offering ${category} services`
                                    : 'No shops found for this category yet'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="sr-loading">
                    <span className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <p>Finding tailors…</p>
                </div>
            )}

            {!loading && results.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sr-empty">
                    <span className="sr-empty-icon">{catEmojiMap[category] || '✂️'}</span>
                    <p className="sr-empty-title">No shops available yet</p>
                    <p className="sr-empty-sub">
                        No tailor shops currently offer <strong>{category}</strong> services.<br />Check back soon!
                    </p>
                </motion.div>
            )}

            <AnimatePresence>
                <div className="sr-list">
                    {results.map((t, i) => {
                        const id = t.id || t.user_id;
                        const initials = getInitials(t.full_name);
                        const gradient = gradients[i % gradients.length];
                        const city = t.city || '';
                        const state = t.state || '';
                        const area = [city, state].filter(Boolean).join(', ') || '—';
                        const products = t.products || [];
                        const startingPrice = products.length > 0
                            ? `From ₹${Math.min(...products.map(p => Number(p.price) || 0))}`
                            : null;
                        const profileImgUrl = resolveImg(t.profile_img);
                        const todayTiming = getTodayTiming(t.timings);
                        const isOpen = todayTiming && !todayTiming.closed;
                        const specialities = Array.isArray(t.specialities) ? t.specialities : [];
                        const matchedProducts = products.filter(p =>
                            p.name?.toLowerCase().includes(q)
                        );

                        return (
                            <motion.div
                                key={id || i}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ delay: i * 0.06, duration: 0.3 }}
                                className="sr-card"
                                onClick={() => navigate(`/tailor-profile/${id}`)}
                            >
                                <div className="sr-card-top">
                                    <div className="tc-avatar-wrap">
                                        {profileImgUrl ? (
                                            <img src={profileImgUrl} alt={t.full_name} className="tc-avatar-img" />
                                        ) : (
                                            <div className={`sr-avatar ${gradient}`}>{initials}</div>
                                        )}
                                        {todayTiming && (
                                            <span className={`tc-availability-dot ${isOpen ? 'tc-dot-open' : 'tc-dot-closed'}`} />
                                        )}
                                    </div>
                                    <div className="sr-info">
                                        <div className="sr-name-row">
                                            <span className="sr-name">{t.full_name}</span>
                                            <span className="sr-area">📍 {area}</span>
                                        </div>
                                        {t.tagline && (
                                            <p className="tc-tagline" style={{ marginBottom: '0.25rem' }}>"{t.tagline}"</p>
                                        )}
                                        {matchedProducts.length > 0 && (
                                            <div className="sr-matched-products">
                                                {matchedProducts.slice(0, 3).map((p, pi) => (
                                                    <span key={pi} className="sr-product-chip">
                                                        ✂️ {p.name}{p.price ? ` · ₹${p.price}` : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {matchedProducts.length === 0 && products.length > 0 && (
                                            <p className="sr-specialty">
                                                {products.slice(0, 2).map(p => p.name).join(' · ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {(t.experience || todayTiming || specialities.length > 0) && (
                                    <div className="tc-pills-row" style={{ marginTop: '0.6rem' }}>
                                        {t.experience && <span className="tc-pill tc-pill-exp">🏆 {t.experience}</span>}
                                        {todayTiming && (
                                            <span className={`tc-pill ${isOpen ? 'tc-pill-open' : 'tc-pill-closed'}`}>
                                                🕐 {isOpen ? `${todayTiming.open} – ${todayTiming.close}` : 'Closed Today'}
                                            </span>
                                        )}
                                        {specialities.slice(0, 2).map(s => (
                                            <span key={s} className="tc-pill tc-pill-spec">{s}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="sr-bottom">
                                    {startingPrice && <span className="sr-price">{startingPrice}</span>}
                                    <button
                                        className="sr-btn"
                                        onClick={e => { e.stopPropagation(); navigate(`/tailor-profile/${id}`); }}
                                    >
                                        View Profile →
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </AnimatePresence>
        </div>
    );
};

const NAV_TABS = [
    { id: 'home',    label: 'Home',    icon: '🏠' },
    { id: 'tailors', label: 'Tailors', icon: '✂️' },
    { id: 'orders',  label: 'Orders',  icon: '📦' },
    { id: 'profile', label: 'Profile', icon: '👤' },
];

const CustomerDashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
            window.history.replaceState({}, '');
        }
    }, [location.state]);

    const handleCategoryClick = (categoryName) => {
        setSelectedCategory(categoryName);
        setSearchQuery('');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (tabId !== 'home') {
            setSearchQuery('');
            setSelectedCategory(null);
        }
    };

    const renderTab = () => {
        switch (activeTab) {
            case 'home': return (
                <div>
                    <SearchBar
                        value={searchQuery}
                        onChange={(q) => { setSearchQuery(q); setSelectedCategory(null); }}
                    />
                    {searchQuery.trim().length > 0 ? (
                        <SearchResults
                            query={searchQuery}
                            onClear={() => setSearchQuery('')}
                        />
                    ) : selectedCategory ? (
                        <CategoryResults
                            category={selectedCategory}
                            onBack={() => setSelectedCategory(null)}
                        />
                    ) : (
                        <IndexPage onCategoryClick={handleCategoryClick} />
                    )}
                </div>
            );
            case 'tailors': { navigate('/browse-deals'); return null; }
            case 'orders': return <OrdersTab />;
            case 'profile': return <CustomerProfileTab user={user} onLogout={handleLogout} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col w-full">
            <Header />

            <main className="flex-1 overflow-y-auto pb-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'home' ? renderTab() : (
                            <div className="px-4 py-5">{renderTab()}</div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
                <div className="w-full flex">
                    {NAV_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className="flex-1 flex flex-col items-center justify-center py-3 relative transition-colors"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="customer-tab-indicator"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full"
                                    />
                                )}
                                <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                                    {tab.icon}
                                </span>
                                <span className={`text-xs mt-1 font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
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

export default CustomerDashboardPage;
