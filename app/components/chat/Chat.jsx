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
        <div className="card-professional flex flex-col h-[600px] shadow-theme-lg">
            <div className="flex-1 overflow-y-auto p-4">
                {renderChatContent()}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                <div className="flex gap-0.5 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={editingMessageId ? "Editing message..." : "Type your message..."}
                        className="input-professional flex-1"
                    />

                    {editingMessageId && (
                        <ActionButton
                            onClick={cancelEdit}
                            title="Cancelar edición"
                            variant="cancel"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </ActionButton>
                    )}

                    <ActionButton
                        onClick={startEditLast}
                        disabled={!canEditLast}
                        title="Editar último mensaje"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </ActionButton>

                    <ActionButton
                        onClick={() => handleEditAction(deleteLast)}
                        disabled={!canDeleteLast}
                        title="Eliminar último mensaje"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </ActionButton>

                    <ActionButton
                        variant="primary"
                        title="Enviar mensaje"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
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
