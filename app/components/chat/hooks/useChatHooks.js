import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';

// Custom hook for socket management
export const useSocket = (projectId) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {
        const socket = io({
            path: '/socket.io',
            transports: ['polling', 'websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            withCredentials: true
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
            setConnectionError(null);
            socket.emit('joinProject', projectId);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
            setConnectionError('Error de conexión con el chat');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, [projectId]);

    return {
        socket: socketRef.current,
        isConnected,
        connectionError
    };
};

// Custom hook for messages management
export const useMessages = (projectId, socket) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMessages = useCallback(async () => {
        setError(null);
        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/messages`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error fetching messages');
            }

            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError(error.message || 'Error fetching messages');
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            setMessages(prev => [...prev, message]);
        };

        const handleMessageEdited = (payload) => {
            const updated = payload?.message || payload;
            if (!updated?.id) return;
            setMessages(prev => prev.map(m => (m.id === updated.id ? updated : m)));
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageEdited', handleMessageEdited);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messageEdited', handleMessageEdited);
        };
    }, [socket]);

    const addMessage = useCallback((message) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const updateMessage = useCallback((messageId, updates) => {
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, ...updates } : m
        ));
    }, []);

    const markMessageAsDeleted = useCallback((messageId) => {
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, content: '' } : m
        ));
    }, []);

    return {
        messages,
        isLoading,
        error,
        setError,
        addMessage,
        updateMessage,
        markMessageAsDeleted,
        refetch: fetchMessages
    };
};

// Custom hook for message editing
export const useMessageEditor = (projectId, socket, updateMessage, markMessageAsDeleted, messages, userId) => {
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState('');

    const userMessages = useMemo(() =>
        messages.filter(m => m.userId === userId),
        [messages, userId]
    );

    const lastUserMessage = useMemo(() =>
        userMessages.at(-1),
        [userMessages]
    );

    const canEditLast = useMemo(() =>
        !!lastUserMessage && !!lastUserMessage.content && !!lastUserMessage.content.trim(),
        [lastUserMessage]
    );

    const canDeleteLast = useMemo(() =>
        !!lastUserMessage,
        [lastUserMessage]
    );

    const startEditLast = useCallback(() => {
        if (!canEditLast) return;
        setEditingMessageId(lastUserMessage.id);
        setEditText(lastUserMessage.content);
    }, [canEditLast, lastUserMessage]);

    const cancelEdit = useCallback(() => {
        setEditingMessageId(null);
        setEditText('');
    }, []);

    const saveEdit = useCallback(async (e) => {
        e?.preventDefault?.();
        if (!editingMessageId || !editText.trim()) return;

        try {
            const response = await fetch(`/api/projects/${projectId}/messages/${editingMessageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editText.trim() })
            });

            const updated = await response.json();
            if (!response.ok) {
                throw new Error(updated?.error || 'Error updating message');
            }

            updateMessage(updated.id, updated);
            setEditingMessageId(null);
            setEditText('');

            if (socket?.connected) {
                socket.emit('messageEdited', { projectId, message: updated });
            }
        } catch (err) {
            console.error('Error updating message:', err);
            throw new Error(err.message || 'Error updating message');
        }
    }, [editingMessageId, editText, projectId, socket, updateMessage]);

    const deleteLast = useCallback(async () => {
        if (!canDeleteLast) return;

        try {
            const response = await fetch(`/api/projects/${projectId}/messages/${lastUserMessage.id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || 'Error deleting message');
            }

            markMessageAsDeleted(lastUserMessage.id);

            if (editingMessageId === lastUserMessage.id) {
                cancelEdit();
            }
        } catch (err) {
            console.error('Error deleting message:', err);
            throw new Error(err.message || 'Error deleting message');
        }
    }, [canDeleteLast, lastUserMessage, projectId, markMessageAsDeleted, editingMessageId, cancelEdit]);

    return {
        editingMessageId,
        editText,
        setEditText,
        canEditLast,
        canDeleteLast,
        startEditLast,
        cancelEdit,
        saveEdit,
        deleteLast
    };
};