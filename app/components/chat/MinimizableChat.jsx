'use client';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';

export default function MinimizableChat({ projectId, user, projectName }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMinimized, setIsMinimized] = useState(true); // Start minimized
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const messagesRef = useRef([]);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState('');
    const appendIfUnique = (prev, msg) => {
        if (!msg || !msg.id) return prev;
        for (let i = prev.length - 1; i >= 0; i--) {
            if (prev[i]?.id === msg.id) return prev;
        }
        return [...prev, msg];
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isMinimized) {
            scrollToBottom();
            // Mark messages as read when chat is opened
            if (messages.length > 0) {
                setHasUnreadMessages(false);
            }
        }
    }, [messages, isMinimized]);

    // Keep a ref in sync to avoid nested updater functions for lint rules
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io({
            path: '/socket.io/',
            transports: ['polling', 'websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            withCredentials: true
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket conectado:', socket.id);
            setIsConnected(true);
            setError(null);
            socket.emit('joinProject', projectId);
        });

        socket.on('connect_error', (error) => {
            console.error('Error de conexión:', error);
            setIsConnected(false);
            setError('Error de conexión con el chat');
        });

        socket.on('disconnect', () => {
            console.log('Socket desconectado');
            setIsConnected(false);
        });

        // Listen for new messages
        socket.on('newMessage', (message) => {
            // Avoid duplicates by ID
            const next = appendIfUnique(messagesRef.current, message);
            if (next !== messagesRef.current) {
                setMessages(next);
                messagesRef.current = next;
            }

            // If chat is minimized and message is from another user, show unread indicator
            if (isMinimized && message.userId !== user?.id) {
                setHasUnreadMessages(true);
            }
        });

        // Listen for edited messages (optional if server emits this)
        socket.on('messageEdited', (payload) => {
            const updated = payload?.message || payload;
            if (!updated?.id) return;
            const current = messagesRef.current;
            const idx = current.findIndex((m) => m.id === updated.id);
            if (idx === -1) return;
            const next = current.slice();
            next[idx] = updated;
            setMessages(next);
            messagesRef.current = next;
        });

        // Load initial messages
        fetchMessages();

        return () => {
            try {
                socket.off('newMessage');
                socket.off('messageEdited');
                socket.off('connect');
                socket.off('disconnect');
                socket.off('connect_error');
            } catch { }
            // Always disconnect to prevent lingering sockets/listeners in Strict Mode
            try { socket.disconnect(); } catch { }
        };
    }, [projectId]);

    const fetchMessages = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/messages`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error fetching messages');
            }

            // Ensure no duplicates in initial load
            const seen = new Set();
            const unique = [];
            for (const m of Array.isArray(data) ? data : []) {
                if (m && m.id && !seen.has(m.id)) {
                    seen.add(m.id);
                    unique.push(m);
                }
            }
            setMessages(unique);
            messagesRef.current = unique;
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError(error.message || 'Error fetching messages');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            content: newMessage,
            userId: user.id,
            projectId: projectId,
        };

        socketRef.current.emit('message', {
            projectId,
            message: messageData,
        });

        setNewMessage('');
    };

    const toggleChat = () => {
        setIsMinimized(!isMinimized);
        if (isMinimized) {
            // When opening chat, mark as read
            setHasUnreadMessages(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    // Edición ahora solo desde 'Editar último'

    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditText('');
    };

    const startEditLast = () => {
        const ownMessages = messages.filter((m) => m.userId === user?.id);
        if (ownMessages.length === 0) return;
        const last = ownMessages.at(-1);
        if (!last?.content || !last.content.trim()) return; // no editar si está eliminado
        setEditingMessageId(last.id);
        setEditText(last.content);
    };

    const deleteLast = async () => {
        const ownMessages = messagesRef.current.filter((m) => m.userId === user?.id);
        if (ownMessages.length === 0) return;
        const last = ownMessages.at(-1);
        if (!last?.id) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/messages/${last.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Error deleting message');
            const current = messagesRef.current;
            const idx = current.findIndex((m) => m.id === last.id);
            if (idx !== -1) {
                const next = current.slice();
                next[idx] = { ...next[idx], content: '' };
                setMessages(next);
                messagesRef.current = next;
            }
            if (editingMessageId === last.id) {
                setEditingMessageId(null);
                setEditText('');
            }
        } catch (err) {
            console.error('Error deleting message:', err);
            setError(err.message || 'Error deleting message');
        }
    };

    const saveEdit = async (e) => {
        e?.preventDefault?.();
        if (!editingMessageId || !editText.trim()) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/messages/${editingMessageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editText.trim() })
            });
            const updated = await res.json();
            if (!res.ok) throw new Error(updated?.error || 'Error updating message');

            const current = messagesRef.current;
            const idx = current.findIndex((m) => m.id === updated.id);
            const next = idx === -1 ? current : (() => { const arr = current.slice(); arr[idx] = updated; return arr; })();
            setMessages(next);
            messagesRef.current = next;
            setEditingMessageId(null);
            setEditText('');

            if (socketRef.current?.connected) {
                socketRef.current.emit('messageEdited', { projectId, message: updated });
            }
        } catch (err) {
            console.error('Error updating message:', err);
            setError(err.message || 'Error updating message');
        }
    };

    let chatContent;
    if (isLoading) {
        chatContent = (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
        );
    } else if (error) {
        chatContent = (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <svg className="w-8 h-8 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-500 text-sm">{error}</p>
                <button
                    onClick={fetchMessages}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-xs underline"
                >
                    Retry
                </button>
            </div>
        );
    } else if (messages.length === 0) {
        chatContent = (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 text-sm">No messages yet</p>
                <p className="text-gray-400 text-xs">Start a conversation with your team!</p>
            </div>
        );
    } else {
        chatContent = (
            <div className="flex flex-col space-y-3">
                {messages.map((message) => {
                    const isOwn = message.userId === user?.id;
                    const isEditing = editingMessageId === message.id;
                    const wasEdited = message.updatedAt && message.updatedAt !== message.createdAt;
                    return (
                        <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[75%] ${isOwn ? 'order-1' : 'order-2'}`}>
                                <div
                                    className={`px-3 py-2 rounded-2xl ${isOwn
                                        ? 'bg-blue-600 text-white rounded-br-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                                        }`}
                                >
                                    {!isOwn && (
                                        <p className="text-xs font-semibold mb-1 opacity-70">{message.user?.name}</p>
                                    )}
                                    {(() => {
                                        if (isEditing) {
                                            return (
                                                <form onSubmit={saveEdit} className="mt-1 flex items-center gap-2">
                                                    <input
                                                        className={`w-56 max-w-full rounded px-2 py-1 text-sm ${isOwn ? 'text-gray-900' : 'text-gray-800'}`}
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button type="submit" className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30">Guardar</button>
                                                    <button type="button" onClick={cancelEdit} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Cancelar</button>
                                                </form>
                                            );
                                        }
                                        const isDeleted = !message.content || !message.content.trim();
                                        if (isDeleted) {
                                            return <p className="text-sm leading-relaxed italic opacity-80">Mensaje eliminado</p>;
                                        }
                                        return (
                                            <p className="text-sm leading-relaxed">
                                                {message.content}
                                                {wasEdited && <span className="ml-2 text-[10px] opacity-80 italic">(editado)</span>}
                                            </p>
                                        );
                                    })()}
                                </div>
                                <div className={`mt-1 flex items-center ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}>
                                    <p className="text-xs text-gray-500">{formatTime(message.createdAt)}</p>
                                    {/* Quitar botón por-mensaje: edición solo del último */}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        );
    }

    return (
        <div className={`fixed bottom-0 right-4 z-50 transition-all duration-300 ease-in-out ${isMinimized
            ? 'w-80 h-14'
            : 'w-80 h-96 md:w-96 md:h-[500px]'
            }`}>
            {/* Chat Container */}
            <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Chat Header */}
                <button
                    className="flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-700 text-white w-full text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    onClick={toggleChat}
                    aria-label={isMinimized ? "Open chat" : "Minimize chat"}
                >
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-medium text-sm truncate">
                            {projectName ? `${projectName} Chat` : 'Team Chat'}
                        </span>

                        {/* Connection Status Indicator */}
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
                            title={isConnected ? 'Conectado' : 'Desconectado'}>
                        </div>

                        {hasUnreadMessages && isMinimized && (
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        )}
                    </div>
                    <button
                        className="hover:bg-blue-700 p-1 rounded transition-colors"
                        title={isMinimized ? "Open chat" : "Minimize chat"}
                    >
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isMinimized ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </button>

                {/* Chat Body - Only show when not minimized */}
                {!isMinimized && (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-3 h-80 md:h-96 bg-gray-50 dark:bg-gray-900">
                            {chatContent}
                        </div>

                        {/* Message Input */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={editingMessageId ? "Editando mensaje..." : "Type a message..."}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                    disabled={isLoading}
                                />
                                {editingMessageId && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-3 py-2 rounded-full border text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                                        title="Cancelar edición"
                                        aria-label="Cancelar edición"
                                    >
                                        Cancelar edición
                                    </button>
                                )}
                                {(() => {
                                    const ownMessages = messagesRef.current.filter((m) => m.userId === user?.id);
                                    const last = ownMessages.at(-1);
                                    const canEditLast = !!last && !!last.content && !!last.content.trim();
                                    return (
                                        <button
                                            type="button"
                                            onClick={startEditLast}
                                            disabled={!canEditLast}
                                            className="px-3 py-2 rounded-full border text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                                            title="Editar tu último mensaje"
                                            aria-label="Editar tu último mensaje"
                                        >
                                            Editar último
                                        </button>
                                    );
                                })()}
                                {(() => {
                                    const ownMessages = messagesRef.current.filter((m) => m.userId === user?.id);
                                    const last = ownMessages.at(-1);
                                    const canDeleteLast = !!last;
                                    return (
                                        <button
                                            type="button"
                                            onClick={deleteLast}
                                            disabled={!canDeleteLast}
                                            className="px-3 py-2 rounded-full border text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                                            title="Eliminar tu último mensaje"
                                            aria-label="Eliminar tu último mensaje"
                                        >
                                            Eliminar último
                                        </button>
                                    );
                                })()}
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-full transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
                                    title="Send message"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

MinimizableChat.propTypes = {
    projectId: PropTypes.string.isRequired,
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired,
    projectName: PropTypes.string
};