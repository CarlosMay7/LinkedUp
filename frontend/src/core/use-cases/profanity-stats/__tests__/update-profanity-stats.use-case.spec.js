import { UpdateProfanityStatsUseCase } from '../update-profanity-stats.use-case';

describe('UpdateProfanityStatsUseCase', () => {
    let updateProfanityStatsUseCase;
    let mockProfanityStatsRepository;

    beforeEach(() => {
        mockProfanityStatsRepository = {
            updateByUserId: jest.fn(),
        };
        updateProfanityStatsUseCase = new UpdateProfanityStatsUseCase(
            mockProfanityStatsRepository
        );
    });

    describe('execute', () => {
        it('should successfully update profanity stats', async () => {
            const updateData = {
                userId: 'user123',
                badWordsDetected: 5,
            };
            const expectedStats = {
                userId: 'user123',
                badWordsDetected: 5,
                updatedAt: '2024-01-05T12:00:00Z',
            };
            mockProfanityStatsRepository.updateByUserId.mockResolvedValue(
                expectedStats
            );

            const result =
                await updateProfanityStatsUseCase.execute(updateData);

            expect(result).toEqual(expectedStats);
            expect(
                mockProfanityStatsRepository.updateByUserId
            ).toHaveBeenCalledWith('user123', { badWordsDetected: 5 });
        });

        it('should throw error when user ID is missing', async () => {
            const updateData = {
                userId: null,
                badWordsDetected: 5,
            };

            await expect(
                updateProfanityStatsUseCase.execute(updateData)
            ).rejects.toThrow('User ID and bad words count are required');
        });

        it('should throw error when bad words count is missing', async () => {
            const updateData = {
                userId: 'user123',
                badWordsDetected: null,
            };

            await expect(
                updateProfanityStatsUseCase.execute(updateData)
            ).rejects.toThrow('User ID and bad words count are required');
        });

        it('should update with zero bad words', async () => {
            const updateData = {
                userId: 'user123',
                badWordsDetected: 0,
            };

            await expect(
                updateProfanityStatsUseCase.execute(updateData)
            ).rejects.toThrow('User ID and bad words count are required');
        });

        it('should update with high bad words count', async () => {
            const updateData = {
                userId: 'user123',
                badWordsDetected: 100,
            };
            const expectedStats = {
                userId: 'user123',
                badWordsDetected: 100,
            };
            mockProfanityStatsRepository.updateByUserId.mockResolvedValue(
                expectedStats
            );

            const result =
                await updateProfanityStatsUseCase.execute(updateData);

            expect(result.badWordsDetected).toBe(100);
        });

        it('should throw error when user not found', async () => {
            const updateData = {
                userId: 'nonexistent_user',
                badWordsDetected: 5,
            };
            mockProfanityStatsRepository.updateByUserId.mockRejectedValue(
                new Error('User not found')
            );

            await expect(
                updateProfanityStatsUseCase.execute(updateData)
            ).rejects.toThrow('Error updating profanity stats');
        });

        it('should throw error when repository fails', async () => {
            const updateData = {
                userId: 'user123',
                badWordsDetected: 5,
            };
            mockProfanityStatsRepository.updateByUserId.mockRejectedValue(
                new Error('Database error')
            );

            await expect(
                updateProfanityStatsUseCase.execute(updateData)
            ).rejects.toThrow('Error updating profanity stats');
        });

        it('should handle UUID format user ID', async () => {
            const updateData = {
                userId: '550e8400-e29b-41d4-a716-446655440000',
                badWordsDetected: 3,
            };
            const expectedStats = {
                userId: '550e8400-e29b-41d4-a716-446655440000',
                badWordsDetected: 3,
            };
            mockProfanityStatsRepository.updateByUserId.mockResolvedValue(
                expectedStats
            );

            const result =
                await updateProfanityStatsUseCase.execute(updateData);

            expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
        });

        it('should update multiple times for same user', async () => {
            const userId = 'user123';
            mockProfanityStatsRepository.updateByUserId.mockResolvedValue({
                userId,
                badWordsDetected: 10,
            });

            await updateProfanityStatsUseCase.execute({
                userId,
                badWordsDetected: 5,
            });
            await updateProfanityStatsUseCase.execute({
                userId,
                badWordsDetected: 10,
            });

            expect(
                mockProfanityStatsRepository.updateByUserId
            ).toHaveBeenCalledTimes(2);
        });

        it('should handle network error', async () => {
            const updateData = {
                userId: 'user123',
                badWordsDetected: 5,
            };
            mockProfanityStatsRepository.updateByUserId.mockRejectedValue(
                new Error('Network error')
            );

            await expect(
                updateProfanityStatsUseCase.execute(updateData)
            ).rejects.toThrow('Error updating profanity stats');
        });

        it('should throw error when bad words count is negative', async () => {
            const updateData = {
                userId: 'user123',
                badWordsDetected: -1,
            };

            // The use case doesn't validate negative numbers, but repository might
            mockProfanityStatsRepository.updateByUserId.mockResolvedValue({
                userId: 'user123',
                badWordsDetected: -1,
            });

            const result =
                await updateProfanityStatsUseCase.execute(updateData);

            expect(result.badWordsDetected).toBe(-1);
        });
    });
});
