import React from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
    >
      <img className="w-full h-48 object-cover" src={product.image} alt={product.name} />
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-600 mt-1">{product.price}</p>
        <button className="mt-4 bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors duration-300">
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
