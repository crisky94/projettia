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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Inicializar socket con la configuración correcta
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

        // Cargar mensajes iniciales
        fetchMessages();

        return () => {
            if (socket.connected) {
                socket.disconnect();
            }
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
        chatContent = messages.map((message) => (
            <div
                key={message.id}
                className={`mb-4 ${message.userId === user?.id ? 'text-right' : 'text-left'
                    }`}
            >
                <div
                    className={`inline-block p-2 rounded-lg ${message.userId === user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    <p className="text-sm font-semibold">{message.user?.name}</p>
                    <p>{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.createdAt).toLocaleString()}
                </p>
            </div>
        ));
    }

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
            <div className="flex-1 overflow-y-auto p-4">
                {chatContent}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-lg border p-2"
                    />
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
