import React from 'react';
import { motion } from 'framer-motion';

const HeroBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="px-4 mt-4"
    >
      <div
        className="h-64 rounded-lg bg-cover bg-center"
        style={{ backgroundImage: "url('https://picsum.photos/1200/400')" }}
      >
        {/* Placeholder for a full-width banner image */}
      </div>
    </motion.div>
  );
};

export default HeroBanner;
