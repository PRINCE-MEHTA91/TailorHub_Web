import React from 'react';
import { motion } from 'framer-motion';

const CategoryCard = ({ category }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
    >
      <img className="w-full h-40 object-cover" src={category.image} alt={category.name} />
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
