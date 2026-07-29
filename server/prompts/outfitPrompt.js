/**
 * outfitPrompt.js
 * Builds structured prompts for Gemini AI style advisor and provides an intelligent fallback engine.
 */

function getOutfitPrompt(style, bodyProfile = {}) {
    const { gender, skinTone, bodyShape, height, weight } = bodyProfile;
    const bmi = height && weight ? (weight / ((height / 100) ** 2)).toFixed(1) : null;

    return `You are a professional fashion stylist and personal shopping advisor for Indian clothing. 
A customer is looking for ${style} wear and has the following profile:
- Gender: ${gender || 'not specified'}
- Skin Tone: ${skinTone || 'not specified'}
- Body Shape: ${bodyShape || 'not specified'}
- Height: ${height ? height + 'cm' : 'not specified'}
- Weight: ${weight ? weight + 'kg' : 'not specified'}
${bmi ? `- BMI: ${bmi}` : ''}

Please provide personalized style advice in the following JSON format ONLY (no markdown, no extra text):
{
  "headline": "A short punchy style headline for this person (max 10 words)",
  "summary": "2-3 sentence personalized overview of what suits them best",
  "colorPalette": {
    "recommended": ["Color 1", "Color 2", "Color 3", "Color 4"],
    "avoid": ["Color A", "Color B"],
    "reason": "Brief reason based on skin tone"
  },
  "fabrics": ["Fabric 1", "Fabric 2", "Fabric 3"],
  "fitTips": ["Tip 1 about their body shape", "Tip 2", "Tip 3"],
  "outfitIdeas": ["Outfit idea 1 specific to ${style}", "Outfit idea 2", "Outfit idea 3"],
  "dos": ["Do 1", "Do 2", "Do 3"],
  "donts": ["Don't 1", "Don't 2", "Don't 3"],
  "accessoryTip": "One specific accessory recommendation"
}`;
}

/**
 * Intelligent Smart Styling Fallback Engine
 * Automatically generates customized styling advice when Gemini API is offline or key is unconfigured.
 */
function getSmartFallbackAdvice(style = 'formal', bodyProfile = {}) {
    const { gender = 'not specified', skinTone = 'medium', bodyShape = 'average', height = 170, weight = 65 } = bodyProfile;

    const colorMap = {
        fair: {
            recommended: ['Royal Blue', 'Emerald Green', 'Deep Wine', 'Rich Navy'],
            avoid: ['Pale Yellow', 'Beige'],
            reason: 'Jewel tones contrast beautifully with fair skin tones and bring out natural warmth.'
        },
        light: {
            recommended: ['Navy Blue', 'Maroon', 'Teal', 'Olive Green'],
            avoid: ['Washed-out Pastels', 'Light Gray'],
            reason: 'Rich, deep shades create an elegant contrast against light skin tones.'
        },
        medium: {
            recommended: ['Cobalt Blue', 'Rust Orange', 'Emerald', 'Deep Plum'],
            avoid: ['Muddy Browns', 'Neon Green'],
            reason: 'Earthy and vibrant jewel tones complement medium skin undertones perfectly.'
        },
        olive: {
            recommended: ['Ruby Red', 'Mustard Gold', 'Teal Blue', 'Ivory'],
            avoid: ['Olive Brown', 'Pale Gray'],
            reason: 'Warm golds and deep rubies enhance natural olive undertones.'
        },
        tan: {
            recommended: ['Ivory White', 'Crimson Red', 'Sapphire Blue', 'Burnt Orange'],
            avoid: ['Dull Olive', 'Ash Gray'],
            reason: 'Bright whites and rich saturations harmonize with tanned skin tones.'
        },
        deep: {
            recommended: ['Ivory', 'Bright Teal', 'Royal Purple', 'Sunset Gold'],
            avoid: ['Dark Charcoal', 'Dark Brown'],
            reason: 'Bright, bold colors and clean whites create a stunning, radiant appearance.'
        }
    };

    const shapeFitMap = {
        slim: [
            'Opt for layered outfits and structured fabrics to add subtle dimension.',
            'Choose tailored fits that follow the silhouette without clinging too tightly.',
            'Lightweight shoulder padding or structured collars enhance upper torso proportion.'
        ],
        athletic: [
            'Highlight broad shoulders with sharp shoulder seams and clean waist tapering.',
            'Choose slightly stretchy weaves or bespoke cuts for freedom of movement.',
            'Avoid overly baggy garments that obscure your natural proportions.'
        ],
        average: [
            'Balanced proportions mean you can experiment with both slim and classic fits.',
            'Focus on proper sleeve and hem lengths for a sharp, polished appearance.',
            'Use contrasting top and bottom shades to define the waistline.'
        ],
        plus: [
            'Choose matte fabrics with nice drape that flow smoothly over curves.',
            'Vertical seams, pin-stripes, and monochrome layers create a sleek silhouette.',
            'Ensure comfortable room around the chest and hips without excess fabric.'
        ]
    };

    const styleOutfitMap = {
        formal: [
            'Bespoke two-piece suit in premium Italian wool with a crisp cotton dress shirt.',
            'Single-breasted structured blazer paired with tailored tapered trousers.',
            'Classic Bandhgala or Jodhpuri suit with subtle button detailing for ceremonial elegance.'
        ],
        ethnic: [
            'Handcrafted raw silk Kurta with churidar and a contrasting embroidered Nehru jacket.',
            'Regal sherwani with intricate zardozi embroidery and matching stole.',
            'Classic silk festive ensemble tailored with comfortable side slits and breathability.'
        ],
        casual: [
            'Custom linen shirt with tailored chinos for relaxed yet sophisticated styling.',
            'Unstructured breathable cotton jacket over a fitted shirt.',
            'Smart-casual tailored overshirt paired with stretch-weave trousers.'
        ],
        wedding: [
            'Royal velvet or brocade sherwani with regal gold embroidery and tailored drape.',
            'Three-piece ceremonial wedding suit with silk pocket square and vest.',
            'Hand-loom silk ethnic attire customized for long ceremonial celebrations.'
        ],
        custom: [
            'Signature fusion wear combining classic western tailoring with Indian textile motifs.',
            'Tailored asymmetrical draped kurta with structured jacket.',
            'Bespoke statement piece crafted to your precise height and body measurements.'
        ],
        alteration: [
            'Precision waist tapering and hem adjustment for your existing wardrobe favorites.',
            'Sleeve shortening and shoulder realignment for a clean bespoke finish.',
            'Custom reshaping to give off-the-rack garments a luxury made-to-measure feel.'
        ]
    };

    const palette = colorMap[skinTone.toLowerCase()] || colorMap.medium;
    const fitTips = shapeFitMap[bodyShape.toLowerCase()] || shapeFitMap.average;
    const outfitIdeas = styleOutfitMap[style.toLowerCase()] || styleOutfitMap.formal;

    return {
        headline: `Tailored ${style.charAt(0).toUpperCase() + style.slice(1)} Elegance For Your Profile`,
        summary: `Based on your ${bodyShape} build and ${skinTone} skin tone, we recommend structured silhouettes and rich color contrasts. Our tailors specialize in custom cuts that flatter your ${height || 170}cm frame.`,
        colorPalette: palette,
        fabrics: ['Premium Merino Wool', 'Handloom Pure Silk', 'Breathable Organic Cotton', 'Rich Linen Weave'],
        fitTips: fitTips,
        outfitIdeas: outfitIdeas,
        dos: [
            'Always request a second fitting to refine waist and shoulder alignment.',
            'Choose fabrics that match the climate and formality of your occasion.',
            'Communicate your comfort preferences clearly with your tailor.'
        ],
        donts: [
            'Don\'t settle for off-the-rack shoulder fits without custom alteration.',
            'Avoid heavy fabrics in high humidity or tight fits without stretch.',
            'Don\'t ignore hemline lengths—proper shoe break is essential.'
        ],
        accessoryTip: 'Pair with a subtle silk pocket square or handcrafted leather footwear to complete the look.'
    };
}

module.exports = {
    getOutfitPrompt,
    getSmartFallbackAdvice
};
