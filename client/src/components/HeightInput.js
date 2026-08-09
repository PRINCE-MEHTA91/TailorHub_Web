// src/components/HeightInput.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeightInput = ({ heightCm, onChange }) => {
  const [unit, setUnit] = useState('cm');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');

  const handleFeetChange = (f) => {
    setFeet(f);
    const ft = parseFloat(f) || 0;
    const inc = parseFloat(inches) || 0;
    onChange(Math.round(ft * 30.48 + inc * 2.54));
  };
  const handleInchChange = (i) => {
    setInches(i);
    const ft = parseFloat(feet) || 0;
    const inc = parseFloat(i) || 0;
    onChange(Math.round(ft * 30.48 + inc * 2.54));
  };
  const handleCmChange = (v) => onChange(parseFloat(v) || 0);

  const switchUnit = (u) => {
    setUnit(u);
    if (u === 'ft' && heightCm) {
      const totalIn = heightCm / 2.54;
      setFeet(String(Math.floor(totalIn / 12)));
      setInches(String(Math.round(totalIn % 12)));
    }
  };

  // Visual height bar (100-250cm range)
  const pct = heightCm ? Math.min(100, Math.max(0, ((heightCm - 100) / 150) * 100)) : 0;

  return (
    <div className="space-y-5">
      {/* Unit toggle pills */}
      <div className="flex gap-2">
        {['cm', 'ft'].map((u) => (
          <motion.button
            key={u}
            id={`height-unit-${u}`}
            whileTap={{ scale: 0.93 }}
            onClick={() => switchUnit(u)}
            className="relative px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 overflow-hidden"
            style={
              unit === u
                ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }
                : { background: 'rgba(255,255,255,0.15)', color: '#a78bfa', border: '1.5px solid rgba(167,139,250,0.3)' }
            }
          >
            {u.toUpperCase()}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {unit === 'cm' ? (
          <motion.div key="cm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {/* Big cm input */}
            <div className="relative">
              <input
                id="height-cm-input"
                type="number"
                min="100"
                max="250"
                value={heightCm || ''}
                onChange={(e) => handleCmChange(e.target.value)}
                placeholder="175"
                className="w-full text-center text-5xl font-black py-6 rounded-3xl border-0 outline-none bg-transparent"
                style={{ color: '#e9d5ff', caretColor: '#a855f7', letterSpacing: '-1px' }}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold" style={{ color: '#a78bfa' }}>cm</span>
            </div>

            {/* Visual bar */}
            <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg,#7c3aed,#a855f7,#ec4899)' }}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium" style={{ color: 'rgba(167,139,250,0.5)' }}>
              <span>100 cm</span>
              <span>175 cm</span>
              <span>250 cm</span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="ft" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex gap-4">
            {[
              { id: 'height-feet-input', val: feet, onChange: handleFeetChange, label: 'ft', min: 3, max: 8, placeholder: '5' },
              { id: 'height-inches-input', val: inches, onChange: handleInchChange, label: 'in', min: 0, max: 11, placeholder: '9' },
            ].map((f) => (
              <div key={f.label} className="flex-1 relative">
                <input
                  id={f.id}
                  type="number"
                  min={f.min}
                  max={f.max}
                  value={f.val}
                  onChange={(e) => f.onChange(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full text-center text-4xl font-black py-5 rounded-3xl border-0 outline-none bg-transparent"
                  style={{ color: '#e9d5ff', caretColor: '#a855f7' }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: '#a78bfa' }}>{f.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Converted hint */}
      <AnimatePresence>
        {heightCm >= 100 && heightCm <= 250 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-full mx-auto w-fit"
            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <span className="text-sm font-semibold" style={{ color: '#c4b5fd' }}>
              ✓ {unit === 'ft' ? `≈ ${heightCm} cm` : `≈ ${Math.floor(heightCm / 30.48)}′${Math.round((heightCm % 30.48) / 2.54)}″`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeightInput;

