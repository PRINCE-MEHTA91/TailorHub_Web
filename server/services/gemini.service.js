/**
 * gemini.service.js
 * Handles communication with Google Gemini AI (gemini-2.5-flash)
 * using the official @google/genai SDK.
 *
 * Falls back to the built-in Smart Styling Engine if:
 *   - GEMINI_API_KEY is not set
 *   - The API call fails for any reason
 */

const { GoogleGenAI } = require('@google/genai');
const { getOutfitPrompt, getSmartFallbackAdvice } = require('../prompts/outfitPrompt');

// Model to use — gemini-3.6-flash is fast, free-tier friendly, and available
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

async function generateStyleAdvice(style, bodyProfile = {}, language = 'english') {
    const apiKey = process.env.GEMINI_API_KEY;

    // Fall back to Smart Styling Engine if key is missing or is placeholder
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        console.log('ℹ️  [AI Service] Using Smart Styling Engine (GEMINI_API_KEY not configured)');
        return {
            advice: getSmartFallbackAdvice(style, bodyProfile, language),
            source: 'smart_engine'
        };
    }

    const prompt = getOutfitPrompt(style, bodyProfile, language);

    try {
        const genAI = new GoogleGenAI({ apiKey });

        const response = await genAI.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                temperature:      0.7,
                maxOutputTokens:  4096,
                responseMimeType: 'application/json',  // forces valid complete JSON output
            },
        });

        const rawText = response?.text?.trim?.() ?? '';

        if (!rawText) {
            throw new Error('Empty response from Gemini');
        }

        // Strip potential markdown code fences Gemini sometimes adds
        const jsonText = rawText
            .replace(/^```(?:json)?\n?/, '')
            .replace(/\n?```$/, '')
            .trim();

        const advice = JSON.parse(jsonText);

        return {
            advice,
            source: 'gemini'
        };

    } catch (err) {
        console.warn('⚠️  [AI Service] Gemini error, falling back to Smart Styling Engine:', err.message);
        return {
            advice: getSmartFallbackAdvice(style, bodyProfile, language),
            source: 'smart_engine_fallback'
        };
    }
}

module.exports = {
    generateStyleAdvice
};

