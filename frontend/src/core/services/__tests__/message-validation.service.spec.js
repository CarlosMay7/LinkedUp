import { MessageValidationService } from '../message-validation.service';

describe('MessageValidationService', () => {
    describe('validateContent', () => {
        it('should validate non-empty string content', () => {
            const result = MessageValidationService.validateContent('Hello');
            expect(result.valid).toBe(true);
        });

        it('should reject empty string', () => {
            const result = MessageValidationService.validateContent('');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Content must be a non-empty string');
        });

        it('should reject whitespace-only content', () => {
            const result = MessageValidationService.validateContent('   ');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Content cannot be empty');
        });

        it('should reject non-string content', () => {
            const result = MessageValidationService.validateContent(123);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Content must be a non-empty string');
        });

        it('should reject null content', () => {
            const result = MessageValidationService.validateContent(null);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Content must be a non-empty string');
        });

        it('should reject undefined content', () => {
            const result = MessageValidationService.validateContent(undefined);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Content must be a non-empty string');
        });

        it('should reject content exceeding 5000 characters', () => {
            const longContent = 'a'.repeat(5001);
            const result =
                MessageValidationService.validateContent(longContent);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Content cannot exceed 5000 characters');
        });

        it('should accept content at exactly 5000 characters', () => {
            const content = 'a'.repeat(5000);
            const result = MessageValidationService.validateContent(content);
            expect(result.valid).toBe(true);
        });

        it('should accept content with special characters', () => {
            const result =
                MessageValidationService.validateContent('Hello! @#$%^&*()');
            expect(result.valid).toBe(true);
        });
    });

    describe('validateSenderId', () => {
        it('should validate non-empty senderId', () => {
            const result = MessageValidationService.validateSenderId('user123');
            expect(result.valid).toBe(true);
        });

        it('should reject empty senderId', () => {
            const result = MessageValidationService.validateSenderId('');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Sender ID is required');
        });

        it('should reject null senderId', () => {
            const result = MessageValidationService.validateSenderId(null);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Sender ID is required');
        });

        it('should reject undefined senderId', () => {
            const result = MessageValidationService.validateSenderId(undefined);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Sender ID is required');
        });
    });

    describe('validateRoomId', () => {
        it('should validate non-empty roomId', () => {
            const result = MessageValidationService.validateRoomId('room123');
            expect(result.valid).toBe(true);
        });

        it('should reject empty roomId', () => {
            const result = MessageValidationService.validateRoomId('');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Room ID is required');
        });

        it('should reject null roomId', () => {
            const result = MessageValidationService.validateRoomId(null);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Room ID is required');
        });

        it('should reject undefined roomId', () => {
            const result = MessageValidationService.validateRoomId(undefined);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Room ID is required');
        });
    });

    describe('validateMessage', () => {
        it('should validate complete message object', () => {
            const result = MessageValidationService.validateMessage({
                content: 'Hello world',
                senderId: 'user123',
                roomId: 'room456',
            });
            expect(result.valid).toBe(true);
        });

        it('should return content error if content is invalid', () => {
            const result = MessageValidationService.validateMessage({
                content: '',
                senderId: 'user123',
                roomId: 'room456',
            });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Content must be a non-empty string');
        });

        it('should return sender error if senderId is invalid', () => {
            const result = MessageValidationService.validateMessage({
                content: 'Hello world',
                senderId: '',
                roomId: 'room456',
            });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Sender ID is required');
        });

        it('should return room error if roomId is invalid', () => {
            const result = MessageValidationService.validateMessage({
                content: 'Hello world',
                senderId: 'user123',
                roomId: '',
            });
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Room ID is required');
        });

        it('should validate messages with special characters', () => {
            const result = MessageValidationService.validateMessage({
                content: 'Hello! @#$%^&*() 你好',
                senderId: 'user123',
                roomId: 'room456',
            });
            expect(result.valid).toBe(true);
        });
    });
});
