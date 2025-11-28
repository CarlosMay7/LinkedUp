import { useState, useCallback } from 'react';
import { supabase } from '../../auth/supabase/supabaseClient';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';

const messageRepository = new MessageRepository(supabase);

export const useHistoricalMessages = () => {
    const [historicalMessages, setHistoricalMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadMessagesByRoom = useCallback(async (roomId) => {
        setLoading(true);
        setError(null);
        try {
            const messages = await messageRepository.getMessagesByRoom(roomId);
            // Sort messages by sentAt in ascending order (oldest first)
            const sortedMessages = messages.sort((a, b) => {
                const timeA = new Date(a.sentAt).getTime();
                const timeB = new Date(b.sentAt).getTime();
                return timeA - timeB;
            });
            setHistoricalMessages(sortedMessages);
            return sortedMessages;
        } catch (err) {
            setError(err.message);
            console.error('Error loading historical messages:', err);
            setHistoricalMessages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearHistoricalMessages = useCallback(() => {
        setHistoricalMessages([]);
    }, []);

    return {
        historicalMessages,
        loading,
        error,
        loadMessagesByRoom,
        clearHistoricalMessages,
    };
};
