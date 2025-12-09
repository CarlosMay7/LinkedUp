import { BadWordsFilterService } from '../badWordsFilter';

describe('BadWordsFilterService', () => {
    let service;

    beforeEach(() => {
        service = new BadWordsFilterService();
    });

    describe('censorText', () => {
        it('should censor bad words with asterisks', () => {
            const text = 'This is fuck shit';
            const result = service.censorText(text);
            expect(result).toContain('****');
            expect(result).not.toContain('fuck');
            expect(result).not.toContain('shit');
        });

        it('should handle case insensitive censoring', () => {
            const text = 'FUCK this SHIT';
            const result = service.censorText(text);
            expect(result).not.toContain('FUCK');
            expect(result).not.toContain('SHIT');
        });

        it('should not censor partial words', () => {
            const text = 'The shitake mushroom';
            const result = service.censorText(text);
            expect(result).toContain('shitake');
        });

        it('should return original text for empty string', () => {
            const result = service.censorText('');
            expect(result).toBe('');
        });

        it('should handle null or undefined', () => {
            expect(service.censorText(null)).toBe(null);
            expect(service.censorText(undefined)).toBe(undefined);
        });

        it('should not censor non-string input', () => {
            expect(service.censorText(123)).toBe(123);
            expect(service.censorText({})).toEqual({});
        });

        it('should censor multiple instances of same word', () => {
            const text = 'fuck fuck fuck';
            const result = service.censorText(text);
            const matches = result.match(/\*/g);
            expect(matches.length).toBeGreaterThanOrEqual(12); // At least 3 words censored
        });

        it('should handle word variations with leetspeak replacements', () => {
            const text = 'f@ck sh1t';
            const result = service.censorText(text);
            expect(result).toContain('****');
        });
    });

    describe('hasProfanity', () => {
        it('should return true if text contains bad words', () => {
            const text = 'This is fucking shit';
            const result = service.hasProfanity(text);
            expect(result).toBe(true);
        });

        it('should return false for clean text', () => {
            const text = 'This is a clean message';
            const result = service.hasProfanity(text);
            expect(result).toBe(false);
        });

        it('should be case insensitive', () => {
            const text = 'FUCK SHIT';
            const result = service.hasProfanity(text);
            expect(result).toBe(true);
        });

        it('should return false for null or undefined', () => {
            expect(service.hasProfanity(null)).toBe(false);
            expect(service.hasProfanity(undefined)).toBe(false);
        });

        it('should not consider non-string input as profanity', () => {
            expect(service.hasProfanity(123)).toBe(false);
            expect(service.hasProfanity({})).toBe(false);
        });

        it('should not match partial words', () => {
            const text = 'The shitake mushroom';
            const result = service.hasProfanity(text);
            expect(result).toBe(false);
        });
    });

    describe('countBadWords', () => {
        it('should count bad words in text', () => {
            const text = 'fuck shit damn';
            const result = service.countBadWords(text);
            expect(result).toBe(3);
        });

        it('should count multiple instances of same word', () => {
            const text = 'fuck fuck fuck';
            const result = service.countBadWords(text);
            expect(result).toBe(3);
        });

        it('should return 0 for clean text', () => {
            const text = 'This is a clean message';
            const result = service.countBadWords(text);
            expect(result).toBe(0);
        });

        it('should be case insensitive', () => {
            const text = 'FUCK Shit Damn';
            const result = service.countBadWords(text);
            expect(result).toBe(3);
        });

        it('should handle null or undefined', () => {
            expect(service.countBadWords(null)).toBe(0);
            expect(service.countBadWords(undefined)).toBe(0);
        });

        it('should not count partial word matches', () => {
            const text = 'The shitake mushroom';
            const result = service.countBadWords(text);
            expect(result).toBe(0);
        });
    });
});
