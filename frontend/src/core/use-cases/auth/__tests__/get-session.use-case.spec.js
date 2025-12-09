import { GetSessionUseCase } from '../get-session.use-case';

describe('GetSessionUseCase', () => {
    let getSessionUseCase;
    let mockAuthRepository;

    beforeEach(() => {
        mockAuthRepository = {
            getSession: jest.fn(),
        };
        getSessionUseCase = new GetSessionUseCase(mockAuthRepository);
    });

    describe('execute', () => {
        it('should retrieve current user session', async () => {
            const expectedSessionData = {
                user: { id: '123', email: 'user@example.com' },
                session: { access_token: 'token123', expires_in: 3600 },
            };
            mockAuthRepository.getSession.mockResolvedValue({
                data: expectedSessionData,
                error: null,
            });

            const result = await getSessionUseCase.execute();

            expect(result).toEqual(expectedSessionData);
            expect(mockAuthRepository.getSession).toHaveBeenCalled();
        });

        it('should return null when no session exists', async () => {
            mockAuthRepository.getSession.mockResolvedValue({
                data: null,
                error: null,
            });

            const result = await getSessionUseCase.execute();

            expect(result).toBeNull();
        });

        it('should throw error when session retrieval fails', async () => {
            const error = new Error('Failed to retrieve session');
            mockAuthRepository.getSession.mockResolvedValue({
                data: null,
                error,
            });

            await expect(getSessionUseCase.execute()).rejects.toThrow(
                'Failed to retrieve session'
            );
        });

        it('should handle network error during session retrieval', async () => {
            const networkError = new Error('Network error');
            mockAuthRepository.getSession.mockResolvedValue({
                data: null,
                error: networkError,
            });

            await expect(getSessionUseCase.execute()).rejects.toThrow(
                'Network error'
            );
        });
    });
});
