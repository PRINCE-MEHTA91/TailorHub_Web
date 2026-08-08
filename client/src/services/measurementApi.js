// src/services/measurementApi.js
// ─────────────────────────────────────────────────────────────────────────────
// Central API layer for the Body Measurement feature.
// Step 1: UI-only stub – returns a mock response so React works correctly.
// Step 2 (later): Replace the stub with a real multipart/form-data POST to
//                 /api/measurements/calculate once the Node + OpenCV back-end
//                 is ready.
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = process.env.REACT_APP_API_URL || 'https://tailorhub-web.onrender.com';

/**
 * calculateMeasurements
 * Sends height, front photo, and side photo to the back-end and returns
 * estimated body measurements.
 *
 * @param {Object} params
 * @param {number} params.heightCm   - User's height in centimetres
 * @param {File}   params.frontPhoto - Front-view image File object
 * @param {File}   params.sidePhoto  - Side-view image File object
 * @returns {Promise<Object>}        - Measurement result object
 */
export async function calculateMeasurements({ heightCm, frontPhoto, sidePhoto }) {
  // ── STUB (Step 1) ──────────────────────────────────────────────────────────
  // Simulate a 2-second network call and return plausible mock values.
  // Remove this block and uncomment the real fetch below in Step 2.
  await new Promise((res) => setTimeout(res, 2000));
  return {
    chest:    Math.round(heightCm * 0.52),
    waist:    Math.round(heightCm * 0.43),
    hips:     Math.round(heightCm * 0.54),
    shoulder: Math.round(heightCm * 0.24),
    sleeve:   Math.round(heightCm * 0.33),
    inseam:   Math.round(heightCm * 0.47),
    neck:     Math.round(heightCm * 0.20),
  };
  // ── REAL IMPLEMENTATION (Step 2) ──────────────────────────────────────────
  // const formData = new FormData();
  // formData.append('heightCm', heightCm);
  // formData.append('frontPhoto', frontPhoto);
  // formData.append('sidePhoto', sidePhoto);
  //
  // const res = await fetch(`${API_URL}/api/measurements/calculate`, {
  //   method: 'POST',
  //   body: formData,
  //   credentials: 'include',
  // });
  //
  // if (!res.ok) {
  //   const err = await res.json().catch(() => ({ message: 'Server error' }));
  //   throw new Error(err.message || 'Failed to calculate measurements');
  // }
  //
  // return res.json();
}
