/**
 * gemini.service.js
 * Handles communication with OpenRouter AI (nvidia/nemotron-3-ultra-550b-a55b)
 * and graceful smart fallback styling.
 */

const { getOutfitPrompt, getSmartFallbackAdvice } = require('../prompts/outfitPrompt');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function generateStyleAdvice(style, bodyProfile = {}, language = 'english') {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model  = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';

    // Check if API key is unconfigured or default placeholder
    if (!apiKey || apiKey.trim() === '') {
        console.log('ℹ️ [AI Service] Using Smart Styling Engine (OPENROUTER_API_KEY unconfigured)');
        return {
            advice: getSmartFallbackAdvice(style, bodyProfile, language),
            source: 'smart_engine'
        };
    }

    const prompt = getOutfitPrompt(style, bodyProfile, language);

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.CLIENT_URL || 'https://tailorhub.app',
                'X-Title': 'TailorHub Style Advisor'
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`OpenRouter HTTP ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        const rawText = data?.choices?.[0]?.message?.content?.trim();

        if (!rawText) {
            throw new Error('Empty response from OpenRouter');
        }

        // Strip potential markdown code fences
        const jsonText = rawText
            .replace(/^```(?:json)?\n?/, '')
            .replace(/\n?```$/, '')
            .trim();

        const advice = JSON.parse(jsonText);

        return {
            advice,
            source: 'openrouter_nemotron'
        };

    } catch (err) {
        console.warn('⚠️ [AI Service] OpenRouter error, falling back to Smart Styling Engine:', err.message);
        return {
            advice: getSmartFallbackAdvice(style, bodyProfile, language),
            source: 'smart_engine_fallback'
        };
    }
}

module.exports = {
    generateStyleAdvice
};
