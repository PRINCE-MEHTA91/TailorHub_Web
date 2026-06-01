import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';

const API_URL = process.env.REACT_APP_API_URL || 'https://tailorhub-web.onrender.com';

const NAV_TABS = [
  { id: 'home',     icon: '🏠', label: 'Home'     },
  { id: 'orders',   icon: '📋', label: 'Orders'   },
  { id: 'chat',     icon: '💬', label: 'Chat'     },
  { id: 'feedback', icon: '⭐', label: 'Feedback' },
  { id: 'offers',   icon: '🔥', label: 'Offers'   },
  { id: 'manage',   icon: '⚙️', label: 'Manage'   },
  { id: 'profile',  icon: '👤', label: 'Profile'  },
];

const STATUS_COLORS = {
  'Order Placed': 'bg-stone-100 text-stone-600',
  'Cutting':      'bg-blue-100 text-blue-700',
  'Stitching':    'bg-indigo-100 text-indigo-700',
  'Trial Ready':  'bg-amber-100 text-amber-700',
  'Completed':    'bg-green-100 text-green-700',
  'Delivered':    'bg-emerald-100 text-emerald-700',
};

const fmt = (n) => {
  if (!n && n !== 0) return '₹0';
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

const fmtShort = (n) => {
  if (!n) return '₹0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}k`;
  return fmt(n);
};

function StatSkeleton() {
  return (
    <div className="animate-pulse space-y-1">
      <div className="h-6 w-20 bg-white/30 rounded-lg" />
      <div className="h-3 w-14 bg-white/20 rounded" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-stone-100 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-32 bg-stone-100 rounded-full" />
          <div className="h-2.5 w-24 bg-stone-100 rounded-full" />
        </div>
        <div className="space-y-1.5 items-end flex flex-col">
          <div className="h-3.5 w-16 bg-stone-100 rounded-full" />
          <div className="h-2.5 w-10 bg-stone-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function EarningsPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch(`${API_URL}/api/orders/tailor`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : { orders: [] })
      .then(d => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Split: completed/delivered = "Received", others = "Pending"
  const received = orders.filter(o => ['Completed', 'Delivered'].includes(o.current_status));
  const pending  = orders.filter(o => !['Completed', 'Delivered'].includes(o.current_status));

  const totalReceived = received.reduce((s, o) => s + (parseFloat(o.advance_payment) || 0), 0);
  const totalPending  = pending.reduce((s, o) => s + (parseFloat(o.remaining_amount) || 0), 0);
  const totalEarnings = orders.reduce((s, o) => s + (parseFloat(o.final_amount || o.total_amount) || 0), 0);
  const avgOrder = orders.length > 0 ? totalEarnings / orders.length : 0;

  const filtered =
    filter === 'Received' ? received :
    filter === 'Pending'  ? pending  : orders;

  const handleNav = (tabId) => {
    if (tabId === 'chat') { navigate('/chat'); return; }
    navigate('/tailor/dashboard', { state: { tab: tabId } });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />

      <div
        className="flex-1 overflow-y-auto"
        style={{ marginTop: '64px', paddingBottom: '72px' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

          {/* ── Hero Banner ── */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-700 p-6 relative overflow-hidden shadow-lg">
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/[0.07]" />
            <p className="text-emerald-100 text-xs font-semibold relative z-10 uppercase tracking-widest">Total Earnings</p>
            <h2 className="text-white font-black text-3xl mt-1 relative z-10" style={{ fontFamily: 'Sora, sans-serif' }}>
              {loading ? <span className="animate-pulse">₹ …</span> : fmtShort(totalEarnings)}
            </h2>
            <p className="text-emerald-200 text-xs mt-0.5 relative z-10">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>

            <div className="flex gap-3 mt-4 relative z-10 flex-wrap">
              {loading ? (
                <>
                  <StatSkeleton /><StatSkeleton /><StatSkeleton />
                </>
              ) : (
                <>
                  <div className="bg-white/20 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                    <p className="text-white font-black text-lg leading-none">{fmt(totalReceived)}</p>
                    <p className="text-emerald-100 text-[11px] mt-0.5">Advance Paid</p>
                  </div>
                  <div className="bg-white/20 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                    <p className="text-white font-black text-lg leading-none">{fmt(totalPending)}</p>
                    <p className="text-emerald-100 text-[11px] mt-0.5">Remaining Due</p>
                  </div>
                  <div className="bg-white/20 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                    <p className="text-white font-black text-lg leading-none">{fmtShort(avgOrder)}</p>
                    <p className="text-emerald-100 text-[11px] mt-0.5">Avg / Order</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Breakdown Cards ── */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Orders', icon: '📦', value: orders.length, sub: 'All time', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
              { label: 'Completed',    icon: '✅', value: received.length, sub: `${fmt(totalReceived)} received`, color: 'bg-green-50 text-green-700 border-green-100' },
              { label: 'In Progress',  icon: '⏳', value: pending.length, sub: `${fmt(totalPending)} due`, color: 'bg-amber-50 text-amber-700 border-amber-100' },
              { label: 'Avg / Order',  icon: '📊', value: fmtShort(avgOrder), sub: 'per order', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            ].map(m => (
              <div key={m.label} className={`bg-white rounded-2xl border ${m.color.split(' ').find(c => c.startsWith('border-'))} shadow-sm p-4`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">{m.label}</span>
                </div>
                {loading
                  ? <div className="h-5 w-16 bg-stone-100 rounded animate-pulse" />
                  : <p className={`text-lg font-black ${m.color.split(' ').find(c => c.startsWith('text-'))}`}>{m.value}</p>
                }
                <p className="text-[11px] text-stone-400 mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Filter Pills ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['All', 'Received', 'Pending'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white border border-stone-200 text-stone-500 hover:border-emerald-300'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* ── Orders List ── */}
          <div className="space-y-3">
            <AnimatePresence>
              {loading ? (
                [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <p className="text-5xl mb-3">📭</p>
                  <p className="font-bold text-stone-600">No orders in this category</p>
                  <p className="text-sm mt-1">Create orders from the Orders tab.</p>
                </div>
              ) : (
                filtered.map((o, i) => {
                  const isDone = ['Completed', 'Delivered'].includes(o.current_status);
                  return (
                    <motion.div key={o.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isDone ? 'bg-green-50' : 'bg-amber-50'}`}>
                          {isDone ? '✅' : '⏳'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-stone-800 truncate">{o.customer_name}</p>
                          <p className="text-xs text-stone-400 truncate">#{o.id} · {o.product_name}</p>
                          <p className="text-xs text-stone-400 mt-0.5">
                            📅 {o.delivery_date
                              ? new Date(o.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'No delivery date'}
                          </p>
                        </div>

                        {/* Amounts */}
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-black ${isDone ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {fmt(o.final_amount || o.total_amount)}
                          </p>
                          {Number(o.discount_amount) > 0 && (
                            <p className="text-[10px] text-stone-400 line-through">
                              {fmt(o.total_amount)}
                            </p>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${STATUS_COLORS[o.current_status] || 'bg-stone-100 text-stone-500'}`}>
                            {o.current_status}
                          </span>
                        </div>
                      </div>

                      {/* Payment row */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-50">
                        <div className="flex gap-3">
                          <span className="text-[11px] text-stone-500">
                            Advance: <span className="font-bold text-green-600">{fmt(o.advance_payment)}</span>
                          </span>
                          <span className="text-[11px] text-stone-500">
                            Remaining: <span className={`font-bold ${Number(o.remaining_amount) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                              {fmt(o.remaining_amount)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 grid grid-cols-7 z-50 shadow-lg">
        {NAV_TABS.map(n => {
          const isActive = false; // earnings is a sub-page, none highlighted
          return (
            <button key={n.id} onClick={() => handleNav(n.id)}
              className="flex flex-col items-center gap-0.5 py-2.5 transition-all">
              {isActive && <div className="w-5 h-0.5 bg-orange-500 rounded-full mb-0.5" />}
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>{n.icon}</span>
              <span className={`text-[10px] font-bold ${isActive ? 'text-orange-500' : 'text-stone-400'}`}>{n.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
