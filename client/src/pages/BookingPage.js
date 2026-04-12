import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import CustomerBottomNav from '../components/CustomerBottomNav';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaCheckCircle, FaCut } from 'react-icons/fa';

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tailor, setTailor] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedService, setSelectedService] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (id.startsWith('f')) {
            const fallbackTailors = [
                { id: 'f1', full_name: 'Priya Boutique', products: [{ name: 'Bridal Lehenga', price: '2000' }] },
                { id: 'f2', full_name: 'Khan & Sons', products: [{ name: 'Suit Tailoring', price: '3500' }] },
                { id: 'f3', full_name: 'Meera Creations', products: [{ name: 'Blouse Stitching', price: '500' }] }
            ];
            setTailor(fallbackTailors.find(t => t.id === id) || { full_name: 'Unknown Tailor', products: [] });
            setLoading(false);
            return;
        }

        const API_URL = process.env.REACT_APP_API_URL;

        fetch(`${API_URL}/api/tailors/${id}`)
            .then(res => res.ok ? res.json() : Promise.reject('Not found'))
            .then(data => {
                setTailor(data.tailor);
                setLoading(false);
            })
            .catch(() => {
                setTailor({ full_name: 'Unknown Tailor', products: [] });
                setLoading(false);
            });
}, [id]);

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const API_URL = process.env.REACT_APP_API_URL;

        const res = await fetch(`${API_URL}/api/bookings`, {
            method: 'POST',

            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',

            body: JSON.stringify({
                tailor_id: id,
                tailor_name: tailor?.full_name,
                service: selectedService,
                date,
                time,
                notes
            })
        });

        const data = await res.json();

        if (res.ok) {
            setIsSuccess(true);
            setTimeout(() => {
                navigate(`/tailor-profile/${id}`);
            }, 3000);
        } else {
            alert(data.message || 'Failed to book appointment. Please make sure you are logged in.');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred during booking.');
    } finally {
        setIsSubmitting(false);
    }
};

if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 flex justify-center items-center">
                <span className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <CustomerBottomNav activeTab="tailors" />
        </div>
    );
}

if (isSuccess) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center max-w-sm w-full">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="text-green-500 text-6xl mb-4">
                    <FaCheckCircle />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-3 flex-1">Your appointment with <span className="font-semibold">{tailor?.full_name}</span> is set.</p>
                <p className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl mb-6">
                    📧 Confirmation email sent!
                </p>
                <p className="text-xs text-gray-400">Redirecting you back...</p>
            </motion.div>
        </div>
    );
}

return (
    <div className="min-h-screen bg-gray-50 pb-10">
        <div className="bg-white shadow-sm sticky top-0 z-20">
            <div className="flex items-center p-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <FaArrowLeft />
                </button>
                <h1 className="text-lg font-bold text-gray-800 ml-2">Book Appointment</h1>
            </div>
        </div>

        <main className="max-w-xl mx-auto p-4 mt-4">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Assign Work to <span className="text-indigo-600">{tailor?.full_name}</span></h2>
                    <p className="text-sm text-gray-500 mt-1">Please fill out these details to request a booking.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <FaCut className="text-indigo-500" /> Select Service
                        </label>
                        {tailor?.products && tailor.products.length > 0 ? (
                            <select
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50"
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                            >
                                <option value="" disabled>-- Choose a service --</option>
                                {tailor.products.map((p, i) => (
                                    <option key={i} value={p.name}>{p.name} - ₹{p.price}</option>
                                ))}
                                <option value="Custom">Other Custom Stitching</option>
                            </select>
                        ) : (
                            <input
                                required
                                placeholder="e.g. Blouse Stitching, Suit Alteration"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50"
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <FaCalendarAlt className="text-indigo-500" /> Date
                            </label>
                            <input
                                type="date"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <FaClock className="text-indigo-500" /> Time
                            </label>
                            <input
                                type="time"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Special Requirements (optional)</label>
                        <textarea
                            placeholder="Describe any specific measurements, cloth types, or preferences..."
                            rows="3"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50 resize-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            'Confirm Appointment'
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </main>
        <CustomerBottomNav activeTab="tailors" />
    </div>
);
};

export default BookingPage;
