import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

// Custom hooks
import { useSocket, useMessages, useMessageEditor } from './hooks/useChatHooks';

// Components
import {
    MessageItem,
    LoadingState,
    ErrorState,
    EmptyState,
    ActionButton
} from './components/ChatComponents';

// Utils
import {
    scrollToElement,
    createMessageData,
    emitMessage
} from './utils/chatUtils';

// Main Chat component
export default function Chat({ projectId, user }) {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const { socket, connectionError } = useSocket(projectId);
    const {
        messages,
        isLoading,
        error,
        setError,
        updateMessage,
        markMessageAsDeleted
    } = useMessages(projectId, socket);

    const {
        editingMessageId,
        editText,
        setEditText,
        canEditLast,
        canDeleteLast,
        startEditLast,
        cancelEdit,
        saveEdit,
        deleteLast
    } = useMessageEditor(projectId, socket, updateMessage, markMessageAsDeleted, messages, user?.id);

    const scrollToBottom = useCallback(() => {
        scrollToElement(messagesEndRef);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = useCallback((e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = createMessageData(newMessage, user.id, projectId);
        emitMessage(socket, projectId, messageData);
        setNewMessage('');
    }, [newMessage, socket, user.id, projectId]);

    const handleEditAction = useCallback(async (action) => {
        try {
            await action();
        } catch (err) {
            setError(err.message);
        }
    }, [setError]);

    const renderChatContent = () => {
        if (isLoading) return <LoadingState />;
        if (error || connectionError) return <ErrorState error={error || connectionError} />;
        if (messages.length === 0) return <EmptyState />;

        return messages.map((message) => (
            <MessageItem
                key={message.id}
                message={message}
                isOwn={message.userId === user?.id}
                isEditing={editingMessageId === message.id}
                editText={editText}
                setEditText={setEditText}
                saveEdit={(e) => handleEditAction(() => saveEdit(e))}
                cancelEdit={cancelEdit}
            />
        ));
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
            <div className="flex-1 overflow-y-auto p-4">
                {renderChatContent()}
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
                        <ActionButton
                            onClick={cancelEdit}
                            title="Cancelar edición"
                            variant="cancel"
                        >
                            Cancelar edición
                        </ActionButton>
                    )}

                    <ActionButton
                        onClick={startEditLast}
                        disabled={!canEditLast}
                        title="Editar tu último mensaje"
                    >
                        Editar último
                    </ActionButton>

                    <ActionButton
                        onClick={() => handleEditAction(deleteLast)}
                        disabled={!canDeleteLast}
                        title="Eliminar tu último mensaje"
                    >
                        Eliminar último
                    </ActionButton>

                    <ActionButton
                        variant="primary"
                        title="Enviar mensaje"
                    >
                        Send
                    </ActionButton>
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
