import { GetAllProfanityStatsUseCase } from '../get-all-profanity-stats.use-case';

describe('GetAllProfanityStatsUseCase', () => {
    let getAllProfanityStatsUseCase;
    let mockProfanityStatsRepository;

    beforeEach(() => {
        mockProfanityStatsRepository = {
            findAll: jest.fn(),
        };
        getAllProfanityStatsUseCase = new GetAllProfanityStatsUseCase(
            mockProfanityStatsRepository
        );
    });

    describe('execute', () => {
        it('should retrieve all profanity stats', async () => {
            const expectedStats = [
                {
                    userId: 'user1',
                    badWordsDetected: 5,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-05T00:00:00Z',
                },
                {
                    userId: 'user2',
                    badWordsDetected: 12,
                    createdAt: '2024-01-02T00:00:00Z',
                    updatedAt: '2024-01-05T00:00:00Z',
                },
                {
                    userId: 'user3',
                    badWordsDetected: 0,
                    createdAt: '2024-01-03T00:00:00Z',
                    updatedAt: '2024-01-03T00:00:00Z',
                },
            ];
            mockProfanityStatsRepository.findAll.mockResolvedValue(
                expectedStats
            );

            const result = await getAllProfanityStatsUseCase.execute();

            expect(result).toEqual(expectedStats);
            expect(result).toHaveLength(3);
            expect(mockProfanityStatsRepository.findAll).toHaveBeenCalled();
        });

        it('should return empty array when no stats exist', async () => {
            mockProfanityStatsRepository.findAll.mockResolvedValue([]);

            const result = await getAllProfanityStatsUseCase.execute();

            expect(result).toEqual([]);
        });

        it('should include stats for users with zero violations', async () => {
            const expectedStats = [
                {
                    userId: 'good_user',
                    badWordsDetected: 0,
                },
                {
                    userId: 'bad_user',
                    badWordsDetected: 25,
                },
            ];
            mockProfanityStatsRepository.findAll.mockResolvedValue(
                expectedStats
            );

            const result = await getAllProfanityStatsUseCase.execute();

            expect(result.some(s => s.badWordsDetected === 0)).toBe(true);
            expect(result.some(s => s.badWordsDetected > 0)).toBe(true);
        });

        it('should throw error when repository fails', async () => {
            mockProfanityStatsRepository.findAll.mockRejectedValue(
                new Error('Database error')
            );

            await expect(getAllProfanityStatsUseCase.execute()).rejects.toThrow(
                'Error fetching all profanity stats'
            );
        });

        it('should return all users profanity stats', async () => {
            const expectedStats = [
                { userId: 'user1', badWordsDetected: 5 },
                { userId: 'user2', badWordsDetected: 10 },
                { userId: 'user3', badWordsDetected: 15 },
                { userId: 'user4', badWordsDetected: 20 },
            ];
            mockProfanityStatsRepository.findAll.mockResolvedValue(
                expectedStats
            );

            const result = await getAllProfanityStatsUseCase.execute();

            expect(result).toHaveLength(4);
            expect(mockProfanityStatsRepository.findAll).toHaveBeenCalled();
        });

        it('should handle large dataset of stats', async () => {
            const largeStats = Array.from({ length: 1000 }, (_, i) => ({
                userId: `user${i}`,
                badWordsDetected: Math.floor(Math.random() * 100),
            }));
            mockProfanityStatsRepository.findAll.mockResolvedValue(largeStats);

            const result = await getAllProfanityStatsUseCase.execute();

            expect(result).toHaveLength(1000);
        });

        it('should include all required fields in results', async () => {
            const expectedStats = [
                {
                    userId: 'user1',
                    badWordsDetected: 5,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-05T00:00:00Z',
                },
            ];
            mockProfanityStatsRepository.findAll.mockResolvedValue(
                expectedStats
            );

            const result = await getAllProfanityStatsUseCase.execute();

            expect(result[0]).toHaveProperty('userId');
            expect(result[0]).toHaveProperty('badWordsDetected');
            expect(result[0]).toHaveProperty('createdAt');
            expect(result[0]).toHaveProperty('updatedAt');
        });

        it('should handle network error', async () => {
            mockProfanityStatsRepository.findAll.mockRejectedValue(
                new Error('Network error')
            );

            await expect(getAllProfanityStatsUseCase.execute()).rejects.toThrow(
                'Error fetching all profanity stats'
            );
        });

        it('should handle timeout error', async () => {
            mockProfanityStatsRepository.findAll.mockRejectedValue(
                new Error('Request timeout')
            );

            await expect(getAllProfanityStatsUseCase.execute()).rejects.toThrow(
                'Error fetching all profanity stats'
            );
        });
    });
});
