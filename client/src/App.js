import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import QuickActions from './components/QuickActions';
import HeroBanner from './components/HeroBanner';
import FeaturedProducts from './components/FeaturedProducts';
import CategoryGrid from './components/CategoryGrid';
import TailorConnect from './components/TailorConnect';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
      <div className="bg-light-gray font-poppins pb-16">
        <Header />
        <SearchBar />
        <Routes>
          <Route path="/" element={<>
            <QuickActions />
            <HeroBanner />
            <FeaturedProducts />
            <CategoryGrid />
            <TailorConnect />
          </>} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;

