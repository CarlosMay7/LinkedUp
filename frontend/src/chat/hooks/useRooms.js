import { useState, useEffect } from 'react';
import { supabase } from '../../auth/supabase/supabaseClient';
import { RoomRepository } from '../../infrastructure/repositories/room.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { GetRoomWithMembersUseCase } from '../../core/use-cases/room/get-room-with-members.use-case';

const roomRepository = new RoomRepository(supabase);
const userRepository = new UserRepository(supabase);
const getRoomWithMembersUseCase = new GetRoomWithMembersUseCase(
    roomRepository,
    userRepository
);

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
    };
};
