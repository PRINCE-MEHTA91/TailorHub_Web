/**
 * ai.routes.js
 * Express routes for AI-powered tailoring and style recommendations.
 */

const express = require('express');
const router = express.Router();
const { getStyleAdvice } = require('../controllers/ai.controller');

// Route: POST /api/ai-style-advice or /api/ai/style-advice
router.post('/ai-style-advice', getStyleAdvice);
router.post('/style-advice', getStyleAdvice);

module.exports = router;
