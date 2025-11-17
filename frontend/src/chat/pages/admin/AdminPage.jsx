import { useState } from 'react';

export const AdminPage = () => {
    const [manualActions, setManualActions] = useState({
        User_X: '',
        User_Y: '',
        User_Z: '',
        User_A: '',
    });

    const [autoBlockThreshold, setAutoBlockThreshold] = useState(100);

    const handleManualAction = (user, action) => {
        setManualActions(prev => ({
            ...prev,
            [user]: action,
        }));
    };

    const handleSaveActions = () => {
        console.log('Actions saved:', {
            manualActions,
            autoBlockThreshold,
        });
        alert('Actions saved successfully');
    };

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

            <div className="users-section">
                <h2>Manual User Management</h2>
                <div className="users-table">
                    <div className="table-header">
                        <div className="col-usuario">User</div>
                        <div className="col-mensajes">Obscene Messages</div>
                        <div className="col-acciones">Manual Actions</div>
                    </div>

                    <div className="table-row">
                        <div className="col-usuario">User_X</div>
                        <div className="col-mensajes">15</div>
                        <div className="col-acciones">
                            <button
                                className={`action-btn btn-advertir ${manualActions.User_X === 'warn' ? 'active' : ''}`}
                                onClick={() =>
                                    handleManualAction('User_X', 'warn')
                                }
                            >
                                Warn
                            </button>
                            <button
                                className={`action-btn btn-bloquear ${manualActions.User_X === 'block' ? 'active' : ''}`}
                                onClick={() =>
                                    handleManualAction('User_X', 'block')
                                }
                            >
                                Block
                            </button>
                        </div>
                    </div>

                    <div className="table-row">
                        <div className="col-usuario">User_Y</div>
                        <div className="col-mensajes">92</div>
                        <div className="col-acciones">
                            <span className="advertido">Warned</span>
                            <button
                                className={`action-btn btn-bloquear ${manualActions.User_Y === 'block' ? 'active' : ''}`}
                                onClick={() =>
                                    handleManualAction('User_Y', 'block')
                                }
                            >
                                Block
                            </button>
                        </div>
                    </div>

                    <div className="table-row">
                        <div className="col-usuario">User_Z</div>
                        <div className="col-mensajes">101</div>
                        <div className="col-acciones">
                            <span className="bloqueado">Blocked</span>
                        </div>
                    </div>
                </div>
            </div>

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
