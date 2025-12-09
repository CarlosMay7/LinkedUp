export class GetAllProfanityStatsUseCase {
    constructor(profanityStatsRepository) {
        this.profanityStatsRepository = profanityStatsRepository;
    }

    async execute() {
        try {
            const stats = await this.profanityStatsRepository.findAll();
            return stats;
        } catch (error) {
            throw new Error(
                `Error fetching all profanity stats: ${error.message}`
            );
        }
    }
}
