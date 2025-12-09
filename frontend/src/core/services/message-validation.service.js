export class MessageValidationService {
    static validateContent(content) {
        if (!content || typeof content !== 'string') {
            return {
                valid: false,
                error: 'Content must be a non-empty string',
            };
        }

        if (content.trim().length === 0) {
            return { valid: false, error: 'Content cannot be empty' };
        }

        if (content.length > 5000) {
            return {
                valid: false,
                error: 'Content cannot exceed 5000 characters',
            };
        }

        return { valid: true };
    }

    static validateSenderId(senderId) {
        if (!senderId) {
            return { valid: false, error: 'Sender ID is required' };
        }

        return { valid: true };
    }

    static validateRoomId(roomId) {
        if (!roomId) {
            return { valid: false, error: 'Room ID is required' };
        }

        return { valid: true };
    }

    static validateMessage({ content, senderId, roomId }) {
        const contentValidation = this.validateContent(content);
        if (!contentValidation.valid) {
            return contentValidation;
        }

        const senderValidation = this.validateSenderId(senderId);
        if (!senderValidation.valid) {
            return senderValidation;
        }

        const roomValidation = this.validateRoomId(roomId);
        if (!roomValidation.valid) {
            return roomValidation;
        }

        return { valid: true };
    }
}
