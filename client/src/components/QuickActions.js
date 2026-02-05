import React from 'react';
import { FaTh, FaTags, FaGift, FaFire } from 'react-icons/fa';
import { motion } from 'framer-motion';

const actions = [
  { icon: <FaTh size={24} />, label: 'Categories' },
  { icon: <FaTags size={24} />, label: 'Deals' },
  { icon: <FaGift size={24} />, label: 'New Arrivals' },
  { icon: <FaFire size={24} />, label: 'Trending' },
];

const QuickActions = () => {
  return (
    <div className="py-6 text-center">
      <div className="flex justify-around">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1, y: -5 }}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-white flex justify-center items-center shadow-md group-hover:bg-gray-800 group-hover:text-white transition-colors duration-300">
              {action.icon}
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
