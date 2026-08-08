// src/components/MeasurementPreview.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * MeasurementPreview
 * Displays estimated body measurements as animated cards.
 *
 * Props:
 *   measurements – object with keys: chest, waist, hips, shoulder, sleeve, inseam, neck (all in cm)
 *   heightCm     – reference height for displaying proportional context
 */

const MEASUREMENT_META = [
  { key: 'chest',    label: 'Chest',    icon: '🫁', color: 'from-teal-400 to-teal-600'    },
  { key: 'waist',    label: 'Waist',    icon: '⚖️', color: 'from-orange-400 to-orange-500' },
  { key: 'hips',     label: 'Hips',     icon: '🔄', color: 'from-purple-400 to-purple-600' },
  { key: 'shoulder', label: 'Shoulder', icon: '🏋️', color: 'from-blue-400 to-blue-600'    },
  { key: 'sleeve',   label: 'Sleeve',   icon: '👕', color: 'from-pink-400 to-pink-600'    },
  { key: 'inseam',   label: 'Inseam',   icon: '📏', color: 'from-amber-400 to-amber-500'  },
  { key: 'neck',     label: 'Neck',     icon: '🎀', color: 'from-green-400 to-green-600'  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const MeasurementPreview = ({ measurements, heightCm }) => {
  if (!measurements) return null;

  return (
    <motion.div
      id="measurement-results"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Your Measurements</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Based on height {heightCm} cm · All values in centimetres
          </p>
        </div>
        <span className="text-xs font-semibold bg-teal-100 text-primary px-3 py-1 rounded-full">
          AI Estimate
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {MEASUREMENT_META.map(({ key, label, icon, color }) => (
          <motion.div
            key={key}
            id={`measurement-card-${key}`}
            variants={cardVariants}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
          >
            {/* Colour badge */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg flex-shrink-0`}>
              {icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-800">
                {measurements[key]}
                <span className="text-xs font-normal text-gray-400 ml-1">cm</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
        <span className="text-base flex-shrink-0">⚠️</span>
        <p>
          These are <strong>AI-estimated</strong> values. For precise garment stitching, please
          get measured by your tailor or use a measuring tape to verify.
        </p>
      </div>

      {/* Copy / Share CTA */}
      <motion.button
        id="copy-measurements-btn"
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          const text = MEASUREMENT_META
            .map(({ key, label }) => `${label}: ${measurements[key]} cm`)
            .join('\n');
          navigator.clipboard.writeText(text).then(() => alert('Measurements copied to clipboard!'));
        }}
        className="w-full py-3 rounded-xl border-2 border-dashed border-primary text-primary font-semibold text-sm hover:bg-teal-50 transition-colors"
      >
        📋 Copy all measurements
      </motion.button>
    </motion.div>
  );
};

export default MeasurementPreview;
