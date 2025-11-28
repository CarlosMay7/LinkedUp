export class SaveUserStatsUseCase {
    constructor(statsRepository) {
        this.statsRepository = statsRepository;
    }

    async execute(userId, badWords) {
        return await this.statsRepository.incrementBadWords(userId, badWords);
    }
}
