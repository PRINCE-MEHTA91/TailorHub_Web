/**
 * outfitPrompt.js
 * Builds structured prompts for Gemini AI style advisor and provides an intelligent fallback engine.
 */

function getOutfitPrompt(style, bodyProfile = {}, language = 'english') {
    const { gender, skinTone, bodyShape, height, weight } = bodyProfile;
    const bmi = height && weight ? (weight / ((height / 100) ** 2)).toFixed(1) : null;

    const langInstruction = {
        english: 'Respond in clear, simple English.',
        hinglish: 'Respond in Hinglish (a natural mix of Hindi and English, written in English script). Use easy everyday Hindi words mixed with English — e.g., "Aapke liye yeh style bohot accha rahega" style. Keep it friendly and relatable for Indian users.',
        hindi: 'Respond entirely in Hindi using Devanagari script (हिंदी में जवाब दें). Use simple, clear Hindi that an average Indian person can understand easily.',
    }[language] || 'Respond in clear, simple English.';

    const genderLabel = gender ? String(gender).toLowerCase() : 'unspecified';
    const isMalePrompt = ['male', 'man', 'men', 'm', 'boy'].includes(genderLabel);
    const isFemalePrompt = ['female', 'woman', 'women', 'f', 'girl'].includes(genderLabel);

    const genderRule = isMalePrompt
      ? `⚠️ MALE USER — You MUST ONLY recommend MEN'S clothing. NEVER suggest sarees, lehengas, anarkalis, dupattas, blouses, or ANY women's garments. Only recommend: sherwanis, kurtas, bandhgala suits, nehru jackets, churidars, men's blazers, two-piece suits, jodhpuri suits, and other male attire.`
      : isFemalePrompt
      ? `⚠️ FEMALE USER — You MUST ONLY recommend WOMEN'S clothing. Never suggest sherwanis for men or kurta-pyjama sets made for men. Only recommend: sarees, lehengas, anarkalis, salwar-kameez, women's blazer suits, kurta sets, dupattas, and other female attire.`
      : `Recommend gender-neutral or versatile styling options.`;

    return `You are an elite, high-end celebrity fashion stylist and bespoke tailoring advisor for Indian and western clothing.
A customer is looking for ${style} wear and has the following profile:
- Gender: ${gender || 'not specified'}
- Skin Tone: ${skinTone || 'medium'}
- Body Shape: ${bodyShape || 'average'}
- Height: ${height ? height + 'cm' : 'not specified'}
- Weight: ${weight ? weight + 'kg' : 'not specified'}
${bmi ? `- BMI: ${bmi}` : ''}

Language instruction: ${langInstruction}

${genderRule}

ADDITIONAL STYLING RULES:
- Provide strictly INDIVIDUALIZED advice tailored to the person's exact Gender (${gender || 'unspecified'}), Skin Tone (${skinTone || 'medium'}), Style (${style}), and Body Shape (${bodyShape || 'average'}).
- For colorPalette, select specific, harmonious color names that flatter their exact skin tone and style. NEVER return generic placeholders.
- outfitIdeas must be 3 specific garment suggestions appropriate ONLY for ${gender || 'this person'}'s gender and for ${style} style.

Please provide personalized style advice in the following JSON format ONLY (no markdown, no extra text). All text values in the JSON must be in the language specified above:
{
  "headline": "A short punchy style headline for this person (max 10 words)",
  "summary": "2-3 sentence personalized overview of what suits them best",
  "colorPalette": {
    "recommended": ["Color 1", "Color 2", "Color 3", "Color 4"],
    "avoid": ["Color A", "Color B"],
    "reason": "Brief reason based on skin tone and style"
  },
  "fabrics": ["Fabric 1", "Fabric 2", "Fabric 3"],
  "fitTips": ["Tip 1 about their body shape", "Tip 2", "Tip 3"],
  "outfitIdeas": ["Outfit idea 1 specific to ${style} and ${gender || 'user'}", "Outfit idea 2", "Outfit idea 3"],
  "dos": ["Do 1", "Do 2", "Do 3"],
  "donts": ["Don't 1", "Don't 2", "Don't 3"],
  "accessoryTip": "One specific accessory recommendation"
}`;
}

/**
 * Intelligent Smart Styling Fallback Engine — Multilingual (English | Hinglish | Hindi)
 * Automatically generates customized, individual styling advice per user profile (Gender, Style, Skin Tone, Body Shape).
 */
function getSmartFallbackAdvice(style = 'formal', bodyProfile = {}, language = 'english') {
    const { skinTone = 'medium', bodyShape = 'average', height = 170, gender = '' } = bodyProfile;
    const lang = ['english', 'hinglish', 'hindi'].includes(language) ? language : 'english';
    const isFemale = gender && ['female', 'woman', 'women', 'f', 'girl'].includes(String(gender).toLowerCase());
    const isMale = gender && ['male', 'man', 'men', 'm', 'boy'].includes(String(gender).toLowerCase());

    // ── Individualized Color Palette by Skin Tone, Gender & Style ──
    const getIndividualPalette = (st, sty, fem, l) => {
        const tone = (st || 'medium').toLowerCase();
        const s = (sty || 'formal').toLowerCase();

        const basePalettes = {
            english: {
                fair: {
                    female: {
                        ethnic: { recommended: ['Rani Pink', 'Emerald Green', 'Royal Blue', 'Ruby Red'], avoid: ['Pale Yellow', 'Beige'], reason: 'Jewel tones contrast beautifully with fair complexion and enhance festive radiance.' },
                        wedding: { recommended: ['Ruby Red', 'Royal Rose', 'Emerald Green', 'Deep Wine'], avoid: ['Pale Beige', 'Washed Peach'], reason: 'Rich bridal reds and greens bring warmth and elegance to fair skin.' },
                        formal: { recommended: ['Royal Blue', 'Deep Wine', 'Rich Navy', 'Emerald Green'], avoid: ['Pale Yellow', 'Washed Gray'], reason: 'Deep contrast colors create an authoritative, polished look.' },
                        default: { recommended: ['Royal Blue', 'Emerald Green', 'Deep Wine', 'Rich Navy'], avoid: ['Pale Yellow', 'Beige'], reason: 'Jewel tones contrast beautifully with fair skin and bring out natural warmth.' }
                    },
                    male: {
                        ethnic: { recommended: ['Royal Blue', 'Emerald Green', 'Mustard Gold', 'Deep Wine'], avoid: ['Pale Yellow', 'Light Beige'], reason: 'Deep traditional hues highlight fair complexion with royal elegance.' },
                        wedding: { recommended: ['Ivory Gold', 'Deep Wine', 'Royal Blue', 'Emerald'], avoid: ['Dark Charcoal', 'Dull Beige'], reason: 'Ivory and jewel tones create a timeless regal groom aesthetic.' },
                        formal: { recommended: ['Royal Blue', 'Rich Navy', 'Charcoal Gray', 'Deep Wine'], avoid: ['Pale Yellow', 'Light Beige'], reason: 'Rich navy and blue shades create a sharp, commanding silhouette.' },
                        default: { recommended: ['Royal Blue', 'Emerald Green', 'Deep Wine', 'Rich Navy'], avoid: ['Pale Yellow', 'Beige'], reason: 'Jewel tones contrast beautifully with fair skin and bring out natural warmth.' }
                    }
                },
                light: {
                    female: {
                        ethnic: { recommended: ['Maroon Gold', 'Teal Blue', 'Rani Pink', 'Olive Green'], avoid: ['Washed Pastels', 'Light Gray'], reason: 'Rich ethnic saturations bring out glow in light undertones.' },
                        wedding: { recommended: ['Ruby Red', 'Royal Pink', 'Teal Blue', 'Emerald Green'], avoid: ['Pale Peach', 'Light Gray'], reason: 'Vibrant wedding hues contrast elegantly with light skin.' },
                        default: { recommended: ['Navy Blue', 'Maroon', 'Teal', 'Olive Green'], avoid: ['Washed-out Pastels', 'Light Gray'], reason: 'Rich, deep shades create an elegant contrast against light skin tones.' }
                    },
                    male: {
                        ethnic: { recommended: ['Navy Blue', 'Maroon', 'Teal Blue', 'Olive Green'], avoid: ['Washed Pastels', 'Light Gray'], reason: 'Deep traditional shades balance light skin tones perfectly.' },
                        wedding: { recommended: ['Ivory Gold', 'Maroon', 'Royal Navy', 'Teal'], avoid: ['Washed Pastels', 'Dull Gray'], reason: 'Classic gold and maroon tones flatter light skin for weddings.' },
                        default: { recommended: ['Navy Blue', 'Maroon', 'Teal', 'Olive Green'], avoid: ['Washed-out Pastels', 'Light Gray'], reason: 'Rich, deep shades create an elegant contrast against light skin tones.' }
                    }
                },
                medium: {
                    female: {
                        ethnic: { recommended: ['Rani Pink', 'Emerald Green', 'Royal Blue', 'Maroon Gold'], avoid: ['Dull Olive', 'Pale Yellow'], reason: 'Vibrant jewel tones complement medium skin undertones perfectly.' },
                        wedding: { recommended: ['Deep Magenta', 'Rich Maroon', 'Mustard Gold', 'Teal Blue'], avoid: ['Ash Gray', 'Washed Peach'], reason: 'Rich warm wedding colors harmonize beautifully with medium complexion.' },
                        formal: { recommended: ['Cobalt Blue', 'Deep Plum', 'Rich Navy', 'Burgundy'], avoid: ['Muddy Brown', 'Neon Green'], reason: 'Deep tailored shades create a sleek and executive appearance.' },
                        default: { recommended: ['Cobalt Blue', 'Rust Orange', 'Emerald', 'Deep Plum'], avoid: ['Muddy Brown', 'Neon Green'], reason: 'Earthy and vibrant jewel tones complement medium skin undertones perfectly.' }
                    },
                    male: {
                        ethnic: { recommended: ['Royal Blue', 'Maroon', 'Emerald Green', 'Mustard Gold'], avoid: ['Pale Pink', 'Dull Gray'], reason: 'Warm earthy and jewel tones enhance medium Indian skin tones.' },
                        wedding: { recommended: ['Ivory Gold', 'Deep Wine', 'Royal Blue', 'Teal'], avoid: ['Dark Charcoal', 'Muddy Yellow'], reason: 'Gold and royal blue ensembles look regal on medium complexion.' },
                        formal: { recommended: ['Cobalt Blue', 'Rust Orange', 'Rich Navy', 'Deep Plum'], avoid: ['Muddy Brown', 'Neon Green'], reason: 'Sharp cobalt and rich navy elevate formal wear on medium skin tones.' },
                        default: { recommended: ['Cobalt Blue', 'Rust Orange', 'Emerald', 'Deep Plum'], avoid: ['Muddy Brown', 'Neon Green'], reason: 'Earthy and vibrant jewel tones complement medium skin undertones perfectly.' }
                    }
                },
                olive: {
                    female: {
                        default: { recommended: ['Ruby Red', 'Mustard Gold', 'Teal Blue', 'Ivory White'], avoid: ['Olive Brown', 'Pale Gray'], reason: 'Warm golds and deep rubies enhance natural olive undertones.' }
                    },
                    male: {
                        default: { recommended: ['Ruby Red', 'Mustard Gold', 'Teal Blue', 'Ivory White'], avoid: ['Olive Brown', 'Pale Gray'], reason: 'Warm golds and deep rubies enhance natural olive undertones.' }
                    }
                },
                tan: {
                    female: {
                        default: { recommended: ['Ivory White', 'Crimson Red', 'Sapphire Blue', 'Burnt Orange'], avoid: ['Dull Olive', 'Ash Gray'], reason: 'Bright whites and rich saturations harmonize with tanned skin tones.' }
                    },
                    male: {
                        default: { recommended: ['Ivory White', 'Crimson Red', 'Sapphire Blue', 'Burnt Orange'], avoid: ['Dull Olive', 'Ash Gray'], reason: 'Bright whites and rich saturations harmonize with tanned skin tones.' }
                    }
                },
                deep: {
                    female: {
                        default: { recommended: ['Ivory White', 'Bright Teal', 'Royal Purple', 'Sunset Gold'], avoid: ['Dark Charcoal', 'Dark Brown'], reason: 'Bold, bright colors and clean whites create a stunning radiant appearance.' }
                    },
                    male: {
                        default: { recommended: ['Ivory White', 'Bright Teal', 'Royal Purple', 'Sunset Gold'], avoid: ['Dark Charcoal', 'Dark Brown'], reason: 'Bold, bright colors and clean whites create a stunning radiant appearance.' }
                    }
                }
            }
        };

        const langPalettes = basePalettes.english[tone] || basePalettes.english.medium;
        const genderPalettes = fem ? langPalettes.female : langPalettes.male;
        const selected = (genderPalettes && genderPalettes[s]) || (genderPalettes && genderPalettes.default) || langPalettes.female?.default || {
            recommended: ['Cobalt Blue', 'Rust Orange', 'Emerald Green', 'Deep Plum'],
            avoid: ['Muddy Brown', 'Neon Green'],
            reason: 'Vibrant jewel tones complement your complexion perfectly.'
        };

        if (l === 'hinglish') {
            return {
                ...selected,
                reason: selected.reason.replace('complexion', 'skin tone').replace('perfectly', 'bohot ache se match karte hain')
            };
        }
        if (l === 'hindi') {
            return {
                recommended: selected.recommended.map(c => c),
                avoid: selected.avoid.map(c => c),
                reason: 'समृद्ध और जीवंत रंग आपकी त्वचा के साथ बिल्कुल सही कॉन्ट्रास्ट बनाते हैं और आपको एक आकर्षक लुक देते हैं।'
            };
        }
        return selected;
    };

    // ── Fit tips by body shape ──
    const shapeFitMap = {
        english: {
            slim:     ['Opt for layered outfits and structured fabrics to add subtle dimension.', 'Choose tailored fits that follow the silhouette without clinging too tightly.', 'Lightweight shoulder padding or structured collars enhance upper torso proportion.'],
            athletic: ['Highlight broad shoulders with sharp shoulder seams and clean waist tapering.', 'Choose slightly stretchy weaves or bespoke cuts for freedom of movement.', 'Avoid overly baggy garments that obscure your natural proportions.'],
            average:  ['Balanced proportions mean you can experiment with both slim and classic fits.', 'Focus on proper sleeve and hem lengths for a sharp, polished appearance.', 'Use contrasting top and bottom shades to define the waistline.'],
            plus:     ['Choose matte fabrics with nice drape that flow smoothly over curves.', 'Vertical seams, pin-stripes, and monochrome layers create a sleek silhouette.', 'Ensure comfortable room around the chest and hips without excess fabric.'],
        },
        hinglish: {
            slim:     ['Layered outfits aur structured fabrics se acha shape milega.', 'Aisi fitting choose karein jo silhouette follow kare, zyada tight nahi.', 'Halke shoulder padding ya structured collar se upper body better dikhegi.'],
            athletic: ['Broad shoulders ko sharp shoulder seams se highlight karein.', 'Thoda stretchy weave ya bespoke cut free movement ke liye accha hai.', 'Zyada baggy kapde avoid karein jo aapki natural body chupa dein.'],
            average:  ['Aapki balanced body pe slim aur classic dono fits acchi lagti hain.', 'Smart look ke liye sleeve aur hem ki sahi length rakhe.', 'Upar neeche contrasting colors se waistline define karein.'],
            plus:     ['Matte fabric choose karein jo curves pe smoothly baithe.', 'Vertical seams aur monochrome layers ek slim look dete hain.', 'Chest aur hips mein comfortable room rakhe, zyada loose nahi.'],
        },
        hindi: {
            slim:     ['परतदार पोशाक और संरचित कपड़े से अच्छा आकार मिलेगा।', 'ऐसी फिटिंग चुनें जो सिल्हूट को फॉलो करे, बहुत टाइट न हो।', 'हल्की शोल्डर पैडिंग या संरचित कॉलर से ऊपरी शरीर बेहतर दिखेगा।'],
            athletic: ['शार्प शोल्डर सीम से चौड़े कंधों को उभारें।', 'थोड़ा स्ट्रेचेबल कपड़ा या बेस्पोक कट आज़ादी से चलने के लिए अच्छा है।', 'बहुत ढीले कपड़े न पहनें जो आपके प्राकृतिक अनुपात को छुपाएं।'],
            average:  ['आपके संतुलित शरीर पर स्लिम और क्लासिक दोनों फिट अच्छी लगती हैं।', 'स्मार्ट लुक के लिए सही आस्तीन और हेम की लंबाई रखें।', 'ऊपर-नीचे कंट्रास्टिंग रंगों से कमर को परिभाषित करें।'],
            plus:     ['ऐसा मैट कपड़ा चुनें जो कर्व्स पर आसानी से बैठे।', 'वर्टिकल सीम और मोनोक्रोम लेयर से स्लिम लुक मिलता है।', 'छाती और कूल्हों में आरामदायक जगह रखें, बहुत ढीला नहीं।'],
        },
    };

    // ── Individualized Outfit Ideas by style & gender ──
    const styleOutfitMap = {
        english: {
            female: {
                formal:     ['Custom tailored trouser suit with structured shoulders in premium Italian wool.', 'Elegant pencil skirt paired with a tailored silk blouse and single-breasted blazer.', 'Double-breasted structured coat dress with custom waist tapering.'],
                ethnic:     ['Banarasi Pure Silk Saree paired with a bespoke embroidered contrast blouse.', 'Hand-crafted Anarkali Suit with intricate Zari embroidery and sheer dupatta.', 'Contemporary Sharara Set with silk Kurta and tailored side slits.'],
                casual:     ['Tailored linen tunic paired with custom high-waisted straight trousers.', 'Breathable organic cotton co-ord set for relaxed yet chic everyday styling.', 'Custom asymmetrical kurta dress with functional pockets and smart collar.'],
                wedding:    ['Bridal Lehenga with royal Zardozi and Kundan hand-embroidery in rich jewel tones.', 'Handwoven Kanjivaram Bridal Saree customized with a designer gold zari border.', 'Designer Velvet Anarkali wedding gown tailored for effortless draping.'],
                custom:     ['Bespoke fusion ensemble combining western tailoring with Indian textile artistry.', 'Tailored draped saree-gown with a structured embroidered jacket.', 'Signature custom piece crafted to your exact body measurements.'],
                alteration: ['Precision waist tapering and bust dart shaping for your favorite gowns and dresses.', 'Sleeve shortening and hemline customization for sarees, lehengas, and blouses.', 'Custom resizing to transform ready-made garments into luxury bespoke fits.'],
            },
            male: {
                formal:     ['Bespoke two-piece suit in premium Italian wool with a crisp cotton dress shirt.', 'Single-breasted structured blazer paired with tailored tapered trousers.', 'Classic Bandhgala or Jodhpuri suit for ceremonial elegance.'],
                ethnic:     ['Handcrafted raw silk Kurta with churidar and contrasting Nehru jacket.', 'Regal sherwani with intricate zardozi embroidery and matching stole.', 'Classic silk festive Kurta ensemble tailored with comfortable side slits.'],
                casual:     ['Custom linen shirt with tailored chinos for relaxed yet sophisticated styling.', 'Unstructured breathable cotton jacket over a fitted shirt.', 'Smart-casual tailored overshirt paired with stretch-weave trousers.'],
                wedding:    ['Royal velvet or brocade Sherwani with regal gold embroidery and silk stole.', 'Three-piece ceremonial wedding Jodhpuri suit with silk pocket square.', 'Hand-loom silk ethnic groom attire customized for long ceremonial celebrations.'],
                custom:     ['Signature fusion wear combining classic western tailoring with Indian textile motifs.', 'Tailored asymmetrical draped kurta with structured Nehru jacket.', 'Bespoke statement piece crafted to your precise measurements.'],
                alteration: ['Precision waist tapering and hem adjustment for your wardrobe favorites.', 'Sleeve shortening and shoulder realignment for a bespoke finish.', 'Custom reshaping to give off-the-rack garments a luxury tailored feel.'],
            }
        },
        hinglish: {
            female: {
                formal:     ['Premium Italian wool mein custom tailored trouser suit structured shoulders ke saath.', 'Elegant pencil skirt aur tailored silk blouse ka professional look.', 'Double-breasted structured coat dress custom fitting ke saath.'],
                ethnic:     ['Banarasi Pure Silk Saree ke saath bespoke embroidered contrast blouse.', 'Intricate Zari embroidery wala Anarkali Suit aur sheer dupatta.', 'Contemporary Sharara Set silk Kurta ke saath.'],
                casual:     ['Tailored linen tunic aur high-waisted straight trousers — relaxed yet chic.', 'Breathable cotton co-ord set everyday smart comfort ke liye.', 'Custom asymmetrical kurta dress functional pockets ke saath.'],
                wedding:    ['Zardozi aur Kundan hand-embroidery wala bridal lehenga rich jewel tones mein.', 'Designer gold zari border ke saath handwoven Kanjivaram bridal saree.', 'Designer Velvet Anarkali wedding gown perfect drape ke saath.'],
                custom:     ['Western tailoring aur Indian textile motifs ka unique bespoke fusion.', 'Tailored draped saree-gown aur structured embroidered jacket.', 'Aapke exact body measurements pe bana bespoke designer wear.'],
                alteration: ['Favorite gowns aur dresses ki precision waist tapering aur dart shaping.', 'Saree blouse, lehengas aur dresses ka sleeve aur hemline customization.', 'Ready-made kapdon ko custom fit dekar luxury look dein.'],
            },
            male: {
                formal:     ['Premium Italian wool ka bespoke two-piece suit crisp cotton shirt ke saath.', 'Single-breasted blazer aur tailored trousers ka perfect combination.', 'Classic Bandhgala ya Jodhpuri suit — ceremonial occasions ke liye best.'],
                ethnic:     ['Raw silk ka handcrafted kurta churidar aur contrasting Nehru jacket ke saath.', 'Intricate zardozi wala regal sherwani matching stole ke saath.', 'Classic silk festive dress side slits ke saath comfortable aur breathable.'],
                casual:     ['Linen shirt aur tailored chinos — relaxed yet stylish look.', 'Breathable cotton jacket fitted shirt ke upar — smart casual combo.', 'Smart tailored overshirt stretch trousers ke saath.'],
                wedding:    ['Velvet ya brocade sherwani gold embroidery ke saath — wedding ke liye best.', 'Three-piece ceremonial suit silk pocket square aur vest ke saath.', 'Hand-loom silk ethnic dress jo lambi ceremonies ke liye comfortable ho.'],
                custom:     ['Western tailoring aur Indian textile motifs ka fusion — unique style.', 'Asymmetrical kurta aur structured jacket ka stylish combination.', 'Aapki exact measurements ke hisaab se bana bespoke piece.'],
                alteration: ['Purane favorite kapdon ki waist tapering aur hem adjust karein.', 'Sleeve short karein aur shoulder realign karein perfect fit ke liye.', 'Ready-made kapdon ko custom reshaping se luxury tailored feel dein.'],
            }
        },
        hindi: {
            female: {
                formal:     ['प्रीमियम इटालियन ऊन में कस्टम टेलर्ड ट्राउज़र सूट संरचित कंधों के साथ।', 'एलिगेंट पेंसिल स्कर्ट और टेलर्ड सिल्क ब्लाउज़ का प्रोफेशनल लुक।', 'डबल-ब्रेस्टेड स्ट्रक्चर्ड कोट ड्रेस कस्टम फिटिंग के साथ।'],
                ethnic:     ['बनारसी शुद्ध सिल्क साड़ी के साथ बेस्पोक कढ़ाईदार कंट्रास्ट ब्लाउज़।', 'जरदोज़ी कढ़ाई वाला अनारकली सूट और शानदार दुपट्टा।', 'समकालीन शरारा सेट सिल्क कुर्ता और साइड स्लिट्स के साथ।'],
                casual:     ['लिनन ट्यूनिक और हाई-वेस्टेड स्ट्रेट ट्राउज़र — आरामदायक और स्टाइलिश।', 'रोज़मर्रा के आराम के लिए ब्रीदेबल कॉटन को-ऑर्ड सेट।', 'फंक्शनल पॉकेट के साथ कस्टम असिमेट्रिकल कुर्ता ड्रेस।'],
                wedding:    ['जरदोज़ी और कुंदन हस्तशिल्प कढ़ाई वाला ब्राइडल लहंगा समृद्ध रंगों में।', 'डिज़ाइनर गोल्ड ज़री बॉर्डर के साथ हथकरघा कांजीवरम ब्राइडल साड़ी।', 'शानदार ड्रेपिंग के साथ डिज़ाइनर वेलवेट अनारकली शादी का जोड़ा।'],
                custom:     ['पश्चिमी टेलरिंग और भारतीय वस्त्र कला का अनूठा फ्यूज़न।', 'संरचित कढ़ाईदार जैकेट के साथ टेलर्ड ड्रेप्ड साड़ी-गाउन।', 'आपकी सटीक शारीरिक माप पर बना बेस्पोक डिज़ाइनर पोशाक।'],
                alteration: ['पसंदीदा गाउन और ड्रेस की सटीक कमर फिटिंग और डार्ट शेपिंग।', 'साड़ी ब्लाउज और लहंगे की आस्तीन और हेमलाइन का अनुकूलन।', 'रेडीमेड कपड़ों को कस्टम फिट देकर लग्जरी फील दें।'],
            },
            male: {
                formal:     ['प्रीमियम इटालियन ऊन का बेस्पोक टू-पीस सूट क्रिस्प कॉटन शर्ट के साथ।', 'सिंगल-ब्रेस्टेड ब्लेज़र और टेलर्ड ट्राउज़र्स का परफेक्ट कॉम्बिनेशन।', 'क्लासिक बंधगला या जोधपुरी सूट समारोहों के लिए सर्वश्रेष्ठ।'],
                ethnic:     ['रॉ सिल्क का हस्तनिर्मित कुर्ता चूड़ीदार और कंट्रास्टिंग नेहरू जैकेट के साथ।', 'जरदोज़ी कढ़ाई वाला शाही शेरवानी मेचिंग स्टोल के साथ।', 'क्लासिक सिल्क फेस्टिव ड्रेस साइड स्लिट्स के साथ आरामदायक।'],
                casual:     ['लिनन शर्ट और टेलर्ड चिनोस — आरामदायक फिर भी स्टाइलिश।', 'ब्रीदेबल कॉटन जैकेट फिटेड शर्ट के ऊपर — स्मार्ट कैजुअल।', 'स्मार्ट ओवरशर्ट स्ट्रेच ट्राउज़र्स के साथ।'],
                wedding:    ['वेलवेट या ब्रोकेड शेरवानी गोल्ड एम्ब्रॉयडरी के साथ — शादी के लिए सर्वश्रेष्ठ।', 'थ्री-पीस सेरेमोनियल सूट सिल्क पॉकेट स्क्वेयर और वेस्ट के साथ।', 'हैंड-लूम सिल्क एथनिक ड्रेस लंबी शादियों के लिए आरामदायक।'],
                custom:     ['वेस्टर्न टेलरिंग और भारतीय टेक्सटाइल मोटिफ्स का फ्यूज़न — अनोखा स्टाइल।', 'असिमेट्रिकल कुर्ता और स्ट्रक्चर्ड जैकेट का स्टाइलिश कॉम्बिनेशन।', 'आपकी सटीक माप के अनुसार बना बेस्पोक पीस।'],
                alteration: ['पुराने पसंदीदा कपड़ों की कमर और हेम एडजस्ट करें।', 'आस्तीन छोटी करें और कंधा ठीक करें परफेक्ट फिट के लिए।', 'रेडीमेड कपड़ों को कस्टम रीशेपिंग से लग्जरी फील दें।'],
            }
        }
    };

    const textByGender = {
        english: {
            female: {
                headline:     `Tailored ${style.charAt(0).toUpperCase() + style.slice(1)} Elegance For Women`,
                summary:      `Based on your ${bodyShape} build and ${skinTone} complexion, we recommend structured female silhouettes and rich color contrasts designed to flatter your ${height}cm frame.`,
                fabrics:      ['Handloom Pure Silk', 'Organza & Chiffon', 'Breathable Organic Cotton', 'Rich Linen Weave'],
                dos:          ['Always request a second fitting to refine bust and waist alignment.', 'Choose fabrics that drape beautifully for your silhouette.', 'Communicate your neckline and sleeve comfort clearly with your tailor.'],
                donts:        ["Don't settle for ready-made shoulder or bust fits without custom tailoring.", 'Avoid stiff fabrics for flowing designs.', "Don't ignore hemline lengths — proper footwear alignment is essential."],
                accessoryTip: 'Pair with traditional Kundan/Jhumka earrings and a handcrafted embroidered Potli bag or chic statement earrings to complete the look.'
            },
            male: {
                headline:     `Tailored ${style.charAt(0).toUpperCase() + style.slice(1)} Elegance For Men`,
                summary:      `Based on your ${bodyShape} build and ${skinTone} complexion, we recommend sharp structured silhouettes and contrasting palettes tailored specifically for your ${height}cm frame.`,
                fabrics:      ['Premium Merino Wool', 'Handloom Pure Silk', 'Breathable Organic Cotton', 'Rich Linen Weave'],
                dos:          ['Always request a second fitting to refine waist and shoulder seam alignment.', 'Choose fabrics that match the climate and formality of your occasion.', 'Communicate your comfort preferences clearly with your tailor.'],
                donts:        ["Don't settle for off-the-rack shoulder fits without custom alteration.", 'Avoid heavy fabrics in high humidity or tight fits without stretch.', "Don't ignore hemline lengths — proper shoe break is essential."],
                accessoryTip: 'Complete the look with a contrasting silk pocket square, classic cufflinks, or handcrafted leather footwear.'
            }
        },
        hinglish: {
            female: {
                headline:     `Women's ${style.charAt(0).toUpperCase() + style.slice(1)} Style — Aapke Liye Bilkul Sahi`,
                summary:      `Aapki ${bodyShape} body aur ${skinTone} skin tone ke hisaab se elegant silhouettes aur rich colors best rahenge. Hamare tailors ${height}cm height ke liye perfect custom cuts mein expert hain.`,
                fabrics:      ['Handloom Pure Silk', 'Organza & Chiffon', 'Breathable Organic Cotton', 'Rich Linen Weave'],
                dos:          ['Ek second fitting zaroor lein taaki waist aur fitting perfect ho.', 'Aisi fabric choose karein jo aapki body pe khoobsurat drape ho.', 'Apni comfort preferences clearly apne tailor ko batayein.'],
                donts:        ['Ready-made fitting pe settle mat karein, custom alteration karwayein.', 'Zyada stiff fabric flowing designs ke liye avoid karein.', 'Hemline ki length ignore mat karein — heels/footwear ke hisaab se adjust karein.'],
                accessoryTip: 'Traditional Jhumka earrings aur embroidered Potli bag ya elegant statement accessories se apna look complete karein.'
            },
            male: {
                headline:     `Men's ${style.charAt(0).toUpperCase() + style.slice(1)} Style — Aapke Liye Bilkul Sahi`,
                summary:      `Aapki ${bodyShape} body aur ${skinTone} skin tone ke hisaab se sharp structured silhouettes aur rich colors best rahenge. Hamare tailors ${height}cm height ke liye perfect custom cuts mein expert hain.`,
                fabrics:      ['Premium Merino Wool', 'Handloom Pure Silk', 'Breathable Organic Cotton', 'Rich Linen Weave'],
                dos:          ['Ek second fitting zaroor lein taaki waist aur shoulder perfect ho.', 'Aisi fabric choose karein jo occasion aur mausam ke hisaab se sahi ho.', 'Apni comfort preferences clearly apne tailor ko batayein.'],
                donts:        ['Ready-made shoulder fit pe settle mat karein, custom alteration karwayein.', 'Zyada garmi mein heavy fabric aur tight fit avoid karein.', 'Hemline ki length ignore mat karein — shoe break bohot zaruri hai.'],
                accessoryTip: 'Ek subtle silk pocket square ya handcrafted leather footwear se apna look complete karein.'
            }
        },
        hindi: {
            female: {
                headline:     `महिलाओं के लिए परफेक्ट ${style.charAt(0).toUpperCase() + style.slice(1)} स्टाइल`,
                summary:      `आपके ${bodyShape} शरीर और ${skinTone} त्वचा के रंग के अनुसार सुंदर सिल्हूट और समृद्ध रंग सबसे अच्छे रहेंगे। हमारे दर्जी ${height}cm की ऊंचाई के लिए परफेक्ट कस्टम कट्स में माहिर हैं।`,
                fabrics:      ['हैंडलूम शुद्ध सिल्क', 'ऑर्गेंजा और शिफॉन', 'सांस लेने योग्य कॉटन', 'रिच लिनन वीव'],
                dos:          ['कमर और फिटिंग को परफेक्ट करने के लिए दूसरी फिटिंग जरूर लें।', 'ऐसा कपड़ा चुनें जो आपके सिल्हूट पर खूबसूरती से बैठे।', 'अपनी आराम की प्राथमिकताएं अपने दर्जी को स्पष्ट रूप से बताएं।'],
                donts:        ['रेडीमेड फिटिंग पर समझौता न करें, कस्टम बदलाव करवाएं।', 'फ्लोइंग डिज़ाइन के लिए सख्त कपड़े से बचें।', 'हेमलाइन की लंबाई को नजरअंदाज न करें — फुटवियर के अनुसार सही रखें।'],
                accessoryTip: 'पारंपरिक झुमके और कढ़ाईदार पोटली बैग या सुंदर स्टेटमेंट एक्सेसरीज़ के साथ अपना लुक पूरा करें।'
            },
            male: {
                headline:     `पुरुषों के लिए परफेक्ट ${style.charAt(0).toUpperCase() + style.slice(1)} स्टाइल`,
                summary:      `आपके ${bodyShape} शरीर और ${skinTone} त्वचा के रंग के अनुसार संरचित सिल्हूट और समृद्ध रंग सबसे अच्छे रहेंगे। हमारे दर्जी ${height}cm की ऊंचाई के लिए परफेक्ट कस्टम कट्स में माहिर हैं।`,
                fabrics:      ['प्रीमियम मेरिनो ऊन', 'हैंडलूम शुद्ध सिल्क', 'सांस लेने योग्य कॉटन', 'रिच लिनन वीव'],
                dos:          ['कमर और कंधे को परफेक्ट करने के लिए दूसरी फिटिंग जरूर लें।', 'अवसर और मौसम के अनुसार सही कपड़ा चुनें।', 'अपनी आराम की प्राथमिकताएं अपने दर्जी को स्पष्ट रूप से बताएं।'],
                donts:        ['रेडीमेड कंधे की फिटिंग पर समझौता न करें, कस्टम बदलाव करवाएं।', 'ज्यादा गर्मी में भारी कपड़े और टाइट फिट से बचें।', 'हेमलाइन की लंबाई को नजरअंदाज न करें — शू ब्रेक बहुत जरूरी है।'],
                accessoryTip: 'लुक को पूरा करने के लिए एक सूक्ष्म सिल्क पॉकेट स्क्वेयर या हस्तनिर्मित चमड़े के जूते पहनें।'
            }
        }
    };

    const palette     = getIndividualPalette(skinTone, style, isFemale, lang);
    const fitTips     = shapeFitMap[lang][bodyShape.toLowerCase()]       || shapeFitMap[lang].average;
    const genderMap   = isFemale ? styleOutfitMap[lang].female : styleOutfitMap[lang].male;
    const outfitIdeas = (genderMap && genderMap[style.toLowerCase()])    || genderMap.formal;
    const textGroup   = textByGender[lang][isFemale ? 'female' : 'male'];

    return {
        headline:     textGroup.headline,
        summary:      textGroup.summary,
        colorPalette: palette,
        fabrics:      textGroup.fabrics,
        fitTips,
        outfitIdeas,
        dos:          textGroup.dos,
        donts:        textGroup.donts,
        accessoryTip: textGroup.accessoryTip,
    };
}

module.exports = {
    getOutfitPrompt,
    getSmartFallbackAdvice
};
