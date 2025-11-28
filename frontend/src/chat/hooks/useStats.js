import { useState } from 'react';
import { supabase } from '../../auth/supabase/supabaseClient';
import { StatsRepository } from '../../infrastructure/repositories/stats.repository';
import { GetUserStatsUseCase } from '../../core/use-cases/stats/get-user-stats.use-case';

const statsRepository = new StatsRepository(supabase);
const getUserStatsUseCase = new GetUserStatsUseCase(statsRepository);

export const useStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStats = async (userId) => {
        setLoading(true);
        try {
            const data = await getUserStatsUseCase.execute(userId);
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { stats, loading, error, fetchStats };
};