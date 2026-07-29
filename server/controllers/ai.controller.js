/**
 * ai.controller.js
 * Controller for AI recommendation and style advisor endpoints.
 */

const { generateStyleAdvice } = require('../services/gemini.service');

async function getStyleAdvice(req, res) {
    try {
        const { style, bodyProfile } = req.body;

        if (!style) {
            return res.status(400).json({
                success: false,
                error: 'Style category is required'
            });
        }

        const result = await generateStyleAdvice(style, bodyProfile || {});

        return res.status(200).json({
            success: true,
            advice: result.advice,
            source: result.source
        });
    } catch (error) {
        console.error('❌ [AI Controller Error]:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate style advice.'
        });
    }
}

module.exports = {
    getStyleAdvice
};
