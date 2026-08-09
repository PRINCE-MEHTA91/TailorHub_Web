// src/components/ImageUpload.js
import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUpload = ({ id, label, hint, icon, accentFrom, accentTo, file, previewUrl, onChange }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    (f) => {
      if (!f || !f.type.startsWith('image/')) return;
      onChange(f, URL.createObjectURL(f));
    },
    [onChange],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const from = accentFrom || '#7c3aed';
  const to   = accentTo   || '#a855f7';

  return (
    <motion.div
      id={`${id}-upload-zone`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !file && inputRef.current?.click()}
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      whileHover={!file ? { scale: 1.02 } : {}}
      whileTap={!file ? { scale: 0.98 } : {}}
      className="relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        minHeight: 220,
        background: file
          ? 'transparent'
          : dragging
          ? `linear-gradient(135deg, ${from}33, ${to}33)`
          : 'rgba(255,255,255,0.04)',
        border: `2px dashed ${file ? 'transparent' : dragging ? from : 'rgba(255,255,255,0.15)'}`,
        boxShadow: dragging ? `0 0 30px ${from}55` : 'none',
      }}
    >
      <input
        ref={inputRef}
        id={`${id}-file-input`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => processFile(e.target.files[0])}
      />

      <AnimatePresence mode="wait">
        {previewUrl ? (
          /* ── Preview ── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full h-full"
          >
            <img
              src={previewUrl}
              alt={`${label} preview`}
              className="w-full object-cover rounded-3xl"
              style={{ maxHeight: 260, objectPosition: 'top' }}
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 rounded-3xl flex items-end p-4"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className="flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 2px 12px ${from}88` }}
                >
                  ✓ {label}
                </span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleRemove}
                  id={`${id}-remove-btn`}
                  className="text-white/80 hover:text-white bg-black/40 hover:bg-red-500 rounded-full p-1.5 transition-colors"
                  title="Remove"
                >
                  ✕
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Idle ── */
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-10 px-5 text-center h-full"
          >
            {/* Animated icon ring */}
            <motion.div
              animate={{ rotate: dragging ? 360 : 0, scale: dragging ? 1.2 : 1 }}
              transition={{ duration: 0.6 }}
              className="relative flex items-center justify-center w-16 h-16 rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${from}22, ${to}33)`, border: `1.5px solid ${from}44` }}
            >
              <span className="text-3xl">{icon}</span>
              {/* Pulse ring when dragging */}
              {dragging && (
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: `2px solid ${from}` }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </motion.div>

            <div>
              <p className="font-bold text-sm" style={{ color: '#e9d5ff' }}>{label}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(167,139,250,0.6)' }}>{hint}</p>
            </div>

            <motion.div
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full"
              style={{
                background: dragging ? `linear-gradient(135deg,${from},${to})` : 'rgba(255,255,255,0.08)',
                color: dragging ? '#fff' : '#c4b5fd',
                boxShadow: dragging ? `0 4px 20px ${from}66` : 'none',
                border: `1px solid ${dragging ? 'transparent' : 'rgba(167,139,250,0.2)'}`,
              }}
            >
              {dragging ? '🎯 Drop it!' : '☁️ Upload / Drag'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageUpload;

