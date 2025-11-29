import { supabase } from '../../auth/supabase/supabaseClient';
import { UserRepository } from './user.repository';

export class ProfanityStatsRepository {
    constructor() {
        this.userRepository = new UserRepository(supabase);
    }
    async trackBadWords(userId, messageContent, badWords) {
        if (!badWords || badWords.length === 0) {
            return;
        }

        try {
            await this.updateUserBadWordsTotal(userId, badWords.length);

            for (const word of badWords) {
                await this.updateWordStatistic(word);
            }
        } catch (error) {
            console.error('Error tracking bad words:', error);
            throw error;
        }
    }

    async updateUserBadWordsTotal(userId, count) {
        try {
            const { data: existingData, error: selectError } = await supabase
                .from('user_stats')
                .select('total_bad_words')
                .eq('user_id', userId)
                .single();

            if (selectError && selectError.code !== 'PGRST116') {
                throw selectError;
            }

            if (existingData) {
                const { error: updateError } = await supabase
                    .from('user_stats')
                    .update({
                        total_bad_words: existingData.total_bad_words + count,
                    })
                    .eq('user_id', userId);

                if (updateError) {
                    throw updateError;
                }
            } else {
                const { error: insertError } = await supabase
                    .from('user_stats')
                    .insert({
                        user_id: userId,
                        total_bad_words: count,
                    });

                if (insertError) {
                    throw insertError;
                }
            }
        } catch (error) {
            console.error('Error updating user bad words total:', error);
            throw error;
        }
    }

    async updateWordStatistic(word) {
        try {
            const normalizedWord = word.toLowerCase();

            const { data: existingWord, error: selectError } = await supabase
                .from('bad_words')
                .select('total')
                .eq('word', normalizedWord)
                .single();

            if (selectError && selectError.code !== 'PGRST116') {
                throw selectError;
            }

            if (existingWord) {
                const { error: updateError } = await supabase
                    .from('bad_words')
                    .update({
                        total: existingWord.total + 1,
                    })
                    .eq('word', normalizedWord);

                if (updateError) {
                    throw updateError;
                }
            } else {
                const { error: insertError } = await supabase
                    .from('bad_words')
                    .insert([
                        {
                            word: normalizedWord,
                            total: 1,
                        },
                    ]);

                if (insertError) {
                    throw insertError;
                }
            }
        } catch (error) {
            console.error('Error updating word statistic:', error);
            throw error;
        }
    }

    async getWordStats() {
        try {
            const { data, error } = await supabase
                .from('bad_words')
                .select('*')
                .order('total', { ascending: false });

            if (error) {
                throw error;
            }
            return data || [];
        } catch (error) {
            console.error('Error getting word stats:', error);
            throw error;
        }
    }

    async getUserBadWordsTotal(userId) {
        try {
            const { data, error } = await supabase
                .from('user_stats')
                .select('total_bad_words')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return data?.total_bad_words || 0;
        } catch (error) {
            console.error('Error getting user bad words total:', error);
            throw error;
        }
    }

    async getUserStats(userId) {
        try {
            const { data, error } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return data || null;
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    async getTopUsers(limit = 10) {
        try {
            // Get all users
            const allUsers = await this.userRepository.getAllUsers();

            // Get top users from user_stats
            const { data: statsData, error: statsError } = await supabase
                .from('user_stats')
                .select('user_id, total_bad_words')
                .order('total_bad_words', { ascending: false })
                .limit(limit)
                .gt('total_bad_words', 0);

            if (statsError) {
                throw statsError;
            }

            if (!statsData || statsData.length === 0) {
                return [];
            }

            // Create a map of users by both id and uuid for lookup
            const userMap = {};
            allUsers.forEach(user => {
                userMap[user.id] = user;
                userMap[user.uuid] = user; // Map both id and uuid
            });

            // Merge stats with user data
            const topUsersWithNames = statsData
                .map(userStat => {
                    const user = userMap[userStat.user_id];
                    return {
                        ...userStat,
                        username: user?.username || 'Unknown User',
                    };
                })
                .filter(user => user.username !== 'Unknown User'); // Filter only users with valid usernames

            return topUsersWithNames;
        } catch (error) {
            console.error('Error getting top users:', error);
            throw error;
        }
    }
}

export default new ProfanityStatsRepository();
