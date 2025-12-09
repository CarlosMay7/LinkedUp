import { ProfanityStatsMapper } from '../profanity-stats.mapper';
import { ProfanityStats } from '../../../core/entities/ProfanityStats';

jest.mock('../../../core/entities/ProfanityStats');

describe('ProfanityStatsMapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('toDomain', () => {
        it('should convert database record to profanity stats domain entity', () => {
            const dbRecord = {
                id: '1',
                user_id: 'user-1',
                bad_words_count: 5,
                total_violations: 2,
                last_violation_date: '2024-01-01T00:00:00Z',
            };

            ProfanityStats.fromDatabase.mockReturnValue({
                userId: 'user-1',
                badWordsCount: 5,
            });

            const result = ProfanityStatsMapper.toDomain(dbRecord);

            expect(ProfanityStats.fromDatabase).toHaveBeenCalledWith(dbRecord);
            expect(result.badWordsCount).toBe(5);
        });
    });

    describe('toDTO', () => {
        it('should convert stats entity to DTO', () => {
            const stats = {
                userId: 'user-1',
                badWordsCount: 5,
                totalViolations: 2,
                lastViolationDate: '2024-01-01T00:00:00Z',
                getSeverityLevel: jest.fn().mockReturnValue('medium'),
                exceedsThreshold: jest.fn().mockReturnValue(false),
            };

            const result = ProfanityStatsMapper.toDTO(stats);

            expect(result).toEqual({
                userId: 'user-1',
                badWordsCount: 5,
                totalViolations: 2,
                lastViolationDate: '2024-01-01T00:00:00Z',
                severityLevel: 'medium',
                exceedsThreshold: false,
            });
        });

        it('should call getSeverityLevel method', () => {
            const stats = {
                userId: 'user-2',
                badWordsCount: 10,
                totalViolations: 5,
                lastViolationDate: '2024-01-02T00:00:00Z',
                getSeverityLevel: jest.fn().mockReturnValue('high'),
                exceedsThreshold: jest.fn().mockReturnValue(true),
            };

            ProfanityStatsMapper.toDTO(stats);

            expect(stats.getSeverityLevel).toHaveBeenCalled();
        });

        it('should call exceedsThreshold method', () => {
            const stats = {
                userId: 'user-3',
                badWordsCount: 1,
                totalViolations: 1,
                lastViolationDate: '2024-01-03T00:00:00Z',
                getSeverityLevel: jest.fn().mockReturnValue('low'),
                exceedsThreshold: jest.fn().mockReturnValue(false),
            };

            ProfanityStatsMapper.toDTO(stats);

            expect(stats.exceedsThreshold).toHaveBeenCalled();
        });
    });

    describe('toDTOList', () => {
        it('should convert array of stats to DTOs', () => {
            const statsList = [
                {
                    userId: 'user-1',
                    badWordsCount: 5,
                    totalViolations: 2,
                    lastViolationDate: '2024-01-01T00:00:00Z',
                    getSeverityLevel: jest.fn().mockReturnValue('medium'),
                    exceedsThreshold: jest.fn().mockReturnValue(false),
                },
                {
                    userId: 'user-2',
                    badWordsCount: 10,
                    totalViolations: 5,
                    lastViolationDate: '2024-01-02T00:00:00Z',
                    getSeverityLevel: jest.fn().mockReturnValue('high'),
                    exceedsThreshold: jest.fn().mockReturnValue(true),
                },
            ];

            const result = ProfanityStatsMapper.toDTOList(statsList);

            expect(result).toHaveLength(2);
            expect(result[0].userId).toBe('user-1');
            expect(result[1].userId).toBe('user-2');
        });

        it('should handle empty array', () => {
            const result = ProfanityStatsMapper.toDTOList([]);

            expect(result).toEqual([]);
        });
    });

    describe('fromDTO', () => {
        it('should create stats entity from DTO', () => {
            const dto = {
                userId: 'user-1',
                badWordsCount: 5,
                totalViolations: 2,
                lastViolationDate: '2024-01-01T00:00:00Z',
            };

            ProfanityStats.mockImplementation(() => ({
                userId: 'user-1',
                badWordsCount: 5,
            }));

            ProfanityStatsMapper.fromDTO(dto);

            expect(ProfanityStats).toHaveBeenCalledWith(dto);
        });
    });

    describe('toPersistence', () => {
        it('should convert stats to persistence format', () => {
            const stats = {
                userId: 'user-1',
                badWordsCount: 5,
                totalViolations: 2,
                lastViolationDate: '2024-01-01T00:00:00Z',
            };

            const result = ProfanityStatsMapper.toPersistence(stats);

            expect(result).toEqual({
                user_id: 'user-1',
                bad_words_count: 5,
                total_violations: 2,
                last_violation_date: '2024-01-01T00:00:00Z',
            });
        });

        it('should convert camelCase to snake_case', () => {
            const stats = {
                userId: 'user-2',
                badWordsCount: 10,
                totalViolations: 5,
                lastViolationDate: '2024-01-02T00:00:00Z',
            };

            const result = ProfanityStatsMapper.toPersistence(stats);

            expect(result.user_id).toBe('user-2');
            expect(result.bad_words_count).toBe(10);
            expect(result.total_violations).toBe(5);
            expect(result.last_violation_date).toBe('2024-01-02T00:00:00Z');
        });
    });
});
