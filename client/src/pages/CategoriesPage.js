import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'men', title: 'Men', icon: '👔', desc: 'Suits, Shirts, Trousers & more', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200' },
  { id: 'women', title: 'Women', icon: '👗', desc: 'Dresses, Blouses, Skirts & more', color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-200' },
  { id: 'girls', title: 'Girls', icon: '🎀', desc: 'Frocks, School Uniforms & casuals', color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-200' },
  { id: 'child', title: 'Child / Boys', icon: '🧸', desc: 'Kids wear, Tiny suits & uniforms', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200' },
  { id: 'old-men', title: 'Senior Men', icon: '🥼', desc: 'Comfort wear, Traditional Kurtas', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const CategoriesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-stone-50 min-h-screen pb-12 font-poppins">
      
      {/* Dynamic Header */}
      <div className="pt-16 pb-16 px-6 relative overflow-hidden shadow-xl rounded-b-[40px] bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 transition-colors duration-500">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/20 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-black rounded-full mix-blend-overlay filter blur-3xl opacity-20" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center md:text-left mt-4">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black mb-3 text-white" 
            style={{fontFamily: 'Sora, sans-serif'}}
          >
            Explore <span className="text-amber-200">Categories</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto md:mx-0"
          >
            Find the perfect tailor for every member of your family. Hand-picked specialists for all styles.
          </motion.p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((cat) => (
            <motion.div 
              key={cat.id}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/browse-deals?category=${cat.id}`)}
              className={`bg-gradient-to-br ${cat.color} rounded-3xl p-6 shadow-xl ${cat.shadow} cursor-pointer relative overflow-hidden group`}
            >
              {/* Card Decoration */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full blur-xl" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl mb-4 border border-white/30 shadow-sm group-hover:rotate-12 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight" style={{fontFamily: 'Sora, sans-serif'}}>
                  {cat.title}
                </h3>
                <p className="text-white/80 text-sm font-medium leading-snug pr-4">
                  {cat.desc}
                </p>
                
                <div className="mt-6 flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                  <span>Explore</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Coming Soon Placeholder */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex flex-col items-center justify-center text-center min-h-[220px]"
          >
            <span className="text-4xl mb-3 grayscale opacity-50">✨</span>
            <h3 className="text-lg font-black text-stone-400 mb-1">More Categories</h3>
            <p className="text-stone-400 text-sm font-medium">Coming soon</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default CategoriesPage;
