import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function Chat({ projectId, user }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Inicializar socket
        socketRef.current = io();
        const socket = socketRef.current;

        // Unirse al proyecto
        socket.emit('joinProject', projectId);

        // Escuchar nuevos mensajes
        socket.on('newMessage', (message) => {
            setMessages(prev => [...prev, message]);
        });

        // Cargar mensajes iniciales
        fetchMessages();

        return () => {
            socket.disconnect();
        };
    }, [projectId]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/messages`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
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

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`mb-4 ${message.userId === user.id ? 'text-right' : 'text-left'
                            }`}
                    >
                        <div
                            className={`inline-block p-2 rounded-lg ${message.userId === user.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            <p className="text-sm font-semibold">{message.user.name}</p>
                            <p>{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(message.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))}
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
