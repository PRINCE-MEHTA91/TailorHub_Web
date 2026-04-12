import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const allOrders = [
    { id: '#1042', customer: 'Riya Sharma', item: 'Lehenga (Bridal)', status: 'In Progress', due: 'Feb 28', amount: '₹4,500', phone: '+91 98765 43210', note: 'Extra embroidery on sleeves', date: 'Feb 18, 2025' },
    { id: '#1041', customer: 'Arun Mehta', item: 'Sherwani', status: 'Pending', due: 'Mar 2', amount: '₹3,200', phone: '+91 87654 32109', note: 'Gold buttons requested', date: 'Feb 20, 2025' },
    { id: '#1038', customer: 'Anita Desai', item: 'Salwar Kameez', status: 'Pending', due: 'Mar 5', amount: '₹1,200', phone: '+91 76543 21098', note: 'Regular fit, cotton fabric', date: 'Feb 21, 2025' },
    { id: '#1035', customer: 'Meera Nair', item: 'Saree Blouse', status: 'In Progress', due: 'Mar 8', amount: '₹950', phone: '+91 65432 10987', note: 'Back neck design – V-cut', date: 'Feb 22, 2025' },
    { id: '#1033', customer: 'Suresh Rao', item: 'Kurta (3-piece)', status: 'Pending', due: 'Mar 10', amount: '₹2,800', phone: '+91 54321 09876', note: 'White with silver border', date: 'Feb 23, 2025' },
];

const statusColor = {
    'In Progress': 'bg-blue-100 text-blue-700',
    'Pending': 'bg-amber-100 text-amber-700',
};
const statusIcon = { 'In Progress': '🔄', 'Pending': '⏳' };

export default function PendingJobsPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [expanded, setExpanded] = useState(null);

    const filters = ['All', 'Pending', 'In Progress'];
    const filtered = filter === 'All' ? allOrders : allOrders.filter(o => o.status === filter);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate('/dashboard/tailor')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-xl font-bold text-gray-600">
                    ‹
                </button>
                <div>
                    <h1 className="text-base font-bold text-gray-800">Pending Jobs</h1>
                    <p className="text-xs text-gray-400">{allOrders.length} active orders</p>
                </div>
                <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                    ⏳ {allOrders.length} Pending
                </span>
            </header>

            <main className="max-w-lg mx-auto px-4 py-5 pb-10">
                <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-5 text-white mb-5">
                    <p className="text-amber-100 text-sm">Total pending work</p>
                    <h2 className="text-3xl font-extrabold mt-1">{allOrders.length} Jobs</h2>
                    <div className="flex gap-4 mt-3">
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-lg font-bold">{allOrders.filter(o => o.status === 'Pending').length}</p>
                            <p className="text-xs text-amber-100">Pending</p>
                        </div>
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-lg font-bold">{allOrders.filter(o => o.status === 'In Progress').length}</p>
                            <p className="text-xs text-amber-100">In Progress</p>
                        </div>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {filters.map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map((o, i) => (
                            <motion.div key={o.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer"
                                onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                                                {statusIcon[o.status]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{o.customer}</p>
                                                <p className="text-xs text-gray-400">{o.id} · {o.item}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor[o.status]}`}>{o.status}</span>
                                            <p className="text-xs text-gray-400 mt-1">Due {o.due}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                        <p className="text-xs text-gray-400">📅 Ordered: {o.date}</p>
                                        <p className="text-sm font-bold text-amber-600">{o.amount}</p>
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
                                            className="border-t border-amber-100 bg-amber-50 px-4 py-3 overflow-hidden">
                                            <p className="text-xs font-semibold text-amber-700 mb-2">📋 Order Details</p>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">📞 Phone</span>
                                                    <span className="text-xs font-medium text-gray-700">{o.phone}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">🪡 Item</span>
                                                    <span className="text-xs font-medium text-gray-700">{o.item}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">📝 Note</span>
                                                    <span className="text-xs font-medium text-gray-700 text-right max-w-[60%]">{o.note}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">💰 Amount</span>
                                                    <span className="text-xs font-bold text-amber-600">{o.amount}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button className="flex-1 bg-amber-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-amber-700 transition-colors">
                                                    ✅ Mark Done
                                                </button>
                                                <button className="flex-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-xl hover:bg-gray-50 transition-colors">
                                                    💬 Message
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-4xl mb-3">🎉</p>
                            <p className="font-semibold">No jobs in this category!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
