import { UserStats } from '../../core/entities/UserStats';

export class StatsRepository {
    constructor(dbClient) {
        this.dbClient = dbClient;
    }

    async getStatsByUserId(userId) {
        const { data, error } = await this.dbClient
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data ? new UserStats({ 
            userId: data.user_id,
            messages: data.messages,
            totalBad: data.total_bad,
            words: data.words
        }) : null;
    }

    async saveStats(stats) {
        const { data, error } = await this.dbClient
            .from('user_stats')
            .upsert({
                user_id: stats.userId,
                messages: stats.messages,
                total_bad: stats.totalBad,
                words: stats.words
            })
            .select();

        if (error) throw error;
        return data?.[0];
    }

    async incrementBadWords(userId, badWords) {
        const existing = await this.getStatsByUserId(userId);
        const words = { ...(existing?.words || {}) };

        for (const [w, c] of Object.entries(badWords)) {
            words[w] = (words[w] || 0) + c;
        }

        const newStats = new UserStats({
            userId,
            messages: (existing?.messages || 0) + 1,
            totalBad: (existing?.totalBad || 0) + Object.values(badWords).reduce((a,b) => a+b, 0),
            words
        });

        return this.saveStats(newStats);
    }
}
