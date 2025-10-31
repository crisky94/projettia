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
                        className={`w-64 max-w-full rounded px-2 py-1 text-sm ${isOwn ? 'text-gray-900' : 'text-gray-800'
                            }`}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30"
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                    >
                        Cancelar
                    </button>
                </form>
            );
        }

        if (isDeleted) {
            return <p className="italic opacity-80">Mensaje eliminado</p>;
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
            <div className={`inline-block p-2 rounded-lg ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                <div className="flex items-start gap-2">
                    <div className="flex-1">
                        <p className="text-sm font-semibold">{message.user?.name}</p>
                        {renderMessageContent()}
                    </div>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
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
        <p className="text-gray-500">Loading messages...</p>
    </div>
);

// Error component
export const ErrorState = ({ error }) => (
    <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
    </div>
);

ErrorState.propTypes = {
    error: PropTypes.string.isRequired
};

// Empty state component
export const EmptyState = () => (
    <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No messages yet. Start a conversation!</p>
    </div>
);

// Action button component
export const ActionButton = ({ onClick, disabled, title, children, variant = 'default' }) => {
    const baseClasses = "px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = {
        default: "hover:bg-gray-50",
        primary: "bg-blue-500 text-white border-blue-500 hover:bg-blue-600",
        cancel: "hover:bg-gray-50"
    };

    return (
        <button
            type={variant === 'primary' ? 'submit' : 'button'}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]}`}
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