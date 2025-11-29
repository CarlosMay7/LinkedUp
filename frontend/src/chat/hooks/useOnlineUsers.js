import { useState, useEffect, useMemo } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

export const useOnlineUsers = roomId => {
    const { on, off, emit } = useWebSocket();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Memoized handlers to prevent unnecessary re-registrations
    const handleOnlineUsers = useMemo(
        () => data => {
            setOnlineUsers(data);
            setLoading(false);
        },
        []
    );

    const handleUserJoined = useMemo(
        () => data => {
            setOnlineUsers(prev => {
                if (!prev.includes(data.userId)) {
                    return [...prev, data.userId];
                }
                return prev;
            });
        },
        []
    );

    const handleUserLeft = useMemo(
        () => data => {
            setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        },
        []
    );

    // Request initial online users list when room changes
    useEffect(() => {
        setLoading(true);
        setOnlineUsers([]);

        // Listen for online users list
        on('onlineUsers', handleOnlineUsers);

        // Request the list from server
        emit('getOnlineUsers', { roomId });

        return () => {
            off('onlineUsers', handleOnlineUsers);
        };
    }, [roomId, on, off, emit, handleOnlineUsers]);

    // Listen for user join events
    useEffect(() => {
        on('userJoined', handleUserJoined);

        return () => {
            off('userJoined', handleUserJoined);
        };
    }, [on, off, handleUserJoined]);

    // Listen for user leave events
    useEffect(() => {
        on('userLeft', handleUserLeft);

        return () => {
            off('userLeft', handleUserLeft);
        };
    }, [on, off, handleUserLeft]);

    return {
        onlineUsers,
        loading,
        isUserOnline: userId => onlineUsers.includes(userId),
    };
};
