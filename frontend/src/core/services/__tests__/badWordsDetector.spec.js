import { BadWordsDetectorService } from '../badWordsDetector';

describe('BadWordsDetectorService', () => {
    let service;

    beforeEach(() => {
        service = new BadWordsDetectorService();
    });

    describe('detectBadWords', () => {
        it('should detect bad words in text', () => {
            const text = 'This is bullshit';
            const result = service.detectBadWords(text);
            expect(result).toContain('bullshit');
        });

        it('should detect multiple bad words', () => {
            const text = 'This is a fuck bullshit';
            const result = service.detectBadWords(text);
            expect(result.length).toBe(2);
            expect(result).toContain('fuck');
            expect(result).toContain('bullshit');
        });

        it('should be case insensitive', () => {
            const text = 'FUCK this SHIT';
            const result = service.detectBadWords(text);
            expect(result.length).toBe(2);
        });

        it('should return empty array for clean text', () => {
            const text = 'This is a clean message';
            const result = service.detectBadWords(text);
            expect(result).toEqual([]);
        });

        it('should return empty array for empty string', () => {
            const result = service.detectBadWords('');
            expect(result).toEqual([]);
        });

        it('should return empty array for null or undefined', () => {
            expect(service.detectBadWords(null)).toEqual([]);
            expect(service.detectBadWords(undefined)).toEqual([]);
        });

        it('should not match partial words', () => {
            const text = 'The shitake mushroom is delicious';
            const result = service.detectBadWords(text);
            expect(result).not.toContain('shit');
        });

        it('should handle non-string input', () => {
            expect(service.detectBadWords(123)).toEqual([]);
            expect(service.detectBadWords({})).toEqual([]);
        });
    });

    describe('getUniqueDetectedWords', () => {
        it('should return unique detected words with count', () => {
            const text = 'fuck fuck shit';
            const result = service.getUniqueDetectedWords(text);
            expect(result['fuck']).toBe(2);
            expect(result['shit']).toBe(1);
        });

        it('should handle text with no bad words', () => {
            const text = 'clean text here';
            const result = service.getUniqueDetectedWords(text);
            expect(result).toEqual({});
        });

        it('should count case-insensitive matches', () => {
            const text = 'FUCK Fuck fuck';
            const result = service.getUniqueDetectedWords(text);
            expect(result['fuck']).toBe(3);
        });
    });

    describe('censorAndDetect', () => {
        it('should return object with original text and detected words', () => {
            const text = 'This is fuck bullshit';
            const result = service.censorAndDetect(text);
            expect(result.original).toBe(text);
            expect(result.detectedWords).toContain('fuck');
            expect(result.detectedWords).toContain('bullshit');
        });

        it('should count detected bad words', () => {
            const text = 'fuck shit damn';
            const result = service.censorAndDetect(text);
            expect(result.count).toBe(3);
        });

        it('should include unique words in result', () => {
            const text = 'fuck fuck shit';
            const result = service.censorAndDetect(text);
            expect(result.uniqueWords['fuck']).toBe(2);
            expect(result.uniqueWords['shit']).toBe(1);
        });

        it('should return count of 0 for clean text', () => {
            const text = 'clean text';
            const result = service.censorAndDetect(text);
            expect(result.count).toBe(0);
            expect(result.detectedWords).toEqual([]);
        });
    });
});
