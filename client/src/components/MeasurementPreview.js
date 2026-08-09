// src/components/MeasurementPreview.js
import React from 'react';
import { motion } from 'framer-motion';

const CARDS = [
  { key: 'chest',    label: 'Chest',    emoji: '🫁', from: '#7c3aed', to: '#a855f7' },
  { key: 'waist',    label: 'Waist',    emoji: '⚡', from: '#f59e0b', to: '#f97316' },
  { key: 'hips',     label: 'Hips',     emoji: '💫', from: '#ec4899', to: '#f43f5e' },
  { key: 'shoulder', label: 'Shoulder', emoji: '🏋️', from: '#3b82f6', to: '#6366f1' },
  { key: 'sleeve',   label: 'Sleeve',   emoji: '👕', from: '#10b981', to: '#06b6d4' },
  { key: 'inseam',   label: 'Inseam',   emoji: '📏', from: '#f59e0b', to: '#eab308' },
  { key: 'neck',     label: 'Neck',     emoji: '🎀', from: '#d946ef', to: '#a855f7' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const card = {
  hidden: { opacity: 0, y: 30, scale: 0.88 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 220, damping: 18 } },
};

const MeasurementPreview = ({ measurements, heightCm }) => {
  if (!measurements) return null;

  const copyAll = () => {
    const text = CARDS.map(c => `${c.label}: ${measurements[c.key]} cm`).join('\n');
    navigator.clipboard.writeText(text).then(() => alert('📋 Copied to clipboard!'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-1"
      >
        <div className="flex items-center justify-center gap-2">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-3xl"
          >
            🎉
          </motion.span>
          <h3 className="text-2xl font-black" style={{ color: '#e9d5ff' }}>Your Measurements</h3>
        </div>
        <p className="text-sm" style={{ color: 'rgba(167,139,250,0.7)' }}>
          Based on height {heightCm} cm · All values in centimetres
        </p>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {CARDS.map(({ key, label, emoji, from, to }) => (
          <motion.div
            key={key}
            id={`measurement-card-${key}`}
            variants={card}
            whileHover={{ scale: 1.04, y: -3 }}
            className="relative overflow-hidden rounded-2xl p-4"
            style={{
              background: `linear-gradient(135deg, ${from}22, ${to}11)`,
              border: `1px solid ${from}44`,
              boxShadow: `0 4px 20px ${from}22`,
            }}
          >
            {/* Glow blob */}
            <div
              className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-30"
              style={{ background: `radial-gradient(circle, ${to}, transparent)` }}
            />
            <div className="relative flex items-center gap-3">
              {/* Icon badge */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 4px 14px ${from}66` }}
              >
                {emoji}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: `${from}cc` }}>{label}</p>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-black leading-tight"
                  style={{ color: '#f3e8ff' }}
                >
                  {measurements[key]}
                  <span className="text-xs font-medium ml-1" style={{ color: 'rgba(196,181,253,0.6)' }}>cm</span>
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl px-4 py-3 flex items-start gap-3"
        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
      >
        <span className="text-xl flex-shrink-0">⚠️</span>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(253,230,138,0.85)' }}>
          These are <strong>AI-estimated</strong> values. Verify with a tailor or measuring tape for precise stitching.
        </p>
      </motion.div>

      {/* Copy button */}
      <motion.button
        id="copy-measurements-btn"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={copyAll}
        className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        style={{
          background: 'rgba(124,58,237,0.15)',
          border: '1.5px dashed rgba(124,58,237,0.5)',
          color: '#c4b5fd',
        }}
      >
        📋 Copy all measurements
      </motion.button>
    </div>
  );
};

export default MeasurementPreview;

