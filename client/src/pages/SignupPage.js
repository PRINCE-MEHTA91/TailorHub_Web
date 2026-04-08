import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// ─── Password validation rules ────────────────────────────────────────────────
const passwordRules = [
    { id: 'length', label: 'At least 6 characters', test: (p) => p.length >= 6 },
    { id: 'upper', label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
    { id: 'number', label: 'One number (0–9)', test: (p) => /[0-9]/.test(p) },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Safely parse a JSON Response body.
 * Returns parsed object, or null on failure.
 */
const safeParseJson = async (res) => {
    try {
        return await res.json();
    } catch {
        return null;
    }
};

/**
 * Map a fetch error / response to a user-friendly message.
 *
 * Priority:
 *   1. No internet        → "No internet connection."
 *   2. TypeError (fetch)  → "Server is unavailable. Please try again later."
 *   3. 409 duplicate      → "This email is already registered."
 *   4. Known SMTP failure → "Account created but email verification failed."
 *   5. Backend message    → use data.message verbatim
 *   6. Fallback           → "Signup failed. Please try again."
 */
const resolveErrorMessage = (err, status, data) => {
    // 1. Offline?
    if (!navigator.onLine) return 'No internet connection.';

    // 2. Network-level failure (server unreachable / DNS / CORS)
    if (err instanceof TypeError) return 'Server is unavailable. Please try again later.';

    // 3. Duplicate email
    if (status === 409) return 'This email is already registered.';

    // 4. SMTP / email-sending failure (account created but email not sent)
    if (status === 503 || (data && data.code === 'SMTP_FAIL')) {
        return 'Account created but email verification failed.';
    }

    // 5. Custom backend message
    if (data && data.message) return data.message;

    // 6. Generic fallback
    return 'Signup failed. Please try again.';
};

// ─── Component ────────────────────────────────────────────────────────────────
const SignupPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRules, setShowRules] = useState(false);

    // ── Derived state ──────────────────────────────────────────────────────────
    const allRulesPassed = passwordRules.every((r) => r.test(form.password));
    const passwordsMatch = form.confirm !== '' && form.password === form.confirm;

    /** Button is only enabled when every field is valid and passwords match. */
    const isFormReady =
        form.full_name.trim() !== '' &&
        isValidEmail(form.email) &&
        allRulesPassed &&
        passwordsMatch;

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError(''); // hide error as soon as user edits any field
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // always prevent reload

        // Guard: should never reach here because button is disabled, but belt-and-suspenders
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

            // Safely parse JSON — server might return non-JSON on unexpected errors
            data = await safeParseJson(res);

            if (!res.ok) {
                // JSON parse failed → no data → resolveErrorMessage handles fallback
                if (!data) {
                    setError('Unexpected server response. Please try again.');
                    return;
                }
                setError(resolveErrorMessage(null, res.status, data));
                return;
            }

            // Success
            navigate('/login');

        } catch (err) {
            setError(resolveErrorMessage(err, null, null));
        } finally {
            setLoading(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <motion.div
                className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">✂️</div>
                    <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
                    <p className="text-gray-500 text-sm mt-1">Join TailorHub today</p>
                </div>

                {/* Role Selector */}
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
                    {/* Full Name */}
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

                    {/* Email */}
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

                    {/* Password */}
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

                        {/* Password Rules (shown on focus or when user starts typing) */}
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

                    {/* Confirm Password */}
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

                    {/* Error Message */}
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

                    {/* Submit Button */}
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
