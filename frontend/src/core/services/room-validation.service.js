export class RoomValidationService {
    static validateName(name) {
        if (!name || typeof name !== 'string') {
            return {
                valid: false,
                error: 'Room name must be a non-empty string',
            };
        }

        if (name.trim().length === 0) {
            return { valid: false, error: 'Room name cannot be empty' };
        }

        if (name.length < 3) {
            return {
                valid: false,
                error: 'Room name must be at least 3 characters',
            };
        }

        if (name.length > 100) {
            return {
                valid: false,
                error: 'Room name cannot exceed 100 characters',
            };
        }

        return { valid: true };
    }

    static validateCreatorId(creatorId) {
        if (!creatorId) {
            return { valid: false, error: 'Creator ID is required' };
        }

        return { valid: true };
    }

    static validateMembers(members) {
        if (!Array.isArray(members)) {
            return { valid: false, error: 'Members must be an array' };
        }

        return { valid: true };
    }

    static validateCreation({ name, createdBy, members = [] }) {
        const nameValidation = this.validateName(name);
        if (!nameValidation.valid) {
            return nameValidation;
        }

        const creatorValidation = this.validateCreatorId(createdBy);
        if (!creatorValidation.valid) {
            return creatorValidation;
        }

        const membersValidation = this.validateMembers(members);
        if (!membersValidation.valid) {
            return membersValidation;
        }

        return { valid: true };
    }
}
