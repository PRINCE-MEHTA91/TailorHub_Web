// src/services/measurementApi.js
// ─────────────────────────────────────────────────────────────────────────────
// Sends height + front/side photos to the Node.js server which proxies the
// request to the Python MediaPipe measurement engine.
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
  const formData = new FormData();
  formData.append('heightCm',   String(heightCm));
  formData.append('frontPhoto', frontPhoto);
  formData.append('sidePhoto',  sidePhoto);

  const res = await fetch(`${API_URL}/api/measurements/calculate`, {
    method:      'POST',
    body:        formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error(err.error || 'Failed to calculate measurements');
  }

  return res.json();
}
