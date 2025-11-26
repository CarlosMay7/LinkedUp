import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomRepository } from '../../infrastructure/repositories/room.repository';
import { useAuth } from '../../auth/context/AuthContext';
import { ROUTES } from '../../config/constants';
import { Alert } from '../../components/Alert';

const roomRepository = new RoomRepository();

export const CreateRoomModal = ({ open, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState('');
    const [roomDescription, setRoomDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        if (!roomName.trim()) {
            setError('Room name is required');
            return;
        }

        if (!roomDescription.trim()) {
            setError('Room description is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const newRoomData = await roomRepository.createRoom(
                roomName.trim(),
                roomDescription.trim(),
                [user.id],
                user.id
            );
            setRoomName('');
            setRoomDescription('');
            onClose();
            navigate(`${ROUTES.ROOM}/${newRoomData.id}`, { replace: true });
        } catch (err) {
            setError(err.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRoomName('');
        setRoomDescription('');
        setError('');
        onClose();
    };

    if (!open) {
        return null;
    }

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
                <h3>Create New Room</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="roomName">Room Name</label>
                        <input
                            type="text"
                            id="roomName"
                            value={roomName}
                            onChange={e => setRoomName(e.target.value)}
                            placeholder="Enter room name"
                            className="form-input"
                            autoFocus
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="roomDescription">Description</label>
                        <textarea
                            id="roomDescription"
                            value={roomDescription}
                            onChange={e => setRoomDescription(e.target.value)}
                            placeholder="Enter room description"
                            className="form-textarea"
                            disabled={loading}
                        ></textarea>
                    </div>
                    {error && <Alert type="error">{error}</Alert>}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="button button-secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="button"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
