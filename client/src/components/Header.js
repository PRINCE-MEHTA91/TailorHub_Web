import React, { useState } from 'react';
import { FaShoppingCart, FaBell, FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 text-white shadow-md sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <a href="#home" className="text-2xl font-bold tracking-wider">TailorHub</a>
          <div className="hidden md:flex items-center space-x-4">
            <a href="#notifications" className="text-white"><FaBell size={20} /></a>
            <a href="#cart" className="text-white"><FaShoppingCart size={20} /></a>
            <button className="border border-white py-2 px-4 rounded-md hover:bg-white hover:text-gray-800 transition-colors duration-300">Login</button>
            <button className="bg-white text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-300">Sign Up</button>
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
          <button className="w-full text-left border border-white py-2 px-3 rounded-md hover:bg-white hover:text-gray-800 transition-colors duration-300">Login</button>
          <button className="w-full text-left bg-white text-gray-800 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors duration-300 mt-2">Sign Up</button>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Header;
