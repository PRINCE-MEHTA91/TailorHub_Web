import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidEmail(form.email)) return setError('Please enter a valid email address');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.message || 'Login failed');
            login(data.user);
            navigate('/dashboard');
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
                    <div className="text-4xl mb-3">✂️</div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to your TailorHub account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Min. 6 characters"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 transition"
                        />
                        <div className="text-right mt-1">
                            <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
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
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-gray-800 font-semibold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
