import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidEmail(email)) return setError('Please enter a valid email address');
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.message || 'Something went wrong');
            setSuccess(data.message);
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
                    <div className="text-4xl mb-3">🔐</div>
                    <h1 className="text-2xl font-bold text-gray-800">Forgot password?</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-4 text-sm mb-6">
                            {success}
                        </div>
                        <Link to="/login" className="text-gray-800 font-semibold hover:underline text-sm">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                placeholder="you@example.com"
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
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            <Link to="/login" className="text-gray-800 font-semibold hover:underline">
                                Back to Login
                            </Link>
                        </p>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
