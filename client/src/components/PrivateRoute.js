import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return user ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
