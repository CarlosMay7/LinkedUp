import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';

export const useMessages = (roomId, userId) => {
    const { on, off, sendMessage: sendMessageViaSocket } = useWebSocket();
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const [loadingHistorical, setLoadingHistorical] = useState(false);
    const loadedMessagesRef = useRef(new Set());
    const typingTimeoutRef = useRef(null);
    const messageRepositoryRef = useRef(new MessageRepository());

    // Load historical messages when room changes
    const loadHistoricalMessages = useCallback(async () => {
        setLoadingHistorical(true);
        try {
            const historicalMessages = await messageRepositoryRef.current.getMessagesByRoom(roomId);
            // Sort by sentAt in ascending order (oldest first)
            const sortedMessages = historicalMessages.sort((a, b) => {
                const timeA = new Date(a.sentAt).getTime();
                const timeB = new Date(b.sentAt).getTime();
                return timeA - timeB;
            });
            
            // Add to loaded messages and state
            sortedMessages.forEach(msg => {
                const messageKey = `${msg.senderId}-${msg.sentAt}-${msg.content}`;
                loadedMessagesRef.current.add(messageKey);
            });
            setMessages(sortedMessages);
        } catch (err) {
            console.error('Error loading historical messages:', err);
        } finally {
            setLoadingHistorical(false);
        }
    }, [roomId]);

    // Reset messages and load historical messages when changing rooms
    useEffect(() => {
        setMessages([]);
        loadedMessagesRef.current.clear();
        loadHistoricalMessages();
    }, [roomId, loadHistoricalMessages]);

    // Create memoized message handlers to prevent unnecessary re-registrations
    const handleHistoricalMessage = useMemo(
        () => data => {
            // Prevent duplicate messages using message ID or timestamp + sender combo
            const messageKey = `${data.senderId}-${data.sentAt || data.timestamp}-${data.content}`;
            if (!loadedMessagesRef.current.has(messageKey)) {
                loadedMessagesRef.current.add(messageKey);
                setMessages(prev => [...prev, data]);
            }
        },
        []
    );

    const handleNewMessage = useMemo(
        () => data => {
            const messageKey = `${data.senderId}-${data.sentAt || data.timestamp}-${data.content}`;
            if (!loadedMessagesRef.current.has(messageKey)) {
                loadedMessagesRef.current.add(messageKey);
                setMessages(prev => [...prev, data]);
            }
        },
        []
    );

    const handleTyping = useMemo(
        () => data => {
            if (data.userId !== userId) {
                setIsTyping(true);
                // Clear previous timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                }, 3000);
            }
        },
        [userId]
    );

    const handleMessageError = useMemo(
        () => data => {
            setError(data.error);
            setTimeout(() => {
                setError(null);
            }, 3000);
        },
        []
    );

    // Listen for historical messages
    useEffect(() => {
        on('historicalMessage', handleHistoricalMessage);

        return () => {
            off('historicalMessage', handleHistoricalMessage);
        };
    }, [on, off, handleHistoricalMessage]);

    // Listen for new messages
    useEffect(() => {
        on('newMessage', handleNewMessage);

        return () => {
            off('newMessage', handleNewMessage);
        };
    }, [on, off, handleNewMessage]);

    // Listen for typing indicator
    useEffect(() => {
        on('typing', handleTyping);

        return () => {
            off('typing', handleTyping);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [on, off, handleTyping]);

    // Listen for message errors
    useEffect(() => {
        on('messageError', handleMessageError);

        return () => {
            off('messageError', handleMessageError);
        };
    }, [on, off, handleMessageError]);

    const sendMessage = async content => {
        if (!content.trim()) {
            return;
        }

        try {
            setError(null);
            await sendMessageViaSocket(userId, roomId, content);
        } catch (err) {
            setError(err.message);
        }
    };

    const clearMessages = () => {
        setMessages([]);
    };

    return {
        messages,
        isTyping,
        error,
        loadingHistorical,
        sendMessage,
        clearMessages,
    };
};
