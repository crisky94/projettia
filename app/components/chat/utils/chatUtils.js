// Chat utility functions

export const scrollToElement = (elementRef) => {
    elementRef.current?.scrollIntoView({ behavior: "smooth" });
};

export const createMessageData = (content, userId, projectId) => ({
    content,
    userId,
    projectId,
});

export const emitMessage = (socket, projectId, messageData) => {
    if (!socket) return;

    socket.emit('message', {
        projectId,
        message: messageData,
    });
};

export const isMessageOwn = (message, userId) => {
    return message.userId === userId;
};

export const isMessageEdited = (message) => {
    return message.updatedAt && message.updatedAt !== message.createdAt;
};

export const isMessageDeleted = (message) => {
    return !message.content || !message.content.trim();
};