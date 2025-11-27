
import { useState } from 'react';
import { UserManagementTable } from '../../components/UserManagementTable';
export const AdminPage = () => {
    const [autoBlockThreshold, setAutoBlockThreshold] = useState(100);

    const handleSaveActions = () => {};
    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Global Moderation Statistics</h1>
            </div>
            <div className="stats-section">
                <div className="stats-card">
                    <div className="stats-row">
                        <div className="total-words">
                            <h3>Total Words</h3>
                            <div className="filtered-today">
                                <span className="label">Filtered (Today)</span>
                                <span className="value">
                                    {/* Add statistics */}11,204
                                </span>
                            </div>
                        </div>

                        <div className="top-words">
                            <h3>Top 10 Words</h3>
                            <div className="words-list">
                                <div className="word-item">
                                    <span className="rank">1.</span>
                                    <span className="word">
                                        {/* Add words */}Word_A
                                    </span>
                                    <span className="count">
                                        {/* Word counter */}
                                    </span>
                                </div>
                                <div className="word-item">
                                    <span className="rank">2.</span>
                                    <span className="word">Word_B</span>
                                    <span className="count">(310)</span>
                                </div>
                                <div className="word-item">
                                    <span className="rank">3.</span>
                                    <span className="word">...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <UserManagementTable />

            <div className="separator"></div>
            <div className="auto-actions-section">
                <h3>Automatic Actions</h3>
                <div className="auto-block">
                    <p>
                        Automatically block account after exceeding
                        <input
                            type="number"
                            value={autoBlockThreshold}
                            onChange={e =>
                                setAutoBlockThreshold(parseInt(e.target.value))
                            }
                            className="threshold-input"
                        />
                        obscene messages.
                    </p>
                </div>
            </div>
            <div className="save-section">
                <button className="button btn-save" onClick={handleSaveActions}>
                    SAVE ACTIONS
                </button>
            </div>
        </div>
    );
};
