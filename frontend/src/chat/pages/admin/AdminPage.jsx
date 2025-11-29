import { useState, useEffect } from 'react';
import { UserManagementTable } from '../../components/UserManagementTable';
import profanityStatsRepository from '../../../infrastructure/repositories/profanity-stats.repository';
import './AdminPage.css';

export const AdminPage = () => {
    const [totalBadWords, setTotalBadWords] = useState(0);
    const [topWords, setTopWords] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProfanityStats();
    }, []);

    const loadProfanityStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get all bad words statistics
            const wordsData = await profanityStatsRepository.getWordStats();

            // Get top 10 users with most bad words
            const usersData = await profanityStatsRepository.getTopUsers(10);

            // Calculate total and get top 10 words
            const total = wordsData.reduce((sum, word) => sum + word.total, 0);
            const top10Words = wordsData.slice(0, 10);

            setTotalBadWords(total);
            setTopWords(top10Words);
            setTopUsers(usersData);
        } catch (err) {
            console.error('Error loading profanity stats:', err);
            setError('Error loading statistics');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Global Moderation Statistics</h1>
            </div>
            <div className="stats-section">
                <div className="stats-card">
                    {error && <div className="error-message">{error}</div>}
                    {loading ? (
                        <div className="loading">Loading statistics...</div>
                    ) : (
                        <div className="stats-row">
                            <div className="total-words">
                                <h3>Total Words</h3>
                                <div className="filtered-today">
                                    <span className="label">Filtered</span>
                                    <span className="value">
                                        {formatNumber(totalBadWords)}
                                    </span>
                                </div>
                            </div>

                            <div className="top-words">
                                <h3>Top 10 Words</h3>
                                <div className="words-list">
                                    {topWords.length > 0 ? (
                                        topWords.map((wordData, index) => (
                                            <div key={index} className="word-item">
                                                <span className="rank">{index + 1}.</span>
                                                <span className="word">{wordData.word}</span>
                                                <span className="count">
                                                    ({wordData.total})
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-data">
                                            No bad words data available
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="top-users">
                                <h3>Top Usuarios</h3>
                                <div className="users-list">
                                    {topUsers.length > 0 ? (
                                        topUsers.map((userData, index) => (
                                            <div key={index} className="user-item">
                                                <span className="rank">{index + 1}.</span>
                                                <span className="user-id">
                                                    {userData.username}
                                                </span>
                                                <span className="count">
                                                    {userData.total_bad_words}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-data">
                                            No user data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <UserManagementTable />
        </div>
    );
};
