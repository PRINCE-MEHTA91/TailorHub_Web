import React from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import IndexPage from './IndexPage';
import BottomNav from '../components/BottomNav';

/* ─── Customer Dashboard ───────────────────────────────────────────
   Renders the same home page layout that guests see at localhost:3001/,
   but with the logged-in Header (profile strip + logout button).
────────────────────────────────────────────────────────────────────── */
const CustomerDashboardPage = () => {
    return (
        <div className="bg-light-gray font-poppins pb-16">
            <Header />
            <SearchBar />
            <IndexPage />
            <BottomNav />
        </div>
    );
};

export default CustomerDashboardPage;
