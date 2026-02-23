import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — guards routes that require authentication.
 * Optional `role` prop adds role-based protection:
 *   <PrivateRoute role="tailor"> → only tailors can access
 *   <PrivateRoute role="customer"> → only customers can access
 *   <PrivateRoute> → any logged-in user
 */
const PrivateRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Not logged in → redirect to home/login
    if (!user) return <Navigate to="/login" replace />;

    // Logged in but wrong role → redirect to their correct dashboard
    if (role && user.role !== role) {
        const redirect = user.role === 'tailor' ? '/dashboard/tailor' : '/dashboard/customer';
        return <Navigate to={redirect} replace />;
    }

    return children;
};

export default PrivateRoute;
