import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ onClose }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 w-full max-w-md text-center z-10"
                    initial={{ scale: 0.85, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                    <div className="text-5xl mb-4">✂️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to TailorHub</h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Your personal tailoring experience awaits. Sign in or create an account to get started.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            to="/login"
                            onClick={onClose}
                            className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-200"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            onClick={onClose}
                            className="w-full border-2 border-gray-800 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
                        >
                            Create Account
                        </Link>
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Continue as guest
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AuthModal;
