import { useState, useEffect } from 'react';
import { supabase } from '../../auth/supabase/supabaseClient';
import { useAuth } from '../../auth/context/AuthContext';
import { RoomRepository } from '../../infrastructure/repositories/room.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { GetRoomWithMembersUseCase } from '../../core/use-cases/room/get-room-with-members.use-case';
import { GetAllRoomsUseCase } from '../../core/use-cases/room/get-all-rooms.use-case';
import { SearchRoomByNameUseCase } from '../../core/use-cases/room/search-room-by-name.use-case';

// Dependency Injection
const roomRepository = new RoomRepository(supabase);
const userRepository = new UserRepository(supabase);
const getRoomWithMembersUseCase = new GetRoomWithMembersUseCase(
    roomRepository,
    userRepository
);
const getAllRoomsUseCase = new GetAllRoomsUseCase(roomRepository);
const searchRoomByNameUseCase = new SearchRoomByNameUseCase(roomRepository);

export const useRooms = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRooms = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllRoomsUseCase.execute();
            const filteredRooms = data.filter(r => r.user_uuid !== user?.id);
            setRooms(filteredRooms);
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
            const data = await searchRoomByNameUseCase.execute(name);
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
