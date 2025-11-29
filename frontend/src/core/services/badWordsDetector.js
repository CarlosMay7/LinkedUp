export class BadWordsDetectorService {
    badWordsList = [
        'bitch',
        'shit',
        'fuck',
        'ass',
        'asshole',
        'bastard',
        'damn',
        'dammit',
        'crap',
        'dick',
        'dickhead',
        'piss',
        'motherfucker',
        'whore',
        'slut',
        'cunt',
        'bloody',
        'hell',
        'damned',
        'goddamn',
        'bullshit',
        'frick',
        'frickin',
        'douchebag',
        'retard',
        'stupid',
        'idiot',
        'jerk',
    ];

    detectBadWords(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        const detectedWords = [];
        const lowerText = text.toLowerCase();

        this.badWordsList.forEach(word => {
            const pattern = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = lowerText.match(pattern);

            if (matches) {
                detectedWords.push(...matches.map(m => m.toLowerCase()));
            }
        });

        return detectedWords;
    }

    getUniqueDetectedWords(text) {
        const detected = this.detectBadWords(text);
        const uniqueWords = {};

        detected.forEach(word => {
            const lowerWord = word.toLowerCase();
            uniqueWords[lowerWord] = (uniqueWords[lowerWord] || 0) + 1;
        });

        return uniqueWords;
    }

    censorAndDetect(text) {
        const detectedWords = this.detectBadWords(text);

        return {
            original: text,
            detectedWords: detectedWords,
            uniqueWords: this.getUniqueDetectedWords(text),
            count: detectedWords.length,
        };
    }
}

export default new BadWordsDetectorService();
