import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Smart redirector — sends users to the correct dashboard based on their role
const DashboardPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'tailor') {
                navigate('/dashboard/tailor', { replace: true });
            } else {
                navigate('/dashboard/customer', { replace: true });
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-500">
                <span className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                <p className="text-sm">Loading your dashboard...</p>
            </div>
        </div>
    );
};

export default DashboardPage;
