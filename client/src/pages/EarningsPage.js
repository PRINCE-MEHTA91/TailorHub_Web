import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const transactions = [
    { id: '#1040', customer: 'Priya Patel', item: 'Blouse (Silk)', amount: 800, date: 'Feb 22, 2025', method: 'UPI', status: 'Paid' },
    { id: '#1039', customer: 'Karan Singh', item: 'Suit (3-piece)', amount: 6000, date: 'Feb 20, 2025', method: 'Cash', status: 'Paid' },
    { id: '#1037', customer: 'Sunita Verma', item: 'Anarkali Dress', amount: 2100, date: 'Feb 15, 2025', method: 'UPI', status: 'Paid' },
    { id: '#1034', customer: 'Ramesh Gupta', item: 'Sherwani (Groom)', amount: 7500, date: 'Feb 10, 2025', method: 'Bank Transfer', status: 'Paid' },
    { id: '#1031', customer: 'Kavita Joshi', item: 'Lehenga', amount: 5200, date: 'Feb 5, 2025', method: 'UPI', status: 'Paid' },
    { id: '#1029', customer: 'Deepak Sharma', item: 'Bandhgala Suit', amount: 3800, date: 'Jan 30, 2025', method: 'Cash', status: 'Paid' },
    { id: '#1025', customer: 'Nisha Agarwal', item: 'Salwar (Cotton)', amount: 1100, date: 'Jan 25, 2025', method: 'UPI', status: 'Paid' },
    // Pending payment
    { id: '#1042', customer: 'Riya Sharma', item: 'Lehenga (Bridal)', amount: 4500, date: 'Feb 28, 2025', method: '—', status: 'Due' },
    { id: '#1041', customer: 'Arun Mehta', item: 'Sherwani', amount: 3200, date: 'Mar 2, 2025', method: '—', status: 'Due' },
];

const methodIcon = { UPI: '📱', Cash: '💵', 'Bank Transfer': '🏦', '—': '⏳' };

export default function EarningsPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    const paid = transactions.filter(t => t.status === 'Paid');
    const due = transactions.filter(t => t.status === 'Due');
    const totalPaid = paid.reduce((s, t) => s + t.amount, 0);
    const totalDue = due.reduce((s, t) => s + t.amount, 0);

    const filters = ['All', 'Paid', 'Due'];
    const filtered = filter === 'All' ? transactions : transactions.filter(t => t.status === filter);

    const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;
    const statusColor = { Paid: 'bg-green-100 text-green-700', Due: 'bg-amber-100 text-amber-700' };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate('/dashboard/tailor')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-xl font-bold text-gray-600">
                    ‹
                </button>
                <div>
                    <h1 className="text-base font-bold text-gray-800">Earnings</h1>
                    <p className="text-xs text-gray-400">All transactions</p>
                </div>
                <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                    💰 {fmt(totalPaid)}
                </span>
            </header>

            <main className="max-w-lg mx-auto px-4 py-5 pb-10">
                {/* Summary Banner */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-5 text-white mb-5">
                    <p className="text-emerald-100 text-sm">Total collected</p>
                    <h2 className="text-3xl font-extrabold mt-1">{fmt(totalPaid)}</h2>
                    <div className="flex gap-4 mt-3">
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-lg font-bold">{paid.length}</p>
                            <p className="text-xs text-emerald-100">Transactions</p>
                        </div>
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-lg font-bold">{fmt(totalDue)}</p>
                            <p className="text-xs text-emerald-100">Pending Due</p>
                        </div>
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-lg font-bold">{fmt(Math.round(totalPaid / paid.length))}</p>
                            <p className="text-xs text-emerald-100">Avg / Order</p>
                        </div>
                    </div>
                </div>

                {/* Breakdown Cards */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                        { label: 'UPI', icon: '📱', count: paid.filter(t => t.method === 'UPI').length, amount: paid.filter(t => t.method === 'UPI').reduce((s, t) => s + t.amount, 0) },
                        { label: 'Cash', icon: '💵', count: paid.filter(t => t.method === 'Cash').length, amount: paid.filter(t => t.method === 'Cash').reduce((s, t) => s + t.amount, 0) },
                        { label: 'Bank', icon: '🏦', count: paid.filter(t => t.method === 'Bank Transfer').length, amount: paid.filter(t => t.method === 'Bank Transfer').reduce((s, t) => s + t.amount, 0) },
                        { label: 'Pending', icon: '⏳', count: due.length, amount: totalDue },
                    ].map(m => (
                        <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{m.icon}</span>
                                <span className="text-xs font-semibold text-gray-600">{m.label}</span>
                            </div>
                            <p className="text-base font-bold text-gray-800">{fmt(m.amount)}</p>
                            <p className="text-xs text-gray-400">{m.count} txn{m.count !== 1 ? 's' : ''}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 mb-4">
                    {filters.map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                {/* Transactions */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map((t, i) => (
                            <motion.div key={t.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                                <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                    {methodIcon[t.method]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{t.customer}</p>
                                    <p className="text-xs text-gray-400 truncate">{t.id} · {t.item}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">📅 {t.date}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-sm font-bold ${t.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {t.status === 'Paid' ? '+' : ''}{fmt(t.amount)}
                                    </p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor[t.status]}`}>
                                        {t.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-4xl mb-3">📭</p>
                            <p className="font-semibold">No transactions here!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
