import { useState, useEffect } from 'react';
import { supabase } from '../../auth/supabase/supabaseClient';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { GetAllUsersUseCase } from '../../core/use-cases/user/get-all-users.use-case';
import { SearchUsersByUsernameUseCase } from '../../core/use-cases/user/search-users-by-username.use-case';
import { BlockUserUseCase } from '../../core/use-cases/user/block-user.use-case';
import { UnblockUserUseCase } from '../../core/use-cases/user/unblock-user.use-case';
import { WarnUserUseCase } from '../../core/use-cases/user/warn-user.use-case';
import { useAuth } from '../../auth/context/AuthContext';

// Dependency Injection
const userRepository = new UserRepository(supabase);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const searchUsersByUsernameUseCase = new SearchUsersByUsernameUseCase(
    userRepository
);
const blockUserUseCase = new BlockUserUseCase(userRepository);
const unblockUserUseCase = new UnblockUserUseCase(userRepository);
const warnUserUseCase = new WarnUserUseCase(userRepository);

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

    const blockUser = async userId => {
        try {
            await blockUserUseCase.execute(userId);
            await fetchUsers();
        } catch (err) {
            setError(err.message);
            console.error('Error blocking user:', err);
        }
    };

    const unblockUser = async userId => {
        try {
            await unblockUserUseCase.execute(userId);
            await fetchUsers();
        } catch (err) {
            setError(err.message);
            console.error('Error unblocking user:', err);
        }
    };

    const warnUser = async userId => {
        try {
            await warnUserUseCase.execute(userId);
            await fetchUsers();
        } catch (err) {
            setError(err.message);
            console.error('Error warning user:', err);
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
        blockUser,
        unblockUser,
        warnUser,
    };
};
