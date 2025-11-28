export class GetUserStatsUseCase {
    constructor(statsRepository) {
        this.statsRepository = statsRepository;
    }

    async execute(userId) {
        return await this.statsRepository.getStatsByUserId(userId);
    }
}
