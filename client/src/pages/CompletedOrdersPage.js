import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL;

export default function CompletedOrdersPage() {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`${API_URL}/api/orders/tailor`, { credentials: 'include' });
                if (!res.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await res.json();
                setOrders(data.orders || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const completedOrders = orders.filter(o => o.current_status === 'Completed' || o.current_status === 'Delivered');

    const totalEarned = completedOrders.reduce((sum, o) =>
        sum + (parseFloat(o.total_amount) || 0), 0);

    const ratedOrders = completedOrders.filter(o => o.rating !== null && o.rating > 0);
    const avgRating = ratedOrders.length > 0
        ? (ratedOrders.reduce((s, o) => s + o.rating, 0) / ratedOrders.length).toFixed(1)
        : 'N/A';

    const renderStars = (n) => '⭐'.repeat(n) + '☆'.repeat(5 - n);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-xl font-bold text-gray-600">
                    ‹
                </button>
                <div>
                    <h1 className="text-base font-bold text-gray-800">Completed Orders</h1>
                    <p className="text-xs text-gray-400">{completedOrders.length} orders delivered</p>
                </div>
                <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    ✅ {completedOrders.length} Done
                </span>
            </header>

            <main className="max-w-lg mx-auto px-4 py-5 pb-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-5 text-white mb-5">
                    <p className="text-green-100 text-sm">Total completed deliveries</p>
                    <h2 className="text-3xl font-extrabold mt-1">{completedOrders.length} Orders</h2>
                    <div className="flex gap-4 mt-3">
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-lg font-bold">₹{totalEarned.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-green-100">Total Earned</p>
                        </div>
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-lg font-bold">{avgRating} ⭐</p>
                            <p className="text-xs text-green-100">Avg Rating</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>Error: {error}</p>
                    ) : (
                        <AnimatePresence>
                            {completedOrders.map((o, i) => (
                                <motion.div key={o.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer"
                                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                                                    ✅
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{o.customer_name}</p>
                                                    <p className="text-xs text-gray-400">#{o.id} · {o.product_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-green-600">₹{o.total_amount}</p>
                                                <p className="text-xs text-gray-400 mt-1">Delivered {new Date(o.delivery_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                            <p className="text-xs text-gray-400">📅 {new Date(o.created_at).toLocaleDateString()}</p>
                                            {o.rating && <p className="text-xs text-yellow-500 font-medium">{renderStars(o.rating)}</p>}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expanded === o.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="border-t border-green-100 bg-green-50 px-4 py-3 overflow-hidden">
                                                <p className="text-xs font-semibold text-green-700 mb-2">📋 Order History</p>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-gray-500">📞 Phone</span>
                                                        <span className="text-xs font-medium text-gray-700">{o.customer_phone}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-gray-500">🪡 Item</span>
                                                        <span className="text-xs font-medium text-gray-700">{o.product_name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-gray-500">📝 Note</span>
                                                        <span className="text-xs font-medium text-gray-700 text-right max-w-[60%]">{o.notes}</span>
                                                    </div>
                                                    {o.rating &&
                                                        <div className="flex justify-between">
                                                            <span className="text-xs text-gray-500">⭐ Rating</span>
                                                            <span className="text-xs font-bold text-yellow-500">{renderStars(o.rating)} ({o.rating}/5)</span>
                                                        </div>
                                                    }
                                                </div>
                                                <button className="w-full mt-3 bg-white border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-xl hover:bg-gray-50 transition-colors">
                                                    🔄 Reorder for Customer
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </main>
        </div>
    );
}
