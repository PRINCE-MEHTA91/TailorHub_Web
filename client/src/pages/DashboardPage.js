import React from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerDashboardPage from './CustomerDashboardPage';
import TailorDashboardPage from './TailorDashboardPage';

const DashboardPage = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <span className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                    <p className="text-sm">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (user?.role === 'tailor') {
        return <TailorDashboardPage />;
    }

    return <CustomerDashboardPage />;
};

export default DashboardPage;
