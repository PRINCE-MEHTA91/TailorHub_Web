import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const passwordRules = [
    { id: 'length', label: 'At least 6 characters', test: (p) => p.length >= 6 },
    { id: 'upper', label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
    { id: 'number', label: 'One number (0–9)', test: (p) => /[0-9]/.test(p) },
];

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const safeParseJson = async (res) => {
    try {
        return await res.json();
    } catch {
        return null;
    }
};

const resolveErrorMessage = (err, status, data) => {
    if (!navigator.onLine) return 'No internet connection.';
    if (err instanceof TypeError) return 'Server is unavailable. Please try again later.';
    if (status === 409) return 'This email is already registered.';
    if (status === 503 || (data && data.code === 'SMTP_FAIL')) {
        return 'Account created but email verification failed.';
    }
    if (data && data.message) return data.message;
    return 'Signup failed. Please try again.';
};

const SignupPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRules, setShowRules] = useState(false);

    const allRulesPassed = passwordRules.every((r) => r.test(form.password));
    const passwordsMatch = form.confirm !== '' && form.password === form.confirm;

    const isFormReady =
        form.full_name.trim() !== '' &&
        isValidEmail(form.email) &&
        allRulesPassed &&
        passwordsMatch;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormReady) return;

        setLoading(true);
        setError('');

        let res = null;
        let data = null;

        try {
            const API_URL = process.env.REACT_APP_API_URL;
            res = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    full_name: form.full_name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    role,
                }),
            });

            data = await safeParseJson(res);

            if (!res.ok) {
                if (!data) {
                    setError('Unexpected server response. Please try again.');
                    return;
                }
                setError(resolveErrorMessage(null, res.status, data));
                return;
            }

            navigate('/login');

        } catch (err) {
            setError(resolveErrorMessage(err, null, null));
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

                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: 'customer', label: '🛍️ Customer', desc: 'Looking for tailoring' },
                            { value: 'tailor', label: '🧵 Tailor', desc: 'Offering my services' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setRole(opt.value)}
                                className={`flex flex-col items-center justify-center rounded-xl border-2 py-3 px-2 transition-all cursor-pointer text-sm font-medium ${role === opt.value
                                    ? 'border-gray-800 bg-gray-800 text-white shadow-md'
                                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                <span className="text-xl mb-1">{opt.label.split(' ')[0]}</span>
                                <span>{opt.label.split(' ')[1]}</span>
                                <span className={`text-xs mt-0.5 ${role === opt.value ? 'text-gray-300' : 'text-gray-400'}`}>
                                    {opt.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            autoComplete="name"
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
                            autoComplete="email"
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
                            autoComplete="new-password"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 transition"
                        />

                        {(showRules || form.password.length > 0) && (
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
                            autoComplete="new-password"
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
                        {passwordsMatch && (
                            <p className="text-green-600 text-xs mt-1 ml-1">✓ Passwords match</p>
                        )}
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2"
                            role="alert"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !isFormReady}
                        title={!isFormReady ? 'Please fill in all fields correctly' : undefined}
                        className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {loading
                            ? 'Creating account...'
                            : `Create Account as ${role === 'customer' ? 'Customer' : 'Tailor'}`}
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
