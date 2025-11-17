import PropTypes from 'prop-types';

// Message component
export const MessageItem = ({ message, isOwn, isEditing, editText, setEditText, saveEdit, cancelEdit }) => {
    const wasEdited = message.updatedAt && message.updatedAt !== message.createdAt;
    const isDeleted = !message.content || !message.content.trim();

    const renderMessageContent = () => {
        if (isEditing) {
            return (
                <form onSubmit={saveEdit} className="mt-1 flex items-center gap-2">
                    <input
                        className="input-professional w-64 max-w-full text-sm"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="text-xs px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 text-card-foreground"
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs px-2 py-1 rounded bg-muted/50 hover:bg-muted/70 text-muted-foreground"
                    >
                        Cancelar
                    </button>
                </form>
            );
        }

        if (isDeleted) {
            return <p className="italic opacity-80">Message deleted</p>;
        }

        return (
            <p>
                {message.content}
                {wasEdited && (
                    <span className="ml-2 text-[10px] opacity-80 italic">(editado)</span>
                )}
            </p>
        );
    };

    return (
        <div className={`mb-4 ${isOwn ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground border border-border'
                }`}>
                <div className="flex items-start gap-2">
                    <div className="flex-1">
                        <p className="text-sm font-semibold">{message.user?.name}</p>
                        {renderMessageContent()}
                    </div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                {new Date(message.createdAt).toLocaleString()}
            </p>
        </div>
    );
};

MessageItem.propTypes = {
    message: PropTypes.object.isRequired,
    isOwn: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    editText: PropTypes.string.isRequired,
    setEditText: PropTypes.func.isRequired,
    saveEdit: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired
};

// Loading component
export const LoadingState = () => (
    <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading messages...</p>
    </div>
);

// Error component
export const ErrorState = ({ error }) => (
    <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
    </div>
);

ErrorState.propTypes = {
    error: PropTypes.string.isRequired
};

// Empty state component
export const EmptyState = () => (
    <div className="flex items-center justify-center h-20">
        <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
    </div>
);

// Action button component
export const ActionButton = ({ onClick, disabled, title, children, variant = 'default' }) => {
    const variantClasses = {
        default: "button-professional-secondary",
        primary: "button-professional",
        cancel: "button-professional-secondary"
    };

    return (
        <button
            type={variant === 'primary' ? 'submit' : 'button'}
            onClick={onClick}
            disabled={disabled}
            className={`${variantClasses[variant]} text-xs p-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            title={title}
            aria-label={title}
        >
            {children}
        </button>
    );
};

ActionButton.propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['default', 'primary', 'cancel'])
};