import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import IndexPage from './IndexPage';

// ── Professional Invoice Modal ──────────────────────────────────────────────
const InvoiceModal = ({ order, onClose }) => {
    const printRef = useRef(null);
    if (!order) return null;

    const invoiceNumber = `TH-${String(order.id).padStart(5, '0')}`;
    const invoiceDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const deliveryDate = order.delivery_date
        ? new Date(order.delivery_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'N/A';

    const totalAmt   = Number(order.total_amount   || 0);
    const discountAmt= Number(order.discount_amount || 0);
    const finalAmt   = Number(order.final_amount   || totalAmt);
    const advanceAmt = Number(order.advance_payment || 0);
    const remainAmt  = Number(order.remaining_amount || (finalAmt - advanceAmt));
    const hasDiscount = discountAmt > 0;

    const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const handlePrint = () => {
        const printContent = printRef.current?.innerHTML;
        const w = window.open('', '_blank', 'width=800,height=900');
        w.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoiceNumber} – TailorHub</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .invoice-wrap { max-width: 720px; margin: 0 auto; padding: 40px 36px; }
    .header-band { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 16px; padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .brand { color: #fff; }
    .brand-name { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
    .brand-tag  { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 2px; }
    .inv-meta { text-align: right; color: #fff; }
    .inv-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.65); }
    .inv-number{ font-size: 20px; font-weight: 800; }
    .inv-date  { font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 2px; }
    .status-badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 10px; border-radius: 999px; margin-bottom: 28px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 12px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .info-card { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px 18px; }
    .info-card .label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .info-card .value { font-size: 14px; font-weight: 700; color: #111827; line-height: 1.4; }
    .info-card .sub   { font-size: 12px; color: #6b7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f9fafb; }
    thead th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; border-bottom: 2px solid #f3f4f6; }
    thead th:last-child { text-align: right; }
    tbody td { padding: 14px 14px; font-size: 13px; border-bottom: 1px solid #f9fafb; }
    tbody td:last-child { text-align: right; font-weight: 700; }
    tbody td .sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .summary-box { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 18px 20px; margin-bottom: 28px; }
    .sum-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
    .sum-row:last-child { border-bottom: none; }
    .sum-row.discount { color: #10b981; }
    .sum-row.total-final { font-size: 16px; font-weight: 900; color: #111827; padding-top: 10px; }
    .sum-row .lbl { font-weight: 500; }
    .sum-row .val { font-weight: 700; }
    .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
    .pay-card { border-radius: 12px; padding: 14px 16px; text-align: center; }
    .pay-card.advance { background: #ede9fe; }
    .pay-card.remain  { background: #fef3c7; }
    .pay-card .p-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 4px; }
    .pay-card.advance .p-label { color: #6d28d9; }
    .pay-card.remain  .p-label { color: #92400e; }
    .pay-card .p-value { font-size: 18px; font-weight: 900; }
    .pay-card.advance .p-value { color: #4c1d95; }
    .pay-card.remain  .p-value  { color: #78350f; }
    .notes-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px; font-size: 12px; color: #78350f; margin-bottom: 24px; }
    .footer { border-top: 2px solid #f3f4f6; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
    .footer-brand { font-size: 13px; font-weight: 800; color: #4f46e5; }
    .footer-note { font-size: 11px; color: #9ca3af; }
    @media print {
      body { padding: 0; }
      .invoice-wrap { padding: 20px; }
    }
  </style>
</head>
<body>
  ${printContent}
</body>
</html>`);
        w.document.close();
        setTimeout(() => { w.focus(); w.print(); }, 600);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center px-3 py-4 overflow-auto"
        >
            <motion.div
                initial={{ scale: 0.94, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 24 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Modal header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <p className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">TailorHub Invoice</p>
                        <p className="text-white font-black text-lg">{invoiceNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                        >
                            🖨️ Print / Download
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-lg leading-none transition"
                        >×</button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 p-5">
                    {/* Hidden printable content */}
                    <div ref={printRef} style={{ display: 'none' }}>
                        <div className="invoice-wrap">
                            <div className="header-band">
                                <div className="brand">
                                    <div className="brand-name">✂️ TailorHub</div>
                                    <div className="brand-tag">Custom Tailoring Platform</div>
                                </div>
                                <div className="inv-meta">
                                    <div className="inv-label">Invoice</div>
                                    <div className="inv-number">{invoiceNumber}</div>
                                    <div className="inv-date">Issued: {invoiceDate}</div>
                                </div>
                            </div>

                            <div className="status-badge">✓ {order.current_status}</div>

                            <div className="info-grid">
                                <div className="info-card">
                                    <div className="label">Billed To</div>
                                    <div className="value">{order.customer_name || 'Customer'}</div>
                                    <div className="sub">Order #{order.id}</div>
                                </div>
                                <div className="info-card">
                                    <div className="label">Tailor / Shop</div>
                                    <div className="value">{order.tailor_name}</div>
                                    {order.shop_name && <div className="sub">{order.shop_name}</div>}
                                </div>
                                <div className="info-card">
                                    <div className="label">Order Date</div>
                                    <div className="value">{invoiceDate}</div>
                                </div>
                                <div className="info-card">
                                    <div className="label">Delivery Date</div>
                                    <div className="value">{deliveryDate}</div>
                                </div>
                            </div>

                            <p className="section-title">Order Details</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>
                                            <div style={{fontWeight:'700'}}>{order.product_name}</div>
                                            {order.notes && <div className="sub">{order.notes}</div>}
                                        </td>
                                        <td>{order.current_status}</td>
                                        <td>{fmt(totalAmt)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <p className="section-title">Summary</p>
                            <div className="summary-box">
                                <div className="sum-row">
                                    <span className="lbl">Subtotal</span>
                                    <span className="val">{fmt(totalAmt)}</span>
                                </div>
                                {hasDiscount && (
                                    <div className="sum-row discount">
                                        <span className="lbl">🎉 Discount Applied</span>
                                        <span className="val">- {fmt(discountAmt)}</span>
                                    </div>
                                )}
                                <div className="sum-row total-final">
                                    <span className="lbl">Total Payable</span>
                                    <span className="val">{fmt(finalAmt)}</span>
                                </div>
                            </div>

                            <p className="section-title">Payment Breakdown</p>
                            <div className="payment-grid">
                                <div className="pay-card advance">
                                    <div className="p-label">Advance Paid</div>
                                    <div className="p-value">{fmt(advanceAmt)}</div>
                                </div>
                                <div className="pay-card remain">
                                    <div className="p-label">Balance Due</div>
                                    <div className="p-value">{fmt(remainAmt)}</div>
                                </div>
                            </div>

                            {order.notes && (
                                <div className="notes-box">📝 Notes: {order.notes}</div>
                            )}

                            <div className="footer">
                                <div className="footer-brand">✂️ TailorHub</div>
                                <div className="footer-note">Thank you for your business!</div>
                            </div>
                        </div>
                    </div>

                    {/* On-screen invoice preview */}
                    <div className="space-y-4">
                        {/* Order info */}
                        <div className="grid grid-cols-2 gap-3">
                            {[['Billed To', order.customer_name || 'Customer', `Order #${order.id}`],
                              ['Tailor / Shop', order.tailor_name, order.shop_name || ''],
                              ['Issue Date', invoiceDate, ''],
                              ['Delivery Date', deliveryDate, ''],
                            ].map(([label, val, sub]) => (
                                <div key={label} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                                    <p className="text-sm font-bold text-gray-800">{val}</p>
                                    {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Item row */}
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="grid grid-cols-[1fr_auto] text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-2.5 border-b border-gray-100">
                                <span>Description</span><span>Amount</span>
                            </div>
                            <div className="grid grid-cols-[1fr_auto] px-4 py-3 items-center">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{order.product_name}</p>
                                    {order.notes && <p className="text-xs text-gray-500 mt-0.5">{order.notes}</p>}
                                </div>
                                <span className="text-sm font-black text-gray-800">{fmt(totalAmt)}</span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-semibold">{fmt(totalAmt)}</span>
                            </div>
                            {hasDiscount && (
                                <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                                    <span>🎉 Discount</span>
                                    <span>- {fmt(discountAmt)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-800">Total Payable</span>
                                <span className="text-xl font-black text-indigo-600">{fmt(finalAmt)}</span>
                            </div>
                        </div>

                        {/* Payment breakdown */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-violet-50 rounded-2xl p-3.5 text-center border border-violet-100">
                                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1">Advance Paid</p>
                                <p className="text-lg font-black text-violet-800">{fmt(advanceAmt)}</p>
                            </div>
                            <div className="bg-amber-50 rounded-2xl p-3.5 text-center border border-amber-100">
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Balance Due</p>
                                <p className="text-lg font-black text-amber-800">{fmt(remainAmt)}</p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl py-3">
                            <span className="text-emerald-600 text-base">✓</span>
                            <span className="text-emerald-700 font-bold text-sm">{order.current_status}</span>
                        </div>

                        {/* Footer note */}
                        <p className="text-center text-xs text-gray-400">Thank you for choosing TailorHub ✂️</p>
                    </div>
                </div>

                {/* Bottom action */}
                <div className="flex-shrink-0 border-t border-gray-100 p-4">
                    <button
                        onClick={handlePrint}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                    >
                        🖨️ Print / Save as PDF
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

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
    const [invoiceOrder, setInvoiceOrder] = useState(null);

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
                        <div className="flex gap-2 flex-wrap">
                            {(o.current_status === 'Delivered' || o.current_status === 'Completed') && o.feedback_submitted === 0 && (
                                <button
                                    onClick={() => setFeedbackModalOrder(o)}
                                    className="text-white text-xs font-bold bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition shadow-sm"
                                >
                                    ⭐ Give Feedback
                                </button>
                            )}
                            {(o.current_status === 'Delivered' || o.current_status === 'Completed') && (
                                <button
                                    onClick={() => setInvoiceOrder(o)}
                                    className="text-indigo-700 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                                >
                                    🧾 Invoice
                                </button>
                            )}
                            <button onClick={() => handleViewHistory(o.id)} className="text-gray-600 text-xs font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
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

            <AnimatePresence>
                {invoiceOrder && (
                    <InvoiceModal
                        order={invoiceOrder}
                        onClose={() => setInvoiceOrder(null)}
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

    // ── Footer ──────────────────────────────────────────────────────────────
    const DashboardFooter = () => {
        const footerNav = navigate; // reuse the existing navigate from parent scope

        const footerLink = (label, path, external = false) => (
            <a
                key={label}
                href={external ? path : undefined}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                onClick={!external ? (e) => { e.preventDefault(); footerNav(path); } : undefined}
                style={{ display: 'block', fontSize: 12, color: '#c9d1d9', textDecoration: 'none', marginBottom: 8, lineHeight: 1.5, cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = '#ffffff'}
                onMouseLeave={e => e.target.style.color = '#c9d1d9'}
            >
                {label}
            </a>
        );

        return (
        <footer style={{ background: '#1a1a2e', color: '#c9d1d9', fontFamily: "'Inter', sans-serif", marginTop: '2rem' }}>
            {/* Main grid */}
            <div style={{
                maxWidth: '100%',
                padding: '36px 24px 24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '28px 20px',
            }}>
                {/* About */}
                <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#8b949e', marginBottom: 12 }}>ABOUT</p>
                    {footerLink('Contact Us', '/help/contact-us')}
                    {footerLink('About TailorHub', '/help/how-it-works')}
                    {footerLink('Press', '/help/contact-us')}
                    {footerLink('Careers', '/help/contact-us')}
                    {footerLink('Corporate Info', '/help/contact-us')}
                </div>

                {/* Quick Links */}
                <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#8b949e', marginBottom: 12 }}>QUICK LINKS</p>
                    {footerLink('Browse Tailors', '/browse-deals')}
                    <a onClick={e => { e.preventDefault(); }} href="#"
                       style={{ display: 'block', fontSize: 12, color: '#c9d1d9', textDecoration: 'none', marginBottom: 8, lineHeight: 1.5, cursor: 'pointer' }}
                       onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#c9d1d9'}>
                        My Orders
                    </a>
                    {footerLink('Active Offers', '/help/payments-pricing')}
                    {footerLink('Book an Appointment', '/browse-deals')}
                    {footerLink('Track Order', '/help/how-it-works')}
                </div>

                {/* Help */}
                <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#8b949e', marginBottom: 12 }}>HELP</p>
                    {footerLink('How It Works', '/help/how-it-works')}
                    {footerLink('Payments & Pricing', '/help/payments-pricing')}
                    {footerLink('Cancellation Policy', '/help/cancellation-policy')}
                    {footerLink('FAQ', '/help/faq')}
                    {footerLink('Dispute Resolution', '/help/dispute-resolution')}
                </div>

                {/* Consumer Policy */}
                <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#8b949e', marginBottom: 12 }}>CONSUMER POLICY</p>
                    {footerLink('Return & Refunds', '/help/return-refunds')}
                    {footerLink('Terms of Use', '/help/terms-of-use')}
                    {footerLink('Privacy Policy', '/help/privacy-policy')}
                    {footerLink('Security', '/help/security')}
                    {footerLink('Sitemap', '/help/how-it-works')}
                </div>

                {/* Connect */}
                <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#8b949e', marginBottom: 12 }}>CONNECT WITH US</p>
                    <p style={{ fontSize: 12, marginBottom: 6, lineHeight: 1.6 }}>✉️ <a href="mailto:support@tailorhub.in" style={{ color: '#6e8efc', textDecoration: 'none' }}>support@tailorhub.in</a></p>
                    <p style={{ fontSize: 12, marginBottom: 6, lineHeight: 1.6 }}>📞 <span style={{ color: '#6e8efc' }}>+91-9999-000-111</span></p>
                    <p style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>🕐 Mon–Sat, 9AM – 7PM IST</p>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#8b949e', marginBottom: 10 }}>SOCIAL</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {[['📘', 'Facebook', 'https://facebook.com'], ['📸', 'Instagram', 'https://instagram.com'], ['▶️', 'YouTube', 'https://youtube.com'], ['🐦', 'Twitter', 'https://twitter.com']].map(([icon, name, href]) => (
                            <a key={name} href={href} target="_blank" rel="noopener noreferrer" title={name}
                               style={{ width: 32, height: 32, borderRadius: '50%', background: '#2d2d44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, textDecoration: 'none', transition: 'background 0.2s' }}
                               onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                               onMouseLeave={e => e.currentTarget.style.background = '#2d2d44'}>
                                {icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #2d2d44', margin: '0 24px' }} />

            {/* Bottom bar */}
            <div style={{ padding: '14px 24px 18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>✂️</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.3px' }}>TailorHub</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
                    {[['Become a Tailor', '/signup'], ['Help Center', '/help/how-it-works'], ['Contact Us', '/help/contact-us'], ['FAQ', '/help/faq']].map(([label, path]) => (
                        <a key={label} href="#" onClick={e => { e.preventDefault(); footerNav(path); }}
                           style={{ fontSize: 11, color: '#8b949e', textDecoration: 'none', cursor: 'pointer' }}
                           onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#8b949e'}>
                            {label}
                        </a>
                    ))}
                </div>
                <p style={{ fontSize: 11, color: '#8b949e', margin: 0 }}>© 2024–2026 TailorHub™ · All rights reserved</p>
            </div>
        </footer>
        );
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
                {activeTab === 'home' && <DashboardFooter />}
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
