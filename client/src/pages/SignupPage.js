import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const passwordRules = [
    { id: 'length', label: 'At least 6 characters', test: (p) => p.length >= 6 },
    { id: 'upper', label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
    { id: 'number', label: 'One number (0–9)', test: (p) => /[0-9]/.test(p) },
];

const SignupPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRules, setShowRules] = useState(false);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const allRulesPassed = passwordRules.every((r) => r.test(form.password));

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.full_name.trim()) return setError('Full name is required');
        if (!isValidEmail(form.email)) return setError('Please enter a valid email address');
        if (!allRulesPassed) return setError('Password does not meet all requirements');
        if (form.password !== form.confirm) return setError('Passwords do not match');
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ full_name: form.full_name, email: form.email, password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.message || 'Signup failed');
            navigate('/login');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <motion.div
                className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">✂️</div>
                    <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
                    <p className="text-gray-500 text-sm mt-1">Join TailorHub today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 transition"
                        />
                    </div>

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
                            onFocus={() => setShowRules(true)}
                            placeholder="Create a strong password"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 transition"
                        />

                        {showRules && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-1"
                            >
                                <p className="text-xs font-semibold text-gray-500 mb-2">Password must contain:</p>
                                {passwordRules.map((rule) => {
                                    const passed = rule.test(form.password);
                                    return (
                                        <div key={rule.id} className="flex items-center gap-2 text-xs">
                                            <span className={passed ? 'text-green-500' : 'text-gray-400'}>
                                                {passed ? '✓' : '○'}
                                            </span>
                                            <span className={passed ? 'text-green-600' : 'text-gray-500'}>
                                                {rule.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirm"
                            value={form.confirm}
                            onChange={handleChange}
                            placeholder="Repeat your password"
                            required
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${form.confirm && form.confirm !== form.password
                                ? 'border-red-400 focus:ring-red-300'
                                : form.confirm && form.confirm === form.password
                                    ? 'border-green-400 focus:ring-green-300'
                                    : 'border-gray-300 focus:ring-gray-700'
                                }`}
                        />
                        {form.confirm && form.confirm !== form.password && (
                            <p className="text-red-500 text-xs mt-1 ml-1">Passwords do not match</p>
                        )}
                        {form.confirm && form.confirm === form.password && (
                            <p className="text-green-600 text-xs mt-1 ml-1">✓ Passwords match</p>
                        )}
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
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-gray-800 font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default SignupPage;
