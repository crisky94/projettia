import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';

export default function Chat({ projectId, user }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Inicializar socket con la configuración correcta
        socketRef.current = io({
            path: '/socket.io',
            transports: ['polling', 'websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            withCredentials: true
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket conectado:', socket.id);
            // Unirse al proyecto solo después de conectar
            socket.emit('joinProject', projectId);
        });

        socket.on('connect_error', (error) => {
            console.error('Error de conexión:', error);
            setError('Error de conexión con el chat');
        });

        // Escuchar nuevos mensajes
        socket.on('newMessage', (message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });

        // Escuchar ediciones de mensajes
        socket.on('messageEdited', (payload) => {
            const updated = payload?.message || payload; // tolerante a distintas cargas
            if (!updated?.id) return;
            setMessages(prev => prev.map(m => (m.id === updated.id ? updated : m)));
        });
        // (Opcional) podríamos escuchar 'messageDeleted' si el servidor emite

        // Cargar mensajes iniciales
        fetchMessages();

        return () => {
            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, [projectId]);

    // Edición ahora solo por 'Editar último'

    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditText('');
    };

    const startEditLast = () => {
        const ownMessages = messages.filter((m) => m.userId === user?.id);
        if (ownMessages.length === 0) return;
        const last = ownMessages.at(-1);
        // No editar si el último ya está eliminado
        if (!last.content || !last.content.trim()) return;
        setEditingMessageId(last.id);
        setEditText(last.content);
    };

    const deleteLast = async () => {
        const ownMessages = messages.filter((m) => m.userId === user?.id);
        if (ownMessages.length === 0) return;
        const last = ownMessages.at(-1);
        if (!last || !last.id) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/messages/${last.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Error deleting message');
            setMessages((prev) => prev.map((m) => (m.id === last.id ? { ...m, content: '' } : m)));
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

            setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            setEditingMessageId(null);
            setEditText('');

            // Opcional: notificar por socket a otros clientes si existe conexión
            if (socketRef.current?.connected) {
                socketRef.current.emit('messageEdited', { projectId, message: updated });
            }
        } catch (err) {
            console.error('Error updating message:', err);
            setError(err.message || 'Error updating message');
        }
    };

    const fetchMessages = async () => {
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

    let chatContent;
    if (isLoading) {
        chatContent = (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading messages...</p>
            </div>
        );
    } else if (error) {
        chatContent = (
            <div className="flex items-center justify-center h-full">
                <p className="text-red-500">{error}</p>
            </div>
        );
    } else if (messages.length === 0) {
        chatContent = (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No messages yet. Start a conversation!</p>
            </div>
        );
    } else {
        chatContent = messages.map((message) => {
            const isOwn = message.userId === user?.id;
            const isEditing = editingMessageId === message.id;
            const wasEdited = message.updatedAt && message.updatedAt !== message.createdAt;
            const isDeleted = !message.content || !message.content.trim();

            return (
                <div
                    key={message.id}
                    className={`mb-4 ${isOwn ? 'text-right' : 'text-left'}`}
                >
                    <div
                        className={`inline-block p-2 rounded-lg ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                <p className="text-sm font-semibold">{message.user?.name}</p>
                                {(() => {
                                    if (isEditing) {
                                        return (
                                            <form onSubmit={saveEdit} className="mt-1 flex items-center gap-2">
                                                <input
                                                    className={`w-64 max-w-full rounded px-2 py-1 text-sm ${isOwn ? 'text-gray-900' : 'text-gray-800'}`}
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    autoFocus
                                                />
                                                <button type="submit" className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30">Guardar</button>
                                                <button type="button" onClick={cancelEdit} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Cancelar</button>
                                            </form>
                                        );
                                    }
                                    if (isDeleted) {
                                        return <p className="italic opacity-80">Mensaje eliminado</p>;
                                    }
                                    return (
                                        <p>
                                            {message.content}
                                            {wasEdited && <span className="ml-2 text-[10px] opacity-80 italic">(editado)</span>}
                                        </p>
                                    );
                                })()}
                            </div>
                            {/* Quitar botón por-mensaje: edición solo del último */}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.createdAt).toLocaleString()}
                    </p>
                </div>
            );
        });
    }

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
            <div className="flex-1 overflow-y-auto p-4">
                {chatContent}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={editingMessageId ? "Editando mensaje..." : "Type your message..."}
                        className="flex-1 rounded-lg border p-2"
                    />
                    {editingMessageId && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                            title="Cancelar edición"
                            aria-label="Cancelar edición"
                        >
                            Cancelar edición
                        </button>
                    )}
                    {(() => {
                        const ownMessages = messages.filter((m) => m.userId === user?.id);
                        const last = ownMessages.at(-1);
                        const canEditLast = !!last && !!last.content && !!last.content.trim();
                        return (
                            <button
                                type="button"
                                onClick={startEditLast}
                                disabled={!canEditLast}
                                className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Editar tu último mensaje"
                                aria-label="Editar tu último mensaje"
                            >
                                Editar último
                            </button>
                        );
                    })()}
                    {(() => {
                        const ownMessages = messages.filter((m) => m.userId === user?.id);
                        const last = ownMessages.at(-1);
                        const canDeleteLast = !!last;
                        return (
                            <button
                                type="button"
                                onClick={deleteLast}
                                disabled={!canDeleteLast}
                                className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Eliminar tu último mensaje"
                                aria-label="Eliminar tu último mensaje"
                            >
                                Eliminar último
                            </button>
                        );
                    })()}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

Chat.propTypes = {
    projectId: PropTypes.string.isRequired,
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired
};
