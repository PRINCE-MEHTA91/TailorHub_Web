// src/components/ImageUpload.jsx
import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX, FiCheckCircle } from 'react-icons/fi';

/**
 * ImageUpload
 * A drag-and-drop / click-to-upload zone that shows an image preview.
 *
 * Props:
 *   id          – unique id prefix (e.g. "front" | "side")
 *   label       – heading text
 *   hint        – helper text shown below label
 *   icon        – React node (emoji or icon) shown in idle state
 *   file        – currently selected File | null
 *   previewUrl  – Object URL for the current file | null
 *   onChange    – (file, previewUrl) => void
 */
const ImageUpload = ({ id, label, hint, icon, file, previewUrl, onChange }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    (f) => {
      if (!f || !f.type.startsWith('image/')) return;
      const url = URL.createObjectURL(f);
      onChange(f, url);
    },
    [onChange],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    processFile(f);
  };

  const handleChange = (e) => processFile(e.target.files[0]);

  const handleRemove = (e) => {
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      id={`${id}-upload-zone`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden
        ${dragging ? 'border-primary bg-teal-50 scale-[1.01]' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-teal-50'}
      `}
      style={{ minHeight: 200 }}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={`${id}-file-input`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      <AnimatePresence mode="wait">
        {previewUrl ? (
          /* ── Preview State ── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full h-full"
          >
            <img
              src={previewUrl}
              alt={`${label} preview`}
              className="w-full object-cover"
              style={{ maxHeight: 280, objectPosition: 'top' }}
            />
            {/* Overlay badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4 gap-2">
              <span className="flex items-center gap-1.5 text-white text-xs font-semibold bg-green-500 px-3 py-1.5 rounded-full shadow">
                <FiCheckCircle /> {label} ready
              </span>
            </div>
            {/* Remove button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleRemove}
              id={`${id}-remove-btn`}
              className="absolute top-3 right-3 bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 rounded-full p-1.5 shadow-md transition-colors"
              title="Remove image"
            >
              <FiX size={16} />
            </motion.button>
          </motion.div>
        ) : (
          /* ── Idle / Drag State ── */
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center"
          >
            <div className={`text-5xl transition-transform duration-300 ${dragging ? 'scale-125' : ''}`}>
              {icon || '📷'}
            </div>
            <div>
              <p className="font-semibold text-gray-700">{label}</p>
              <p className="text-xs text-gray-400 mt-1">{hint}</p>
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-colors duration-200
              ${dragging ? 'border-primary text-primary bg-teal-50' : 'border-gray-300 text-gray-500'}
            `}>
              <FiUploadCloud size={16} />
              {dragging ? 'Drop it here!' : 'Click or drag & drop'}
            </div>
            <p className="text-xs text-gray-300">JPG, PNG, WEBP — max 10 MB</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;
