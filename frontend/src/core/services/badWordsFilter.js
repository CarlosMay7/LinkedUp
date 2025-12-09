const BAD_WORDS_MAP = {
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

class BadWordsFilterService {
    constructor() {
        this.badWordsMap = BAD_WORDS_MAP;
    }

    _generateVariations(word) {
        return [
            word,
            word.replace(/a/g, '@'),
            word.replace(/a/g, '4'),
            word.replace(/e/g, '3'),
            word.replace(/i/g, '1'),
            word.replace(/o/g, '0'),
            word.replace(/s/g, '5'),
            word.replace(/t/g, '7'),
        ];
    }

    censorText(text) {
        if (!text || typeof text !== 'string') {
            return text;
        }

        let censored = text;

        Object.keys(this.badWordsMap).forEach(word => {
            const variations = this._generateVariations(word);

            variations.forEach(variant => {
                const pattern = new RegExp(`\\b${variant}+\\b`, 'gi');
                censored = censored.replace(pattern, match => {
                    return '*'.repeat(Math.max(match.length, 4));
                });
            });
        });

        return censored;
    }

    hasProfanity(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }

        const lowerText = text.toLowerCase();

        return Object.keys(this.badWordsMap).some(word => {
            const pattern = new RegExp(`\\b${word}\\b`, 'i');
            return pattern.test(lowerText);
        });
    }

    countBadWords(text) {
        if (!text || typeof text !== 'string') {
            return 0;
        }

        let count = 0;
        const lowerText = text.toLowerCase();

        Object.keys(this.badWordsMap).forEach(word => {
            const pattern = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = lowerText.match(pattern);
            if (matches) {
                count += matches.length;
            }
        });

        return count;
    }

    getBadWordsInText(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        const foundWords = [];
        const lowerText = text.toLowerCase();

        Object.keys(this.badWordsMap).forEach(word => {
            const pattern = new RegExp(`\\b${word}\\b`, 'gi');
            if (pattern.test(lowerText)) {
                foundWords.push(word);
            }
        });

        return [...new Set(foundWords)];
    }
}

const badWordsFilterService = new BadWordsFilterService();

export { BadWordsFilterService };
export const censorText = text => badWordsFilterService.censorText(text);
export const hasProfanity = text => badWordsFilterService.hasProfanity(text);
export const countBadWords = text => badWordsFilterService.countBadWords(text);
export const getBadWordsInText = text =>
    badWordsFilterService.getBadWordsInText(text);

export default badWordsFilterService;
