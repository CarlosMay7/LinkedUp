const badWordsMap = {
    bitch: true,
    shit: true,
    fuck: true,
    ass: true,
    asshole: true,
    bastard: true,
    damn: true,
    dammit: true,
    crap: true,
    dick: true,
    dickhead: true,
    piss: true,
    motherfucker: true,
    whore: true,
    slut: true,
    cunt: true,
    bloody: true,
    hell: true,
    damned: true,
    goddamn: true,
    bullshit: true,
    frick: true,
    frickin: true,
    douchebag: true,
    retard: true,
    stupid: true,
    idiot: true,
    jerk: true,
};

export const censorText = text => {
    if (!text || typeof text !== 'string') {
        return text;
    }

    let censored = text;

    Object.keys(badWordsMap).forEach(word => {
        // Match whole words only, case-insensitive, with optional leet speak variations
        const variations = [
            word,
            word.replace(/a/g, '@'),
            word.replace(/a/g, '4'),
            word.replace(/e/g, '3'),
            word.replace(/i/g, '1'),
            word.replace(/o/g, '0'),
            word.replace(/s/g, '5'),
            word.replace(/t/g, '7'),
        ];

        variations.forEach(variant => {
            // Create pattern that matches the word with word boundaries and optional punctuation
            const pattern = new RegExp(`\\b${variant}+\\b`, 'gi');
            censored = censored.replace(pattern, match => {
                // Replace with asterisks matching the length
                return '*'.repeat(Math.max(match.length, 4));
            });
        });
    });

    return censored;
};

export const hasProfanity = text => {
    if (!text || typeof text !== 'string') {
        return false;
    }

    const lowerText = text.toLowerCase();

    return Object.keys(badWordsMap).some(word => {
        // Check for word with word boundaries
        const pattern = new RegExp(`\\b${word}\\b`, 'i');
        return pattern.test(lowerText);
    });
};

export default { censorText, hasProfanity };
