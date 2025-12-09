export class GetProfanityStatsUseCase {
    constructor(profanityStatsRepository) {
        this.profanityStatsRepository = profanityStatsRepository;
    }

    async execute({ userId }) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            const stats =
                await this.profanityStatsRepository.getByUserId(userId);
            return stats;
        } catch (error) {
            throw new Error(`Error fetching profanity stats: ${error.message}`);
        }
    }
}
