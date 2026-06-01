import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_URL = process.env.REACT_APP_API_URL || 'https://tailorhub-web.onrender.com';

        fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.user) setUser(data.user);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const login = (userData) => setUser(userData);

    const logout = async () => {
        const API_URL = process.env.REACT_APP_API_URL || 'https://tailorhub-web.onrender.com';
        await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
