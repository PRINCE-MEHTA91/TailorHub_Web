import React, { useState, useEffect } from 'react';
import QuickActions from '../components/QuickActions';
import HeroBanner from '../components/HeroBanner';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryGrid from '../components/CategoryGrid';
import TailorConnect from '../components/TailorConnect';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

const IndexPage = () => {
    const { user, loading } = useAuth();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            setShowModal(true);
        }
    }, [loading, user]);

    return (
        <>
            {showModal && <AuthModal onClose={() => setShowModal(false)} />}
            <QuickActions />
            <HeroBanner />
            <FeaturedProducts />
            <CategoryGrid />
            <TailorConnect />
        </>
    );
};

export default IndexPage;
