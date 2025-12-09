import { GetProfanityStatsUseCase } from '../get-profanity-stats.use-case';

describe('GetProfanityStatsUseCase', () => {
    let getProfanityStatsUseCase;
    let mockProfanityStatsRepository;

    beforeEach(() => {
        mockProfanityStatsRepository = {
            getByUserId: jest.fn(),
        };
        getProfanityStatsUseCase = new GetProfanityStatsUseCase(
            mockProfanityStatsRepository
        );
    });

    describe('execute', () => {
        it('should retrieve profanity stats for user', async () => {
            const statsData = {
                userId: 'user123',
            };
            const expectedStats = {
                userId: 'user123',
                badWordsDetected: 5,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-05T00:00:00Z',
            };
            mockProfanityStatsRepository.getByUserId.mockResolvedValue(
                expectedStats
            );

            const result = await getProfanityStatsUseCase.execute(statsData);

            expect(result).toEqual(expectedStats);
            expect(
                mockProfanityStatsRepository.getByUserId
            ).toHaveBeenCalledWith('user123');
        });

        it('should throw error when user ID is missing', async () => {
            const statsData = {
                userId: null,
            };

            await expect(
                getProfanityStatsUseCase.execute(statsData)
            ).rejects.toThrow('User ID is required');
        });

        it('should return null when no stats exist for user', async () => {
            const statsData = {
                userId: 'new_user',
            };
            mockProfanityStatsRepository.getByUserId.mockResolvedValue(null);

            const result = await getProfanityStatsUseCase.execute(statsData);

            expect(result).toBeNull();
        });

        it('should retrieve stats for user with zero violations', async () => {
            const statsData = {
                userId: 'good_user',
            };
            const expectedStats = {
                userId: 'good_user',
                badWordsDetected: 0,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            };
            mockProfanityStatsRepository.getByUserId.mockResolvedValue(
                expectedStats
            );

            const result = await getProfanityStatsUseCase.execute(statsData);

            expect(result.badWordsDetected).toBe(0);
        });

        it('should retrieve stats for user with high violation count', async () => {
            const statsData = {
                userId: 'bad_user',
            };
            const expectedStats = {
                userId: 'bad_user',
                badWordsDetected: 100,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-05T00:00:00Z',
            };
            mockProfanityStatsRepository.getByUserId.mockResolvedValue(
                expectedStats
            );

            const result = await getProfanityStatsUseCase.execute(statsData);

            expect(result.badWordsDetected).toBe(100);
        });

        it('should throw error when repository fails', async () => {
            const statsData = {
                userId: 'user123',
            };
            mockProfanityStatsRepository.getByUserId.mockRejectedValue(
                new Error('Database error')
            );

            await expect(
                getProfanityStatsUseCase.execute(statsData)
            ).rejects.toThrow('Error fetching profanity stats');
        });

        it('should handle UUID format user ID', async () => {
            const statsData = {
                userId: '550e8400-e29b-41d4-a716-446655440000',
            };
            const expectedStats = {
                userId: '550e8400-e29b-41d4-a716-446655440000',
                badWordsDetected: 3,
            };
            mockProfanityStatsRepository.getByUserId.mockResolvedValue(
                expectedStats
            );

            const result = await getProfanityStatsUseCase.execute(statsData);

            expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
        });

        it('should handle network error', async () => {
            const statsData = {
                userId: 'user123',
            };
            mockProfanityStatsRepository.getByUserId.mockRejectedValue(
                new Error('Network error')
            );

            await expect(
                getProfanityStatsUseCase.execute(statsData)
            ).rejects.toThrow('Error fetching profanity stats');
        });
    });
});
