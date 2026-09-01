import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';


const API_URL = process.env.REACT_APP_API_URL || 'https://tailorhub-web.onrender.com';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

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
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.message || 'Login failed');
            login(data.user);
            const dest = data.user.role === 'tailor' ? '/tailor/dashboard' : '/customer/dashboard';
            navigate(dest);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // useGoogleLogin (implicit flow) opens a standard OAuth2 popup directly from
    // our own button's click handler. This bypasses the GIS-rendered button and
    // FedCM overlay, which caused "clicking Continue does nothing" in production.
    // The popup returns an access_token that we send to the backend for verification.
    const handleGoogleClick = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setError('');
            setGoogleLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ access_token: tokenResponse.access_token }),
                });
                const data = await res.json();
                if (!res.ok) {
                    return setError(data.message || 'Google sign-in failed. Please try again.');
                }
                login(data.user);
                const dest = data.user.role === 'tailor' ? '/tailor/dashboard' : '/customer/dashboard';
                navigate(dest);
            } catch (err) {
                setError('Could not reach the server. Check your connection and try again.');
                console.error('[Google Auth] Network error:', err);
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: (err) => {
            // Fires when the popup is dismissed or blocked — do not show an error to the user.
            console.warn('[Google Auth] Popup closed or sign-in cancelled.', err);
        },
    });

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

                {/* ── Google Sign-In ── */}
                <div id="google-signin-btn" style={{ width: '100%', marginBottom: '20px' }}>
                    <button
                        type="button"
                        onClick={() => handleGoogleClick()}
                        disabled={googleLoading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 16px',
                            border: '1px solid #dadce0',
                            borderRadius: '4px',
                            backgroundColor: '#fff',
                            color: '#3c4043',
                            fontSize: '14px',
                            fontWeight: '500',
                            fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
                            cursor: googleLoading ? 'not-allowed' : 'pointer',
                            opacity: googleLoading ? 0.7 : 1,
                            transition: 'background-color 0.2s, box-shadow 0.2s',
                        }}
                        onMouseOver={(e) => { if (!googleLoading) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                        onMouseOut={(e) => { if (!googleLoading) e.currentTarget.style.backgroundColor = '#fff'; }}
                    >
                        {googleLoading ? (
                            <span style={{ width: '18px', height: '18px', border: '2px solid #9ca3af', borderTopColor: '#374151', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                            </svg>
                        )}
                        {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
                    </button>
                </div>

                {/* ── Divider ── */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
                    <div className="flex-1 h-px bg-gray-200" />
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
