import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import profanityStatsRepository from '../../infrastructure/repositories/profanity-stats.repository';
import './ProfanityStats.css';

export const ProfanityStats = () => {
    const { user } = useAuth();
    const [totalBadWords, setTotalBadWords] = useState(0);
    const [wordStats, setWordStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Get user's total bad words
                const total =
                    await profanityStatsRepository.getUserBadWordsTotal(
                        user.id
                    );
                setTotalBadWords(total);

                // Get all word statistics
                const stats = await profanityStatsRepository.getWordStats();
                setWordStats(stats);
            } catch (err) {
                console.error('Error loading profanity stats:', err);
                setError('Error loading statistics');
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="profanity-stats loading">Loading statistics...</div>
        );
    }

    if (error) {
        return <div className="profanity-stats error">{error}</div>;
    }

    return (
        <div className="profanity-stats">
            <div className="stats-header">
                <h3>Profanity Statistics</h3>
                <div className="total-badge">
                    Total Bad Words:{' '}
                    <span className="count">{totalBadWords}</span>
                </div>
            </div>

            {wordStats.length === 0 ? (
                <div className="no-stats">No profanity detected yet</div>
            ) : (
                <div className="word-list">
                    <h4>Bad Words Breakdown</h4>
                    <ul>
                        {wordStats.map((stat, index) => (
                            <li key={index} className="word-item">
                                <span className="word">{stat.word}</span>
                                <span className="count">{stat.total}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProfanityStats;
