import { useUsers } from '../hooks/useUsers';

export const UserManagementTable = () => {
    const {
        users,
        loading: loadingUsers,
        blockUser,
        unblockUser,
        warnUser,
    } = useUsers();

    const handleBlockUser = async userId => {
        await blockUser(userId);
    };

    const handleUnblockUser = async userId => {
        await unblockUser(userId);
    };

    const handleWarnUser = async userId => {
        await warnUser(userId);
    };

    return (
        <div className="users-section">
            <h2>User Management</h2>
            {loadingUsers ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading users...</p>
                </div>
            ) : (
                <div className="users-table">
                    <div className="table-header">
                        <div className="col-user">User</div>
                        <div className="col-messages">Obscene Messages</div>
                        <div className="col-actions">Actions</div>
                    </div>
                    {users.length === 0 ? (
                        <div className="empty-state">
                            <p>No users found</p>
                        </div>
                    ) : (
                        users.map(user => (
                            <div
                                className={`table-row ${user.blocked ? 'blocked' : ''}`}
                                key={user.uuid}
                            >
                                <div className="col-user">{user.username}</div>
                                <div className="col-messages">15</div>
                                <div className="col-actions">
                                    <button
                                        className={`action-btn btn-warn warn active`}
                                        onClick={() =>
                                            handleWarnUser(user.uuid)
                                        }
                                        disabled={user.warned}
                                    >
                                        {user.warned ? 'Warned' : 'Warn'}
                                    </button>
                                    {user.blocked ? (
                                        <button
                                            className={`action-btn btn-unblock unblock active`}
                                            onClick={() =>
                                                handleUnblockUser(user.uuid)
                                            }
                                        >
                                            Unblock
                                        </button>
                                    ) : (
                                        <button
                                            className={`action-btn btn-block block active`}
                                            onClick={() =>
                                                handleBlockUser(user.uuid)
                                            }
                                        >
                                            Block
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
