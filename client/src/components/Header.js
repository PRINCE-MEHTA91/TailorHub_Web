import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBell, FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 text-white shadow-md sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold tracking-wider">TailorHub</Link>
          <div className="hidden md:flex items-center space-x-4">
            <a href="#notifications" className="text-white"><FaBell size={20} /></a>
            <a href="#cart" className="text-white"><FaShoppingCart size={20} /></a>
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FaUser size={14} />
                  <span>{user.full_name}</span>
                </div>
                <Link to="/dashboard" className="border border-white py-2 px-4 rounded-md hover:bg-white hover:text-gray-800 transition-colors duration-300 text-sm">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-white text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-300 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="border border-white py-2 px-4 rounded-md hover:bg-white hover:text-gray-800 transition-colors duration-300">
                  Login
                </Link>
                <Link to="/signup" className="bg-white text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-300">
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden px-4 pt-2 pb-4 space-y-2"
        >
          <a href="#notifications" className="block text-white"><FaBell size={20} /></a>
          <a href="#cart" className="block text-white"><FaShoppingCart size={20} /></a>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block w-full text-left border border-white py-2 px-3 rounded-md hover:bg-white hover:text-gray-800 transition-colors duration-300">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left bg-white text-gray-800 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors duration-300 mt-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-left border border-white py-2 px-3 rounded-md hover:bg-white hover:text-gray-800 transition-colors duration-300">
                Login
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="block w-full text-left bg-white text-gray-800 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors duration-300 mt-2">
                Sign Up
              </Link>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Header;
