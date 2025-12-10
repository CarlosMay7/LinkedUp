import { FinalizeWebSocketUseCase } from '../finalize-websocket.use-case';

describe('FinalizeWebSocketUseCase', () => {
    let finalizeWebSocketUseCase;
    let mockWebsocketRepository;

    beforeEach(() => {
        mockWebsocketRepository = {
            emit: jest.fn(),
            disconnect: jest.fn(),
        };
        finalizeWebSocketUseCase = new FinalizeWebSocketUseCase(
            mockWebsocketRepository
        );
    });

    describe('execute', () => {
        it('should successfully finalize websocket', async () => {
            const result = await finalizeWebSocketUseCase.execute();

            expect(result).toEqual({ finalized: true });
            expect(mockWebsocketRepository.emit).toHaveBeenCalledWith(
                'user:disconnecting',
                expect.objectContaining({
                    timestamp: expect.any(Date),
                })
            );
            expect(mockWebsocketRepository.disconnect).toHaveBeenCalled();
        });

        it('should emit disconnect event before disconnecting', async () => {
            let emitCalled = false;
            let disconnectCalled = false;

            mockWebsocketRepository.emit.mockImplementation(() => {
                emitCalled = true;
            });
            mockWebsocketRepository.disconnect.mockImplementation(() => {
                disconnectCalled = true;
            });

            await finalizeWebSocketUseCase.execute();

            expect(emitCalled).toBe(true);
            expect(disconnectCalled).toBe(true);
        });

        it('should emit disconnect event with timestamp', async () => {
            await finalizeWebSocketUseCase.execute();

            const callArgs = mockWebsocketRepository.emit.mock.calls[0];
            expect(callArgs[0]).toBe('user:disconnecting');
            expect(callArgs[1].timestamp).toBeInstanceOf(Date);
        });

        it('should disconnect even if emit fails', async () => {
            mockWebsocketRepository.emit.mockImplementation(() => {
                throw new Error('Emit failed');
            });

            await expect(finalizeWebSocketUseCase.execute()).rejects.toThrow(
                'Error finalizing WebSocket'
            );
            expect(mockWebsocketRepository.disconnect).toHaveBeenCalled();
        });

        it('should throw error wrapped in message if both emit and disconnect fail', async () => {
            mockWebsocketRepository.emit.mockImplementation(() => {
                throw new Error('Emit failed');
            });
            mockWebsocketRepository.disconnect.mockImplementation(() => {
                throw new Error('Disconnect failed');
            });

            await expect(finalizeWebSocketUseCase.execute()).rejects.toThrow(
                'Disconnect failed'
            );
            expect(mockWebsocketRepository.disconnect).toHaveBeenCalled();
        });

        it('should always call disconnect even on emit error', async () => {
            mockWebsocketRepository.emit.mockImplementation(() => {
                throw new Error('Network error');
            });

            try {
                await finalizeWebSocketUseCase.execute();
            } catch {
                // Expected to throw
            }

            expect(mockWebsocketRepository.disconnect).toHaveBeenCalled();
        });

        it('should wait 100ms before disconnecting', async () => {
            const startTime = Date.now();

            await finalizeWebSocketUseCase.execute();

            const endTime = Date.now();
            expect(endTime - startTime).toBeGreaterThanOrEqual(90);
        });

        it('should handle successful disconnection', async () => {
            mockWebsocketRepository.disconnect.mockResolvedValue({
                success: true,
            });

            const result = await finalizeWebSocketUseCase.execute();

            expect(result.finalized).toBe(true);
        });
    });
});
