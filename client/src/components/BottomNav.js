import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { AiOutlineHome, AiOutlineShopping, AiOutlineUser } from 'react-icons/ai';
import { GiPerson } from 'react-icons/gi';

const navItems = [
  { name: 'Home', to: '/', icon: AiOutlineHome },
  { name: 'Clothing', to: '/clothing', icon: AiOutlineShopping },
  { name: 'Tailors', to: '/tailors', icon: GiPerson },
  { name: 'Account', to: '/account', icon: AiOutlineUser },
];

const BottomNav = () => {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-teal-900 text-white rounded-t-2xl shadow-lg">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className="flex flex-col items-center justify-center w-full h-full"
            onClick={() => setActiveTab(item.name)}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <item.icon className={`text-2xl ${activeTab === item.name ? 'text-white' : 'text-gray-400'}`} />
              <span className={`text-xs ${activeTab === item.name ? 'text-white' : 'text-gray-400'}`}>{item.name}</span>
            </motion.div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;