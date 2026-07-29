/**
 * gemini.service.js
 * Handles communication with Google Gemini AI and graceful smart fallback styling.
 */

const { GoogleGenAI } = require('@google/genai');
const { getOutfitPrompt, getSmartFallbackAdvice } = require('../prompts/outfitPrompt');

async function generateStyleAdvice(style, bodyProfile = {}) {
    const apiKey = process.env.GEMINI_API_KEY;

    // Check if API key is unconfigured or default placeholder
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '') {
        console.log('ℹ️ [Gemini Service] Using Smart Styling Engine (GEMINI_API_KEY unconfigured)');
        return {
            advice: getSmartFallbackAdvice(style, bodyProfile),
            source: 'smart_engine'
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = getOutfitPrompt(style, bodyProfile);

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 1024
            }
        });

        const rawText = response.text.trim();
        const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

        const advice = JSON.parse(jsonText);
        return {
            advice,
            source: 'gemini'
        };
    } catch (err) {
        console.warn('⚠️ [Gemini Service] API error, falling back to Smart Styling Engine:', err.message);
        return {
            advice: getSmartFallbackAdvice(style, bodyProfile),
            source: 'smart_engine_fallback'
        };
    }
}

module.exports = {
    generateStyleAdvice
};
