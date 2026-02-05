import React from 'react';
import { FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const TailorProfileCard = ({ tailor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800">{tailor.name}</h3>
        <p className="text-gray-600">{tailor.experience}</p>
      </div>
      <div className="mt-4">
        <div className="flex items-center text-gray-700">
          <FaPhone className="mr-2" />
          <span>{tailor.phone}</span>
        </div>
        <div className="flex items-center text-gray-700 mt-2">
          <FaMapMarkerAlt className="mr-2" />
          <span>{tailor.address}</span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300"
      >
        Book Appointment
      </motion.button>
    </motion.div>
  );
};

export default TailorProfileCard;
