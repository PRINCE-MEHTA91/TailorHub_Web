import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/api/auth/me', { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.user) setUser(data.user);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const login = (userData) => setUser(userData);

    const logout = async () => {
        await fetch('http://localhost:3000/api/auth/logout', { method: 'POST', credentials: 'include' });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
