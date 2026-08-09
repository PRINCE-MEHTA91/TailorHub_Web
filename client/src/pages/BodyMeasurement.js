// src/pages/BodyMeasurement.js
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HeightInput from "../components/HeightInput";
import ImageUpload from "../components/ImageUpload";
import MeasurementPreview from "../components/MeasurementPreview";
import { calculateMeasurements } from "../services/measurementApi";

// Animated blobs background
const BLOBS = [
  { color: "#7c3aed", size: 500, top: "-15%", left: "-10%", dur: 18 },
  { color: "#ec4899", size: 380, top: "55%", left: "-8%", dur: 22 },
  { color: "#3b82f6", size: 420, top: "5%", right: "-8%", dur: 20 },
  { color: "#f59e0b", size: 280, top: "70%", right: "-5%", dur: 25 },
  { color: "#10b981", size: 220, top: "35%", left: "45%", dur: 30 },
];

const Blobs = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
    {BLOBS.map((b, i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute",
          width: b.size,
          height: b.size,
          borderRadius: "50%",
          opacity: 0.2,
          filter: "blur(80px)",
          background: b.color,
          top: b.top,
          left: b.left,
          right: b.right,
        }}
        animate={{ x: [0, 30, -20, 15, 0], y: [0, -25, 20, -10, 0], scale: [1, 1.08, 0.95, 1.04, 1] }}
        transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const STEPS = [
  { label: "Height", icon: "📏" },
  { label: "Photos", icon: "📸" },
  { label: "Results", icon: "✨" },
];

const StepBar = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
    {STEPS.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={s.label}>
          <motion.div animate={{ scale: active ? 1.1 : 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <motion.div
              style={{
                width: "44px", height: "44px", borderRadius: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontWeight: 900,
                background: done ? "linear-gradient(135deg,#7c3aed,#a855f7)" : active ? "linear-gradient(135deg,#ec4899,#f43f5e)" : "rgba(255,255,255,0.08)",
                border: active ? "2px solid rgba(244,63,94,0.6)" : done ? "none" : "1.5px solid rgba(255,255,255,0.1)",
                boxShadow: active ? "0 0 20px rgba(244,63,94,0.5)" : done ? "0 0 14px rgba(124,58,237,0.4)" : "none",
                color: done || active ? "#fff" : "rgba(167,139,250,0.4)",
                transition: "all 0.3s",
              }}
            >
              {done ? "✓" : s.icon}
            </motion.div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: active ? "#f9a8d4" : done ? "#c4b5fd" : "rgba(167,139,250,0.3)" }}>
              {s.label}
            </span>
          </motion.div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, margin: "0 8px 20px", height: "2px", borderRadius: "2px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <motion.div
                style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: "2px" }}
                animate={{ width: i < current ? "100%" : "0%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const TIPS = [
  { emoji: "💡", text: "Stand straight, arms slightly away from sides." },
  { emoji: "👕", text: "Wear form-fitting clothes for best accuracy." },
  { emoji: "📱", text: "Ask someone to take photos — avoid selfies." },
  { emoji: "🌅", text: "Use a plain, well-lit background." },
];

const Glass = ({ children, style = {} }) => (
  <div style={{
    borderRadius: "24px", padding: "20px",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    ...style,
  }}>
    {children}
  </div>
);

const MEASURE_POINTS = [
  { label: "Shoulder Width", color: "#60efff" },
  { label: "Chest", color: "#a78bfa" },
  { label: "Waist", color: "#f472b6" },
  { label: "Hip", color: "#60efff" },
  { label: "Bicep", color: "#fbbf24" },
  { label: "Thigh", color: "#34d399" },
];

const PosturePanel = ({ step }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "20px 16px",
    height: "100%", boxSizing: "border-box",
    overflow: "hidden", position: "relative",
  }}>
    {/* Header */}
    <div style={{ textAlign: "center", marginBottom: "12px", zIndex: 2, width: "100%" }}>
      <p style={{ color: "rgba(167,139,250,0.5)", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 3px" }}>
        Measurement Guide
      </p>
      <h3 style={{ color: "#e9d5ff", fontSize: "14px", fontWeight: 900, margin: 0 }}>Correct Posture</h3>
    </div>

    {/* Image area */}
    <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 0 }}>
      {/* Glow */}
      <div style={{
        position: "absolute", width: "160px", height: "160px",
        background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)",
        borderRadius: "50%", top: "50%", left: "50%", transform: "translate(-50%,-50%)", filter: "blur(30px)",
      }} />
      {/* Body image */}
      <motion.img
        src="/body-measurement-posture.png"
        alt="Body measurement posture"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          maxHeight: "340px", width: "auto", objectFit: "contain",
          position: "relative", zIndex: 2,
          filter: "drop-shadow(0 0 18px rgba(96,239,255,0.3)) drop-shadow(0 0 36px rgba(124,58,237,0.2))",
        }}
      />
      {/* Scanning line */}
      <motion.div
        animate={{ top: ["8%", "88%", "8%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", left: "8%", right: "8%", height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(96,239,255,0.9), transparent)",
          boxShadow: "0 0 12px rgba(96,239,255,0.7)", zIndex: 3, borderRadius: "2px",
        }}
      />
    </div>

    {/* Measurement labels */}
    <div style={{ width: "100%", marginTop: "14px", zIndex: 2 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
        {MEASURE_POINTS.map((pt, idx) => (
          <motion.div
            key={pt.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 + 0.4 }}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "4px 7px", borderRadius: "7px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${pt.color}33`,
            }}
          >
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: pt.color, flexShrink: 0, boxShadow: `0 0 5px ${pt.color}` }} />
            <span style={{ color: "rgba(196,181,253,0.8)", fontSize: "10px", fontWeight: 600 }}>{pt.label}</span>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Step hint */}
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        style={{
          marginTop: "12px", padding: "10px 12px", borderRadius: "12px",
          background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)",
          textAlign: "center", zIndex: 2, width: "100%", boxSizing: "border-box",
        }}
      >
        <p style={{ color: "rgba(196,181,253,0.85)", fontSize: "11px", fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
          {step === 0 && "📏 Your height is used as scale reference for all body measurements."}
          {step === 1 && "📸 Stand in this posture for the most accurate AI scan results."}
          {step === 2 && "✨ Measurements calculated! Save them to your tailor profile."}
        </p>
      </motion.div>
    </AnimatePresence>
  </div>
);

const BodyMeasurementPage = () => {
  const navigate = useNavigate();
  const [step, setStep]            = useState(0);
  const [heightCm, setHeightCm]    = useState(0);
  const [frontFile, setFrontFile]  = useState(null);
  const [frontPreview, setFP]      = useState(null);
  const [sideFile, setSideFile]    = useState(null);
  const [sidePreview, setSP]       = useState(null);
  const [measurements, setMeasure] = useState(null);
  const [loading, setLoading]      = useState(false);
  const [error, setError]          = useState("");

  const handleFront = useCallback((f, u) => { setFrontFile(f); setFP(u); }, []);
  const handleSide  = useCallback((f, u) => { setSideFile(f); setSP(u); }, []);

  const canNext      = heightCm >= 100 && heightCm <= 250;
  const canCalculate = frontFile && sideFile;

  const handleCalculate = async () => {
    setError(""); setLoading(true);
    try {
      const res = await calculateMeasurements({ heightCm, frontPhoto: frontFile, sidePhoto: sideFile });
      setMeasure(res);
      setStep(2);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0); setHeightCm(0);
    setFrontFile(null); setFP(null);
    setSideFile(null); setSP(null);
    setMeasure(null); setError("");
  };

  const slide = {
    initial: { opacity: 0, x: 60, scale: 0.97 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit:    { opacity: 0, x: -60, scale: 0.97, transition: { duration: 0.25 } },
  };

  const btn = (enabled, grad) => ({
    border: "none", cursor: enabled ? "pointer" : "not-allowed",
    padding: "15px", borderRadius: "16px", fontWeight: 900, fontSize: "13px",
    transition: "all 0.3s",
    ...(enabled ? grad : { background: "rgba(255,255,255,0.06)", color: "rgba(167,139,250,0.3)" }),
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(135deg, #0f0c29 0%, #1a0533 40%, #0d1b40 100%)",
      fontFamily: "'Poppins', 'Inter', sans-serif", position: "relative",
    }}>
      <Blobs />

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        padding: "10px 24px",
        background: "rgba(15,12,41,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0,
      }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
          <motion.button
            id="body-measurement-back-btn"
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            style={{
              padding: "8px 14px", borderRadius: "12px",
              background: "rgba(255,255,255,0.07)", color: "#c4b5fd",
              border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
              fontSize: "13px", fontWeight: 700,
            }}
          >
            ← Back
          </motion.button>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: "#f3e8ff", fontSize: "16px", fontWeight: 900, margin: 0 }}>Body Measurement</h1>
            <p style={{ color: "rgba(167,139,250,0.6)", fontSize: "11px", margin: 0 }}>AI-powered size estimator</p>
          </div>
          {/* Step chips */}
          <div style={{ display: "flex", gap: "6px" }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                transition: "all 0.3s",
                background: i === step ? "linear-gradient(135deg,#ec4899,#f43f5e)" : i < step ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(255,255,255,0.06)",
                color: i <= step ? "#fff" : "rgba(167,139,250,0.3)",
                border: i > step ? "1px solid rgba(255,255,255,0.08)" : "none",
                boxShadow: i === step ? "0 0 14px rgba(244,63,94,0.4)" : "none",
              }}>
                {i < step ? "✓ " : ""}{s.label}
              </div>
            ))}
          </div>
          <motion.span
            animate={{ boxShadow: ["0 0 10px #a855f7aa", "0 0 24px #ec4899aa", "0 0 10px #a855f7aa"] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontSize: "11px", fontWeight: 700, padding: "6px 14px", borderRadius: "20px",
              background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff",
            }}
          >
            ⚡ AI Beta
          </motion.span>
        </div>
      </div>

      {/* 3-column layout */}
      <div style={{
        flex: 1, maxWidth: "1440px", width: "100%", margin: "0 auto",
        padding: "20px 24px 24px",
        display: "grid",
        gridTemplateColumns: "270px 1fr 250px",
        gap: "18px",
        position: "relative", zIndex: 10, boxSizing: "border-box",
        alignItems: "stretch",
      }}>

        {/* LEFT — Posture Image */}
        <div style={{ minHeight: 0 }}>
          <PosturePanel step={step} />
        </div>

        {/* CENTER — Wizard */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>
          <Glass>
            <StepBar current={step} />
          </Glass>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <AnimatePresence mode="wait">

              {/* STEP 0 HEIGHT */}
              {step === 0 && (
                <motion.div key="height" {...slide} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Glass style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "16px", flexShrink: 0,
                        background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                        boxShadow: "0 6px 20px rgba(124,58,237,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
                      }}>📏</div>
                      <div>
                        <h2 style={{ color: "#f3e8ff", fontSize: "18px", fontWeight: 900, margin: 0 }}>Enter your height</h2>
                        <p style={{ color: "rgba(167,139,250,0.65)", fontSize: "13px", margin: "4px 0 0" }}>Used as the reference scale for all estimates</p>
                      </div>
                    </div>

                    <HeightInput heightCm={heightCm} onChange={setHeightCm} />

                    {heightCm > 0 && !canNext && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                        background: "rgba(239,68,68,0.15)", color: "#fca5a5",
                        border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px",
                        padding: "10px 16px", fontSize: "12px", fontWeight: 600, textAlign: "center", margin: 0,
                      }}>
                        ⚠️ Please enter a height between 100–250 cm
                      </motion.p>
                    )}

                    <div style={{ flex: 1 }} />

                    <motion.button
                      id="proceed-to-photos-btn"
                      whileHover={canNext ? { scale: 1.02, y: -2 } : {}}
                      whileTap={canNext ? { scale: 0.97 } : {}}
                      disabled={!canNext}
                      onClick={() => setStep(1)}
                      style={{
                        ...btn(canNext, { background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", boxShadow: "0 8px 30px rgba(124,58,237,0.5)" }),
                        width: "100%",
                      }}
                    >
                      Continue to Photos →
                    </motion.button>
                  </Glass>
                </motion.div>
              )}

              {/* STEP 1 PHOTOS */}
              {step === 1 && (
                <motion.div key="photos" {...slide} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Glass>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "16px", flexShrink: 0,
                        background: "linear-gradient(135deg,#ec4899,#f43f5e)",
                        boxShadow: "0 6px 20px rgba(236,72,153,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
                      }}>📸</div>
                      <div>
                        <h2 style={{ color: "#f3e8ff", fontSize: "18px", fontWeight: 900, margin: 0 }}>Upload your photos</h2>
                        <p style={{ color: "rgba(167,139,250,0.65)", fontSize: "13px", margin: "4px 0 0" }}>Front view + Side view for best accuracy</p>
                      </div>
                    </div>
                  </Glass>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <Glass style={{ padding: 0, overflow: "hidden" }}>
                      <ImageUpload id="front" label="Front View" hint="Face the camera, feet shoulder-width apart" icon="🧍" accentFrom="#7c3aed" accentTo="#a855f7" file={frontFile} previewUrl={frontPreview} onChange={handleFront} />
                    </Glass>
                    <Glass style={{ padding: 0, overflow: "hidden" }}>
                      <ImageUpload id="side" label="Side View" hint="Stand sideways, arms relaxed at your sides" icon="🚶" accentFrom="#ec4899" accentTo="#f43f5e" file={sideFile} previewUrl={sidePreview} onChange={handleSide} />
                    </Glass>
                  </div>

                  <Glass style={{ padding: "14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {[{ label: "Front photo", ok: !!frontFile }, { label: "Side photo", ok: !!sideFile }].map((item) => (
                        <div key={item.label} style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          fontSize: "12px", fontWeight: 600, padding: "10px 14px", borderRadius: "12px",
                          background: item.ok ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.05)",
                          color: item.ok ? "#6ee7b7" : "rgba(167,139,250,0.4)",
                          border: `1px solid ${item.ok ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"}`,
                          transition: "all 0.3s",
                        }}>
                          {item.ok ? "✅" : "⭕"} {item.label}
                        </div>
                      ))}
                    </div>
                  </Glass>

                  <AnimatePresence>
                    {error && (
                      <motion.div id="measurement-error-msg" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{
                        background: "rgba(239,68,68,0.15)", color: "#fca5a5",
                        border: "1px solid rgba(239,68,68,0.3)", borderRadius: "16px",
                        padding: "12px 16px", fontSize: "13px", fontWeight: 600,
                      }}>
                        ⚠️ {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <motion.button id="back-to-height-btn" whileTap={{ scale: 0.95 }} onClick={() => setStep(0)} style={{
                      flex: 1, padding: "15px", borderRadius: "16px", fontWeight: 700, fontSize: "13px",
                      background: "rgba(255,255,255,0.07)", color: "#c4b5fd",
                      border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
                    }}>← Back</motion.button>
                    <motion.button
                      id="calculate-measurements-btn"
                      whileHover={canCalculate && !loading ? { scale: 1.02, y: -2 } : {}}
                      whileTap={canCalculate && !loading ? { scale: 0.97 } : {}}
                      disabled={!canCalculate || loading}
                      onClick={handleCalculate}
                      style={{
                        flex: 2,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        ...btn(canCalculate && !loading, { background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "#fff", boxShadow: "0 8px 30px rgba(245,158,11,0.5)" }),
                      }}
                    >
                      {loading ? (
                        <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>⚙️</motion.span>Analysing…</>
                      ) : <>⚡ Calculate Measurements</>}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 RESULTS */}
              {step === 2 && (
                <motion.div key="results" {...slide} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }} animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <div style={{ fontSize: "60px" }}>🎉</div>
                  </motion.div>
                  <Glass style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                    <MeasurementPreview measurements={measurements} heightCm={heightCm} />
                    <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
                      <motion.button id="retake-measurements-btn" whileTap={{ scale: 0.95 }} onClick={reset} style={{
                        flex: 1, padding: "14px", borderRadius: "16px", fontWeight: 700, fontSize: "13px",
                        background: "rgba(255,255,255,0.07)", color: "#c4b5fd",
                        border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
                      }}>🔄 Retake</motion.button>
                      <motion.button id="save-measurements-btn" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                        onClick={() => alert("Save to profile — coming in Step 3!")}
                        style={{
                          flex: 2, padding: "14px", borderRadius: "16px", fontWeight: 900, fontSize: "13px",
                          background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff",
                          boxShadow: "0 8px 30px rgba(124,58,237,0.5)", border: "none", cursor: "pointer",
                        }}>
                        💾 Save to My Profile
                      </motion.button>
                    </div>
                  </Glass>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT — Tips sidebar */}
        <div style={{ minWidth: 0 }}>
          <div style={{ position: "sticky", top: "80px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <Glass>
              <h3 style={{ color: "#e9d5ff", fontSize: "13px", fontWeight: 900, margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                💡 Photo Tips
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {TIPS.map((t, i) => (
                  <motion.li key={i}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.3 }}
                    style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12px", color: "rgba(196,181,253,0.75)", lineHeight: 1.5 }}
                  >
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>{t.emoji}</span>
                    <span>{t.text}</span>
                  </motion.li>
                ))}
              </ul>
            </Glass>

            <Glass style={{ textAlign: "center" }}>
              <p style={{ color: "rgba(167,139,250,0.45)", fontSize: "11px", margin: 0 }}>
                🔒 Photos are processed locally and never stored on our servers.
              </p>
            </Glass>

            {heightCm > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Glass style={{ textAlign: "center" }}>
                  <p style={{ color: "rgba(167,139,250,0.5)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 6px" }}>
                    Your height
                  </p>
                  <p style={{ color: "#e9d5ff", fontSize: "36px", fontWeight: 900, margin: 0 }}>
                    {heightCm}<span style={{ color: "#a78bfa", fontSize: "16px", fontWeight: 500, marginLeft: "4px" }}>cm</span>
                  </p>
                </Glass>
              </motion.div>
            )}

            <div style={{
              padding: "14px 16px", borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1))",
              border: "1px solid rgba(124,58,237,0.25)", textAlign: "center",
            }}>
              <p style={{ color: "#c4b5fd", fontSize: "11px", fontWeight: 700, margin: "0 0 4px" }}>⚡ AI Accuracy</p>
              <p style={{ color: "rgba(196,181,253,0.6)", fontSize: "10px", margin: 0, lineHeight: 1.5 }}>
                Up to 95% accuracy with good lighting and correct posture
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        @media (max-width: 1100px) {
          body .bm-main { grid-template-columns: 240px 1fr 220px !important; }
        }
        @media (max-width: 860px) {
          body .bm-main { grid-template-columns: 1fr !important; }
          body .bm-left, body .bm-right { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default BodyMeasurementPage;
