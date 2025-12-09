export class ProfanityStats {
    constructor({ userId, badWordsCount, totalViolations, lastViolationDate }) {
        this.userId = userId;
        this.badWordsCount = badWordsCount;
        this.totalViolations = totalViolations;
        this.lastViolationDate = lastViolationDate;
    }

    static fromDatabase(dbRecord) {
        return new ProfanityStats({
            userId: dbRecord.user_id,
            badWordsCount: dbRecord.bad_words_count || 0,
            totalViolations: dbRecord.total_violations || 0,
            lastViolationDate: dbRecord.last_violation_date,
        });
    }

    incrementBadWordsCount(count = 1) {
        this.badWordsCount += count;
        this.totalViolations += 1;
        this.lastViolationDate = new Date().toISOString();
    }

    exceedsThreshold(threshold = 10) {
        return this.totalViolations >= threshold;
    }

    getSeverityLevel() {
        if (this.totalViolations === 0) {
            return 'NONE';
        }
        if (this.totalViolations <= 3) {
            return 'LOW';
        }
        if (this.totalViolations <= 7) {
            return 'MEDIUM';
        }
        return 'HIGH';
    }
}
