// src/components/HeightInput.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * HeightInput
 * A stylised height input supporting cm (default) and ft/in.
 * Notifies parent with the centimetre value via `onChange(cm)`.
 */
const HeightInput = ({ heightCm, onChange }) => {
  const [unit, setUnit] = React.useState('cm');
  const [feet, setFeet]   = React.useState('');
  const [inches, setInches] = React.useState('');

  // Convert ft+in → cm whenever unit = ft
  const handleFeetChange = (f) => {
    setFeet(f);
    const ft = parseFloat(f) || 0;
    const inc = parseFloat(inches) || 0;
    onChange(Math.round((ft * 30.48) + (inc * 2.54)));
  };
  const handleInchChange = (i) => {
    setInches(i);
    const ft = parseFloat(feet) || 0;
    const inc = parseFloat(i) || 0;
    onChange(Math.round((ft * 30.48) + (inc * 2.54)));
  };

  const handleCmChange = (v) => {
    onChange(parseFloat(v) || 0);
  };

  const switchUnit = (u) => {
    setUnit(u);
    if (u === 'ft') {
      // Convert current cm to ft+in
      const totalIn = heightCm / 2.54;
      setFeet(String(Math.floor(totalIn / 12)));
      setInches(String(Math.round(totalIn % 12)));
    }
  };

  return (
    <div className="space-y-3">
      {/* Unit toggle */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 w-fit">
        {['cm', 'ft'].map((u) => (
          <motion.button
            key={u}
            id={`height-unit-${u}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => switchUnit(u)}
            className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              unit === u
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {u}
          </motion.button>
        ))}
      </div>

      {unit === 'cm' ? (
        <div className="relative">
          <input
            id="height-cm-input"
            type="number"
            min="100"
            max="250"
            value={heightCm || ''}
            onChange={(e) => handleCmChange(e.target.value)}
            placeholder="e.g. 175"
            className="w-full px-4 py-3 pr-16 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-800 text-lg font-medium transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
            cm
          </span>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              id="height-feet-input"
              type="number"
              min="3"
              max="8"
              value={feet}
              onChange={(e) => handleFeetChange(e.target.value)}
              placeholder="5"
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-800 text-lg font-medium transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">ft</span>
          </div>
          <div className="relative flex-1">
            <input
              id="height-inches-input"
              type="number"
              min="0"
              max="11"
              value={inches}
              onChange={(e) => handleInchChange(e.target.value)}
              placeholder="9"
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-800 text-lg font-medium transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">in</span>
          </div>
        </div>
      )}

      {/* Live centimetre hint when in ft mode */}
      {unit === 'ft' && heightCm > 0 && (
        <p className="text-xs text-gray-400 pl-1">≈ {heightCm} cm</p>
      )}
    </div>
  );
};

export default HeightInput;
