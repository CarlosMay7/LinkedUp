import { useState, useEffect } from 'react';
import { supabase } from '../../auth/supabase/supabaseClient';
import { RoomRepository } from '../../infrastructure/repositories/room.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { GetRoomWithMembersUseCase } from '../../core/use-cases/room/get-room-with-members.use-case';
import { WebSocketRepository } from '../../infrastructure/repositories/websocket.repository';
import { AddMemberToRoomUseCase } from '../../core/use-cases/room/add-member.use-case';

const roomRepository = new RoomRepository(supabase);
const userRepository = new UserRepository(supabase);
const webSocketRepository = new WebSocketRepository();
const getRoomWithMembersUseCase = new GetRoomWithMembersUseCase(
    roomRepository,
    userRepository
);
const addMemberToRoomUseCase = new AddMemberToRoomUseCase(roomRepository);

export const useRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRooms = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await roomRepository.getAllRooms();
            const publicRooms = data.filter(
                room => room.isDirectMessage === false
            );
            setRooms(publicRooms);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching rooms:', err);
        } finally {
            setLoading(false);
        }
    };

    const searchRoomByName = async name => {
        setLoading(true);
        setError(null);
        try {
            if (name.trim() === '') {
                await fetchRooms();
                return;
            }
            const data = await roomRepository.searchRoomByName(name);
            setRooms(data);
        } catch (err) {
            setError(err.message);
            console.error('Error searching room:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRoomById = async roomId => {
        setLoading(true);
        setError(null);
        try {
            const roomWithMembers =
                await getRoomWithMembersUseCase.execute(roomId);
            return roomWithMembers;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching room by ID:', err);
        } finally {
            setLoading(false);
        }
    };

    const addMemberToRoom = async (roomId, userId) => {
        setLoading(true);
        setError(null);
        try {
            await addMemberToRoomUseCase.execute(roomId, userId);
        } catch (err) {
            setError(err.message);
            console.error('Error adding member to room:', err);
        } finally {
            setLoading(false);
        }
    };

    const findOrCreateDirectMessage = async (userId1, userId2, createdBy) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/room/direct-message/${userId1}/${userId2}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ createdBy }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.message ||
                        'Failed to find or create direct message room'
                );
            }

            const room = await response.json();
            return room;
        } catch (err) {
            setError(err.message);
            console.error(
                'Error finding or creating direct message room:',
                err
            );
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return {
        rooms,
        loading,
        error,
        fetchRooms,
        searchRoomByName,
        getRoomById,
        addMemberToRoom,
        findOrCreateDirectMessage,
    };
};
