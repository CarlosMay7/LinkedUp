import { useState, useEffect } from 'react';
import { supabase } from '../../auth/supabase/supabaseClient';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { GetAllUsersUseCase } from '../../core/use-cases/user/get-all-users.use-case';
import { SearchUsersByUsernameUseCase } from '../../core/use-cases/user/search-users-by-username.use-case';
import { useAuth } from '../../auth/context/AuthContext';

// Dependency Injection
const userRepository = new UserRepository(supabase);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const searchUsersByUsernameUseCase = new SearchUsersByUsernameUseCase(
    userRepository
);

export const useUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllUsersUseCase.execute();
            const filteredUsers = data.filter(u => u.uuid !== user.id);
            setUsers(filteredUsers);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = async username => {
        setLoading(true);
        setError(null);
        try {
            if (username.trim() === '') {
                await fetchUsers();
                return;
            }
            const data = await searchUsersByUsernameUseCase.execute(username);
            const filteredUsers = data.filter(u => u.user_uuid !== user?.id);
            setUsers(filteredUsers);
        } catch (err) {
            setError(err.message);
            console.error('Error searching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        loading,
        error,
        fetchUsers,
        searchUsers,
    };
};
