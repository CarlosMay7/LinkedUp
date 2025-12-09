export class UpdateProfanityStatsUseCase {
    constructor(profanityStatsRepository) {
        this.profanityStatsRepository = profanityStatsRepository;
    }

    async execute({ userId, badWordsDetected }) {
        if (!userId || !badWordsDetected) {
            throw new Error('User ID and bad words count are required');
        }

        try {
            const updated = await this.profanityStatsRepository.updateByUserId(
                userId,
                { badWordsDetected }
            );
            return updated;
        } catch (error) {
            throw new Error(`Error updating profanity stats: ${error.message}`);
        }
    }
}
