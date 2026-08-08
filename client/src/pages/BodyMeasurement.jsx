// src/pages/BodyMeasurement.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiZap, FiInfo } from 'react-icons/fi';
import HeightInput from '../components/HeightInput';
import ImageUpload from '../components/ImageUpload';
import MeasurementPreview from '../components/MeasurementPreview';
import { calculateMeasurements } from '../services/measurementApi';

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = ['Height', 'Photos', 'Results'];

// ─── Small helper: step indicator ────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center gap-2 justify-center">
    {STEPS.map((label, idx) => {
      const done    = idx < currentStep;
      const active  = idx === currentStep;
      return (
        <React.Fragment key={label}>
          <div className={`flex items-center gap-1.5`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${done   ? 'bg-primary text-white'       : ''}
                ${active ? 'bg-primary text-white ring-4 ring-teal-200' : ''}
                ${!done && !active ? 'bg-gray-200 text-gray-400' : ''}
              `}
            >
              {done ? '✓' : idx + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block transition-colors ${active ? 'text-primary' : done ? 'text-gray-500' : 'text-gray-300'}`}>
              {label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 rounded transition-colors duration-500 ${done ? 'bg-primary' : 'bg-gray-200'}`} style={{ minWidth: 24 }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Tips sidebar content ────────────────────────────────────────────────────
const TIPS = [
  { emoji: '💡', text: 'Stand straight with arms slightly away from your sides.' },
  { emoji: '👕', text: 'Wear form-fitting clothes for more accurate estimates.' },
  { emoji: '📱', text: 'Ask someone to take the photos — selfies reduce accuracy.' },
  { emoji: '🌅', text: 'Use a plain, well-lit background for best results.' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
const BodyMeasurementPage = () => {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [step, setStep]               = useState(0); // 0=Height 1=Photos 2=Results
  const [heightCm, setHeightCm]       = useState(0);
  const [frontFile, setFrontFile]     = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [sideFile, setSideFile]       = useState(null);
  const [sidePreview, setSidePreview] = useState(null);
  const [measurements, setMeasurements] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFrontChange = useCallback((file, url) => {
    setFrontFile(file);
    setFrontPreview(url);
  }, []);

  const handleSideChange = useCallback((file, url) => {
    setSideFile(file);
    setSidePreview(url);
  }, []);

  const canProceedToPhotos = heightCm >= 100 && heightCm <= 250;
  const canCalculate       = frontFile && sideFile;

  const handleCalculate = async () => {
    if (!canCalculate) return;
    setError('');
    setLoading(true);
    try {
      const result = await calculateMeasurements({ heightCm, frontPhoto: frontFile, sidePhoto: sideFile });
      setMeasurements(result);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setHeightCm(0);
    setFrontFile(null);
    setFrontPreview(null);
    setSideFile(null);
    setSidePreview(null);
    setMeasurements(null);
    setError('');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 font-poppins">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <motion.button
            id="body-measurement-back-btn"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-800 leading-tight">Body Measurement</h1>
            <p className="text-xs text-gray-400">AI-powered size estimator</p>
          </div>
          <span className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            <FiZap size={12} /> AI Beta
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:grid lg:grid-cols-3 lg:gap-8">

        {/* ── Left: Main flow (2/3 width on lg) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step indicator */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <StepIndicator currentStep={step} />
          </div>

          {/* ── Step 0: Height ── */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-height"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Step 1 — Enter your height</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    This is used as the reference scale to estimate all other measurements.
                  </p>
                </div>

                <HeightInput heightCm={heightCm} onChange={setHeightCm} />

                {heightCm > 0 && !canProceedToPhotos && (
                  <p className="text-xs text-red-500 flex items-center gap-1.5">
                    <FiInfo size={12} /> Please enter a height between 100–250 cm.
                  </p>
                )}

                <motion.button
                  id="proceed-to-photos-btn"
                  whileTap={{ scale: 0.97 }}
                  disabled={!canProceedToPhotos}
                  onClick={() => setStep(1)}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    canProceedToPhotos
                      ? 'bg-gradient-to-r from-primary to-teal-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Photos →
                </motion.button>
              </motion.div>
            )}

            {/* ── Step 1: Photos ── */}
            {step === 1 && (
              <motion.div
                key="step-photos"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800">Step 2 — Upload your photos</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    We need two photos — one from the front and one from the side.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUpload
                    id="front"
                    label="Front View"
                    hint="Stand facing the camera, feet shoulder-width apart"
                    icon="🧍"
                    file={frontFile}
                    previewUrl={frontPreview}
                    onChange={handleFrontChange}
                  />
                  <ImageUpload
                    id="side"
                    label="Side View"
                    hint="Stand sideways, arms relaxed at your sides"
                    icon="🧍‍♂️"
                    file={sideFile}
                    previewUrl={sidePreview}
                    onChange={handleSideChange}
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      id="measurement-error-msg"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                  <button
                    id="back-to-height-btn"
                    onClick={() => setStep(0)}
                    className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
                  >
                    ← Back
                  </button>

                  <motion.button
                    id="calculate-measurements-btn"
                    whileTap={{ scale: 0.97 }}
                    disabled={!canCalculate || loading}
                    onClick={handleCalculate}
                    className={`flex-[2] py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      canCalculate && !loading
                        ? 'bg-gradient-to-r from-secondary to-orange-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Analysing…
                      </>
                    ) : (
                      <>
                        <FiZap size={15} /> Calculate Measurements
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Results ── */}
            {step === 2 && (
              <motion.div
                key="step-results"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5"
              >
                <MeasurementPreview measurements={measurements} heightCm={heightCm} />

                <div className="flex gap-3 pt-2">
                  <button
                    id="retake-measurements-btn"
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
                  >
                    🔄 Retake
                  </button>
                  <motion.button
                    id="save-measurements-btn"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => alert('Save to profile — coming in Step 3!')}
                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-primary to-teal-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    💾 Save to My Profile
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Tips panel (lg only) ── */}
        <div className="hidden lg:block space-y-4 pt-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FiInfo size={15} className="text-primary" /> Photo Tips
            </h3>
            <ul className="space-y-3">
              {TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                  <span className="text-lg flex-shrink-0">{tip.emoji}</span>
                  <span>{tip.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Photos are processed locally and never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyMeasurementPage;
