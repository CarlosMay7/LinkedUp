import { ProfanityStats } from '../../core/entities/ProfanityStats';

export class ProfanityStatsMapper {
    static toDomain(dbRecord) {
        return ProfanityStats.fromDatabase(dbRecord);
    }

    static toDTO(stats) {
        return {
            userId: stats.userId,
            badWordsCount: stats.badWordsCount,
            totalViolations: stats.totalViolations,
            lastViolationDate: stats.lastViolationDate,
            severityLevel: stats.getSeverityLevel(),
            exceedsThreshold: stats.exceedsThreshold(),
        };
    }

    static toDTOList(statsList) {
        return statsList.map(stats => this.toDTO(stats));
    }

    static fromDTO(dto) {
        return new ProfanityStats(dto);
    }

    static toPersistence(stats) {
        return {
            user_id: stats.userId,
            bad_words_count: stats.badWordsCount,
            total_violations: stats.totalViolations,
            last_violation_date: stats.lastViolationDate,
        };
    }
}
