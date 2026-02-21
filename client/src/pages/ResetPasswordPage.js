import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        if (form.password !== form.confirm) return setError('Passwords do not match');
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.message || 'Reset failed');
            navigate('/login');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <motion.div
                className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">🔑</div>
                    <h1 className="text-2xl font-bold text-gray-800">Set new password</h1>
                    <p className="text-gray-500 text-sm mt-1">Choose a strong new password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Min. 6 characters"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirm"
                            value={form.confirm}
                            onChange={handleChange}
                            placeholder="Repeat new password"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 transition"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
