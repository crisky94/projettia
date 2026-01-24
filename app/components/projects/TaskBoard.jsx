import { useState, useEffect } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, closestCorners, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

/**
 * Global helper to get consistent avatar colors based on user ID and initials.
 * Handles collisions by rotating through a color palette for members with same initials.
 */
const getAvatarColor = (userId, initials, allMembersList) => {
    const colors = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-indigo-600',
        'from-green-500 to-emerald-600',
        'from-pink-500 to-rose-600',
        'from-orange-500 to-amber-600',
        'from-teal-500 to-cyan-600',
        'from-red-500 to-pink-600',
        'from-indigo-500 to-blue-600',
        'from-emerald-500 to-teal-600',
        'from-purple-500 to-violet-600'
    ];

    if (!allMembersList || !Array.isArray(allMembersList)) {
        return colors[0];
    }

    const membersWithSameInitials = allMembersList.filter(member => {
        if (!member?.user?.name) return false;
        const memberInitials = member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        return memberInitials === initials;
    });

    if (membersWithSameInitials.length <= 1) {
        return colors[0];
    }
    const memberIndex = membersWithSameInitials.findIndex(member => (member.userId === userId || member.id === userId));
    return colors[memberIndex !== -1 ? memberIndex % colors.length : 0];
};

const formatEstimatedTime = (hours) => {
    if (!hours) return null;
    if (hours < 1) {
        const minutes = Math.round(hours * 60);
        return `${minutes}min`;
    }
    if (hours >= 8) return `${Math.round(hours / 8)}d`;
    return `${hours}h`;
};

const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const getStatusStyles = (status) => {
    const styles = {
        PENDING: 'bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50/30 border-amber-300 text-amber-800 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20 dark:border-amber-700 dark:text-amber-300 shadow-lg shadow-amber-100/50 dark:shadow-amber-950/30',
        IN_PROGRESS: 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-violet-50/30 border-blue-300 text-blue-800 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-violet-950/20 dark:border-blue-700 dark:text-blue-300 shadow-lg shadow-blue-100/50 dark:shadow-blue-950/30',
        COMPLETED: 'bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/30 border-green-300 text-green-800 dark:from-green-950/40 dark:via-emerald-950/30 dark:to-teal-950/20 dark:border-green-700 dark:text-green-300 shadow-lg shadow-green-100/50 dark:shadow-green-950/30',
    };
    return styles[status] || styles.PENDING;
};



const TaskCard = ({ task, isAdmin, currentUserId, allMembers = [], sprints = [], onDeleteTask, onUpdateTask, onViewTask, projectId, refreshTasks }) => {
    const canDrag = isAdmin || (task?.assignee?.id && task.assignee.id === currentUserId);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
        id: task.id.toString(),
        disabled: !canDrag,
    });

    // Add inline editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editingTask, setEditingTask] = useState({
        title: task.title,
        description: task.description || '',
        assigneeId: task.assignee?.id || '',
        sprintId: task.sprint?.id || '',
        estimatedHours: task.estimatedHours || 0
    });

    // Handle inline editing
    const handleSave = async () => {
        try {
            const payload = {
                title: editingTask.title,
                description: editingTask.description,
                assigneeId: editingTask.assigneeId ? editingTask.assigneeId : null,
                sprintId: editingTask.sprintId ? editingTask.sprintId : null,
                estimatedHours: parseFloat(editingTask.estimatedHours) || 0
            };

            const response = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Error updating task');

            const updatedTask = await response.json();

            setIsEditing(false);

            // Notify parent component
            if (onTaskUpdate) {
                onTaskUpdate(updatedTask);
            }

            // Refresh tasks to show updated data
            if (refreshTasks) {
                await refreshTasks();
            }

            // Show success message using toast
            const { toast } = await import('react-toastify');
            toast.success('Task updated successfully!');
        } catch (error) {
            console.error('Error updating task:', error);
            const { toast } = await import('react-toastify');
            toast.error('Error updating task');
        }
    };

    const handleCancel = () => {
        setEditingTask({
            title: task.title,
            description: task.description || '',
            assigneeId: task.assignee?.id || '',
            sprintId: task.sprint?.id || '',
            estimatedHours: task.estimatedHours || 0
        });
        setIsEditing(false);
    };

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: canDrag ? 'grab' : 'default',
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };


    const assigneeName = task.assignee?.name || null;
    const assigneeInitials = assigneeName
        ? assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : null;

    // Helper functions to determine if content is too long
    const isTitleLong = task.title && task.title.length > 50;
    const isDescriptionLong = task.description && task.description.length > 100;
    // Always show View More option since most content is now hidden in the card
    const shouldShowViewMore = true;



    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`task-card group rounded-2xl border-2 p-5 transition-all duration-300 ${getStatusStyles(task.status)} ${canDrag ? 'hover:-translate-y-2 hover:shadow-2xl cursor-grab active:cursor-grabbing hover:scale-[1.02]' : 'opacity-95'} backdrop-blur-sm`}
        >
            {/* Task Details Editor */}
            {isEditing ? (
                <div className="space-y-4 mb-4">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Objective Title</label>
                        <input
                            type="text"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-semibold"
                            placeholder="Task title"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Protocol Brief</label>
                        <textarea
                            value={editingTask.description}
                            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                            placeholder="Task description"
                            rows="2"
                        />
                    </div>

                    {/* Meta Fields Group */}
                    <div className="space-y-4">
                        {/* Sprint Selection */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Sprint Context</label>
                            <select
                                value={editingTask.sprintId}
                                onChange={(e) => setEditingTask({ ...editingTask, sprintId: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                            >
                                <option value="">No sprint</option>
                                {sprints.filter(s => s.status !== 'COMPLETED').map(sprint => (
                                    <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Estimation Row */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Estimation (Hours)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={editingTask.estimatedHours}
                                    onChange={(e) => setEditingTask({ ...editingTask, estimatedHours: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                                    placeholder="0.0"
                                    min="0"
                                    step="0.5"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">hrs</span>
                            </div>
                        </div>

                        {/* Assignee Selection */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Assignee</label>
                            <select
                                value={editingTask.assigneeId}
                                onChange={(e) => setEditingTask({ ...editingTask, assigneeId: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                            >
                                <option value="">Unassigned</option>
                                {allMembers.map(member => (
                                    <option key={member.userId} value={member.userId}>
                                        {member.user?.name || 'Unknown User'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* View Mode Contents (Title, Description, etc.) */}
                    <div className="mb-4">
                        <div className="pr-20">
                            <h3 className="text-lg font-bold mb-1 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                                {isTitleLong ? truncateText(task.title, 50) : task.title}
                            </h3>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation?.();
                                onViewTask && onViewTask(task);
                            }}
                            className="mt-2 text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-1 group/btn"
                            title="View full task"
                        >
                            <svg className="w-3 h-3 transition-transform group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View more
                        </button>
                    </div>

                    {/* Status & Assignee Summary */}
                    <div className="mt-4">
                        <div className="flex items-center gap-3">
                            {assigneeName ? (
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br ${getAvatarColor(task.assignee.id, assigneeInitials, allMembers)} text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white/20`}>
                                    {assigneeInitials}
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                    ?
                                </div>
                            )}
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                                {assigneeName || 'Unassigned'}
                            </span>
                        </div>
                    </div>

                    {task.estimatedHours > 0 && (
                        <div className="absolute bottom-5 right-5 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl border border-white/10 dark:border-gray-700 shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-3.5 h-3.5 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-black text-gray-700 dark:text-white tracking-widest uppercase">{formatEstimatedTime(task.estimatedHours)}</span>
                        </div>
                    )}
                </>
            )}

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                {!isEditing ? (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation?.();
                                setIsEditing(true);
                            }}
                            className="p-2 bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110"
                            title="Edit task"
                        >
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation?.();
                                onDeleteTask && onDeleteTask(task.id);
                            }}
                            className="p-2 bg-white/80 dark:bg-gray-800/80 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 text-red-600 dark:text-red-400"
                            title="Delete task"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <div className="flex gap-1">
                        <button
                            onClick={handleSave}
                            className="p-1.5 hover:bg-green-500/20 rounded-md transition-colors text-green-600 dark:text-green-400"
                            title="Save changes"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                        <button
                            onClick={handleCancel}
                            className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors text-red-600 dark:text-red-400"
                            title="Cancel"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

TaskCard.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        status: PropTypes.string.isRequired,
        sprintId: PropTypes.string,
        sprint: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            status: PropTypes.string
        }),
        assignee: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            email: PropTypes.string
        })
    }).isRequired,
    isAdmin: PropTypes.bool.isRequired,
    currentUserId: PropTypes.string,
    allMembers: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.string.isRequired,
            user: PropTypes.shape({
                name: PropTypes.string.isRequired
            }).isRequired
        })
    ),
    sprints: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            status: PropTypes.string
        })
    ),
    onDeleteTask: PropTypes.func,
    onUpdateTask: PropTypes.func,
    onViewTask: PropTypes.func,
    projectId: PropTypes.string.isRequired,
    refreshTasks: PropTypes.func
};

const TaskRow = ({ title, tasks, isAdmin, currentUserId, status, allMembers = [], sprints = [], onDeleteTask, onUpdateTask, onViewTask, projectId, refreshTasks }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });
    // Define row styles based on status
    const getRowStyles = (status, isOver) => {
        const baseStyles = "w-full max-w-none card-professional shadow-theme-sm hover:shadow-theme-md rounded-xl border transition-all duration-200 overflow-hidden";

        if (isOver) {
            switch (status) {
                case 'PENDING':
                    return `${baseStyles} border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-theme-lg ring-2 ring-amber-200`;
                case 'IN_PROGRESS':
                    return `${baseStyles} border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-theme-lg ring-2 ring-blue-200`;
                case 'COMPLETED':
                    return `${baseStyles} border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-theme-lg ring-2 ring-green-300`;
                default:
                    return `${baseStyles} border-gray-200 dark:border-gray-800`;
            }
        }

        switch (status) {
            case 'PENDING':
                return `${baseStyles} border-amber-200 dark:border-amber-800 hover:border-amber-300`;
            case 'IN_PROGRESS':
                return `${baseStyles} border-blue-200 dark:border-blue-800 hover:border-blue-300`;
            case 'COMPLETED':
                return `${baseStyles} border-green-300 dark:border-green-800 hover:border-green-400`;
            default:
                return `${baseStyles} border-gray-200 dark:border-gray-800`;
        }
    };

    const getHeaderStyles = (status) => {
        switch (status) {
            case 'PENDING':
                return 'text-amber-700 dark:text-amber-400';
            case 'IN_PROGRESS':
                return 'text-blue-700 dark:text-blue-400';
            case 'COMPLETED':
                return 'text-green-800 dark:text-green-400';
            default:
                return 'text-gray-700 dark:text-gray-400';
        }
    };

    const getBadgeStyles = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-500/30 dark:text-amber-400';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-500/30 dark:text-blue-300';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 dark:bg-green-500/30 dark:text-green-300';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div
            ref={setNodeRef}
            className="task-column"
        >
            <div className="task-column-header">
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300 ring-2 ring-white/20
                            ${status === 'PENDING' ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600' :
                                status === 'IN_PROGRESS' ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600' :
                                    status === 'COMPLETED' ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600' :
                                        'bg-gradient-to-br from-gray-500 to-gray-600'}
                        `}>
                            <span className="text-2xl">
                                {status === 'PENDING' ? '📋' : status === 'IN_PROGRESS' ? '⚡' : status === 'COMPLETED' ? '✅' : '📝'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-xl font-bold mb-1 ${getHeaderStyles(status)}`}>
                                {title.replace(/^[📋⚡✅📝]\s*/, '')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                {status === 'PENDING' ? 'Ready to start' :
                                    status === 'IN_PROGRESS' ? 'Work in progress' :
                                        status === 'COMPLETED' ? 'Done and dusted' :
                                            'Task status'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-4 py-2 rounded-xl font-bold text-sm shadow-lg ${getBadgeStyles(status)}`}>
                            {tasks.length}
                        </span>
                    </div>
                </div>
            </div>
            {/* Tasks Container */}
            <div className="task-list-container">
                <div className="relative w-full">
                    {tasks.length === 0 ? (
                        <div className={`task-empty-state 
                            ${isOver
                                ? 'border-current text-current bg-current/5'
                                : 'border-border text-muted-foreground'
                            }
                        `}>
                            {isOver ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="task-empty-icon bg-primary/20">
                                        <svg className="w-6 h-6 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7m14-8l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-lg text-primary block">Drop task here</span>
                                        <p className="text-sm text-primary/80 mt-1">The task will move to this status</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="task-empty-icon bg-muted">
                                        <svg className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-base md:text-lg text-card-foreground">
                                            No tasks here
                                        </p>
                                        <p className="text-sm md:text-base text-muted-foreground mt-2">
                                            {status === 'PENDING' ? 'Create new tasks ' :
                                                status === 'IN_PROGRESS' ? 'Drag tasks from "Pending" to start' :
                                                    status === 'COMPLETED' ? 'Completed tasks will appear here' :
                                                        'Drag tasks to organize them'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Task list */
                        <div className="space-y-4">
                            {tasks.filter(task => task && task.id).map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    isAdmin={isAdmin}
                                    currentUserId={currentUserId}
                                    allMembers={allMembers}
                                    sprints={sprints}
                                    onDeleteTask={onDeleteTask}
                                    onUpdateTask={onUpdateTask}
                                    onViewTask={onViewTask}
                                    projectId={projectId}
                                    refreshTasks={refreshTasks}
                                />
                            ))}

                            {/* Zona de drop cuando se arrastra */}
                            {isOver && tasks.length > 0 && (
                                <div className="w-full h-24 md:h-28 flex items-center justify-center border-2 border-dashed border-current rounded-xl bg-current/5 text-current">
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span className="font-medium text-sm md:text-base uppercase">Drop here</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

TaskRow.propTypes = {
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            assignee: PropTypes.shape({
                name: PropTypes.string.isRequired
            })
        })
    ).isRequired,
    isAdmin: PropTypes.bool.isRequired,
    currentUserId: PropTypes.string,
    allMembers: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.string.isRequired,
            user: PropTypes.shape({
                name: PropTypes.string.isRequired
            }).isRequired
        })
    ),
    sprints: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            status: PropTypes.string
        })
    ),
    onDeleteTask: PropTypes.func,
    onUpdateTask: PropTypes.func,
    onViewTask: PropTypes.func
};

/**
 * TaskBoard Component
 * 
 * PERMISSIONS UPDATED:
 * - ✅ All members can CREATE tasks
 * - ✅ All members can MOVE tasks between columns (drag & drop)
 * - ❌ Only admins can EDIT title/description/assignee
 * - ❌ Only admins can DELETE tasks
 * - 🚫 Sprint assignment is disabled in TaskBoard (display-only)
 * 
 * This change allows better collaboration where any team member can contribute
 * by creating and managing tasks, while keeping deletion restricted for data safety.
 */
const TaskBoard = ({ projectId, initialTasks, isAdmin, currentUserId, onTaskUpdate, onTaskDelete, onTaskCreate, sprints = [], disableCreate = false }) => {
    // Estado para edición de tarea
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [editTask, setEditTask] = useState({ title: '', description: '', assigneeId: '' });
    const [tasks, setTasks] = useState(initialTasks || []);
    // Eliminar sprint de las tareas si el sprint fue borrado
    useEffect(() => {
        // Use initialTasks if provided
        if (initialTasks && Array.isArray(initialTasks)) {
            setTasks(initialTasks);
            return;
        }

        // Fetch tasks from API when component mounts or projectId changes
        const fetchTasks = async () => {
            try {
                const tasksRes = await fetch(`/api/projects/${projectId}/tasks`);
                if (tasksRes.ok) {
                    const tasksData = await tasksRes.json();
                    if (Array.isArray(tasksData)) {
                        const validatedTasks = tasksData.map(task => ({
                            ...task,
                            status: task.status || 'PENDING'
                        }));
                        setTasks(validatedTasks);
                    } else {
                        setTasks([]);
                    }
                }
            } catch (error) {
                setTasks([]);
            }
        };

        // Fetch tasks from API
        fetchTasks();
    }, [projectId]);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [members, setMembers] = useState([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigneeId: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [taskToView, setTaskToView] = useState(null);

    // Debug logs
    useEffect(() => {
        console.log('TaskBoard mounted with initialTasks:', initialTasks);
        console.log('Current tasks state:', tasks);
    }, [initialTasks, tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Reduced distance for easier activation
            },
        }),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        if (initialTasks && Array.isArray(initialTasks)) {
            console.log('Setting tasks with initialTasks:', initialTasks);
            const validTasks = initialTasks.filter(task => task && task.id);
            if (validTasks.length !== initialTasks.length) {
                console.warn('Some tasks were filtered out due to missing IDs:',
                    initialTasks.filter(task => !task || !task.id));
            }
            setTasks(validTasks);
        } else {
            console.warn('initialTasks is not valid:', initialTasks);
            setTasks([]);
        }
    }, [initialTasks]);

    // Load project members
    useEffect(() => {
        const loadMembers = async () => {
            setIsLoadingMembers(true);
            try {
                const response = await fetch(`/api/projects/${projectId}/members`);
                if (response.ok) {
                    const membersData = await response.json();
                    console.log('Miembros cargados:', membersData);
                    // Extraer solo el array de members de la respuesta
                    setMembers(Array.isArray(membersData.members) ? membersData.members : []);
                } else {
                    console.error('Failed to load project members');
                    setMembers([]);
                }
            } catch (error) {
                console.error('Error loading members:', error);
            } finally {
                setIsLoadingMembers(false);
            }
        };

        if (projectId) {
            loadMembers();
        }
    }, [projectId]);

    // Function to reload members (can be called when a new member is added)
    const reloadMembers = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/members`);
            if (response.ok) {
                const membersData = await response.json();
                console.log('Miembros recargados:', membersData);
                // Extraer solo el array de members de la respuesta
                setMembers(Array.isArray(membersData.members) ? membersData.members : []);
            } else {
                console.error('Failed to reload project members');
                setMembers([]);
            }
        } catch (error) {
            console.error('Error reloading members:', error);
            setMembers([]);
        }
    };

    // Function to refresh tasks from the API
    const refreshTasks = async () => {
        try {
            const tasksRes = await fetch(`/api/projects/${projectId}/tasks`);
            if (tasksRes.ok) {
                const tasksData = await tasksRes.json();
                console.log('Tasks refreshed:', tasksData);
                if (Array.isArray(tasksData)) {
                    const validatedTasks = tasksData.map(task => ({
                        ...task,
                        status: task.status || 'PENDING'
                    }));
                    setTasks(validatedTasks);
                } else {
                    console.error('Tasks data is not an array:', tasksData);
                    setTasks([]);
                }
            }
        } catch (error) {
            console.error('Error refreshing tasks:', error);
        }
    };

    // Listen for member updates via custom events or polling
    useEffect(() => {
        const handleMemberAdded = () => {
            console.log('Nuevo miembro detectado, recargando lista...');
            reloadMembers();
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Cuando el usuario vuelve a enfocar la ventana, recargar miembros
                console.log('Ventana enfocada, recargando miembros...');
                reloadMembers();
            }
        };

        const handleFocus = () => {
            console.log('Ventana enfocada, recargando miembros...');
            reloadMembers();
        };

        // Listen for custom events
        window.addEventListener('memberAdded', handleMemberAdded);

        // Listen for focus events
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Poll for updates every 10 seconds (más frecuente)
        const interval = setInterval(() => {
            if (!document.hidden) {
                reloadMembers();
            }
        }, 10000);

        return () => {
            window.removeEventListener('memberAdded', handleMemberAdded);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
        };
    }, [projectId]);

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
    };

    const updateTaskStatus = async (taskId, newStatus, originalStatus) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus
                }),
            });

            if (!response.ok) {
                // Revert the change if the API call failed
                const revertedTasks = tasks.map(task =>
                    task.id === taskId
                        ? { ...task, status: originalStatus }
                        : task
                );
                setTasks(revertedTasks);
                console.error('Failed to update task status');
                return false;
            }
            return true;
        } catch (error) {
            // Revert the change if there was an error
            const revertedTasks = tasks.map(task =>
                task.id === taskId
                    ? { ...task, status: originalStatus }
                    : task
            );
            setTasks(revertedTasks);
            console.error('Error updating task status:', error);
            return false;
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) {
            console.log('No drop target');
            return;
        }

        const activeTask = tasks.find(task => task.id.toString() === active.id);
        if (!activeTask) {
            console.log('Active task not found:', active.id);
            return;
        }

        console.log('Dragging task:', activeTask.title, 'from', activeTask.status, 'to', over.id);

        // Check if we're dropping on a column
        const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
        if (validStatuses.includes(over.id)) {
            const newStatus = over.id;

            if (activeTask.status !== newStatus) {
                console.log('Updating task status to:', newStatus);
                // Update task status locally first for immediate UI feedback
                const updatedTask = { ...activeTask, status: newStatus };
                const updatedTasks = tasks.map(task =>
                    task.id === activeTask.id ? updatedTask : task
                );
                setTasks(updatedTasks);

                // Notify parent component
                if (onTaskUpdate) {
                    onTaskUpdate(updatedTask);
                }

                // Send update to backend
                await updateTaskStatus(activeTask.id, newStatus, activeTask.status);
            }
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (disableCreate) {
            toast.info('Task creation is currently disabled', {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }
        setIsSubmitting(true);
        try {
            // Use parent function if provided
            if (onCreateTask) {
                const taskData = {
                    title: newTask.title,
                    description: newTask.description,
                    assigneeId: newTask.assigneeId || null,
                    status: 'PENDING'
                };

                onCreateTask(taskData);

                setShowAddTaskModal(false);
                setNewTask({ title: '', description: '', assigneeId: '' });

                // Show success notification
                toast.success('✅ Task created successfully! You can now manage and track its progress. ', {
                    position: 'top-right',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                return;
            }

            // Default API call
            const response = await fetch(`/api/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    assigneeId: newTask.assigneeId || null,
                    status: 'PENDING'
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const createdTask = await response.json();
            await refreshTasks();
            // Refresh tasks from server to ensure we have the most up-to-date data

            // Notify parent component
            if (onTaskCreate) {
                onTaskCreate(createdTask);
            }

            setShowAddTaskModal(false);
            setNewTask({ title: '', description: '', assigneeId: '' });

            // Show success notification
            toast.success('✅ Task created successfully! You can now manage and track its progress. ', {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error creating task: ', error);

            // Show error notification
            toast.error('Error creating task', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Abrir modal de edición
    const handleOpenEditTask = (action, task) => {
        if (action === 'edit' && task) {
            setTaskToEdit(task);
            setEditTask({
                title: task.title,
                description: task.description || '',
                assigneeId: task.assignee ? task.assignee.id : ''
            });
            setShowEditTaskModal(true);
        }
    };

    // Guardar cambios de tarea
    const handleSaveEditTask = async (e) => {
        e.preventDefault();
        if (!taskToEdit) return;
        setIsSubmitting(true);
        try {
            // Enviar assigneeId como null si está vacío
            const payload = {
                title: editTask.title,
                description: editTask.description,
                assigneeId: editTask.assigneeId ? editTask.assigneeId : null
            };
            const response = await fetch(`/api/projects/${projectId}/tasks/${taskToEdit.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Error updating task');
            const updatedTask = await response.json();

            await refreshTasks();

            if (onTaskUpdate) {
                onTaskUpdate(updatedTask);
            }

            setShowEditTaskModal(false);
            setTaskToEdit(null);
            toast.success('Task updated successfully! ');
        } catch (error) {
            toast.error('Error updating task ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        setTaskToDelete(task);
        setShowDeleteTaskModal(true);

        // Hacer scroll suave hacia arriba para mostrar el modal
        setTimeout(() => {
            console.log('Executing scroll...');
            // Probar diferentes métodos de scroll
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Backup con scroll inmediato
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            // Backup con jQuery style si existe
            if (window.jQuery) {
                window.jQuery('html, body').animate({ scrollTop: 0 }, 300);
            }
        }, 300);
    };

    const handleConfirmDeleteTask = async () => {
        if (!taskToDelete) return;

        try {
            setShowDeleteTaskModal(false);
            const response = await fetch(`/api/projects/${projectId}/tasks/${taskToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error deleting task');
            }

            // Show success notification first
            toast.success('Task deleted successfully!', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Refresh tasks from server to get the most up-to-date data
            setTimeout(async () => {
                await refreshTasks();

                // Notify parent component after refreshing
                if (onTaskDelete) {
                    onTaskDelete(taskToDelete.id);
                }
            }, 2100); // Slightly longer than toast autoClose to ensure it's visible

            console.log('Task deleted successfully:', taskToDelete.id);
        } catch (error) {
            console.error('Error deleting task:', error);

            // Show error notification
            toast.error(error.message || 'Error deleting task', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setTaskToDelete(null);
        }
    }; const handleCancelDeleteTask = () => {
        setShowDeleteTaskModal(false);
        setTaskToDelete(null);
    };

    const handleViewTask = (task) => {
        setTaskToView(task);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setTaskToView(null);
    };

    return (
        <>
            <div className="task-board-container">
                <div className="w-full mx-auto">

                    {/* Page header */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 lg:p-6 mb-6 lg:mb-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            {/* Left: Title and description */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">Task Board</h1>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg">Manage and organize project tasks efficiently</p>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex gap-3">
                                {/* Add Task button - Available to all members */}
                                <button
                                    onClick={() => {
                                        setShowAddTaskModal(true);
                                        // Auto-scroll to top to ensure modal is visible
                                        setTimeout(() => {
                                            console.log('Executing add task scroll...');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                            document.documentElement.scrollTop = 0;
                                            document.body.scrollTop = 0;
                                        }, 300);
                                    }}
                                    className={`w-full sm:w-auto ${disableCreate ? 'bg-gray-400 cursor-default' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'} text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-action-manipulation flex items-center justify-center gap-2`}
                                >
                                    <svg className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="hidden sm:inline text-sm md:text-base">New Task</span>
                                    <span className="sm:hidden text-sm">Add Task</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Project Members Section */}
                    <div className="mb-6 lg:mb-8">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-3 h-3 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {members.length} {members.length === 1 ? 'member' : 'members'} in the project
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-3 lg:py-4">
                                {members.length === 0 ? (
                                    <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                        {isLoadingMembers ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-base">Loading team members...</span>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-3">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">No members in this project</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Invite people to start collaborating</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 justify-items-stretch">{/* Better responsive grid for member cards */}
                                        {Array.isArray(members) && members.map((member) => {
                                            const initials = member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();


                                            const avatarColor = getAvatarColor(member.userId, initials, members);

                                            return (
                                                <div
                                                    key={member.userId}
                                                    className="group flex items-center bg-gray-50 dark:bg-gray-800/50 px-4 py-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 w-full min-h-[90px]"
                                                >
                                                    <div className={`w-12 h-12 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 shadow-lg ring-2 ring-white dark:ring-gray-900 group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
                                                        {initials}
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0 gap-2">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                            <span className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">{member.user.name}</span>
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block flex-shrink-0 self-start sm:self-auto w-fit ${member.role === 'ADMIN'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                                }`}>
                                                                {member.role === 'ADMIN' ? 'Admin' : 'Member'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-sm lg:text-base text-gray-600 dark:text-gray-300 truncate font-medium">
                                                                {member.user.email || 'No email provided'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Task Board Section */}
                    <div className="mb-6 lg:mb-8">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="px-4 lg:px-6 py-4 lg:py-5">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCorners}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    {/* Cards - Responsive Kanban Board */}
                                    {/* Mobile: Stack vertically (rows), Desktop: Side by side (columns) */}
                                    <div className="flex flex-col md:flex-row md:gap-6 space-y-6 md:space-y-0">
                                        {/* To Do's - First column/row */}
                                        <div className="flex-1 min-w-0">
                                            <TaskRow
                                                title="📋 To Do's"
                                                status="PENDING"
                                                tasks={tasks.filter(task => task.status === 'PENDING')}
                                                isAdmin={isAdmin}
                                                currentUserId={currentUserId}
                                                allMembers={members}
                                                sprints={sprints}
                                                onDeleteTask={handleDeleteTask}
                                                onUpdateTask={handleOpenEditTask}
                                                onViewTask={handleViewTask}
                                                projectId={projectId}
                                                refreshTasks={refreshTasks}
                                            />
                                        </div>

                                        {/* In Progress - Second column/row */}
                                        <div className="flex-1 min-w-0">
                                            <TaskRow
                                                title="⚡ In Progress"
                                                status="IN_PROGRESS"
                                                tasks={tasks.filter(task => task.status === 'IN_PROGRESS')}
                                                isAdmin={isAdmin}
                                                currentUserId={currentUserId}
                                                allMembers={members}
                                                sprints={sprints}
                                                onDeleteTask={handleDeleteTask}
                                                onUpdateTask={handleOpenEditTask}
                                                onViewTask={handleViewTask}
                                                projectId={projectId}
                                                refreshTasks={refreshTasks}
                                            />
                                        </div>

                                        {/* Completed - Third column/row */}
                                        <div className="flex-1 min-w-0">
                                            <TaskRow
                                                title="✅ Completed"
                                                status="COMPLETED"
                                                tasks={tasks.filter(task => task.status === 'COMPLETED')}
                                                isAdmin={isAdmin}
                                                currentUserId={currentUserId}
                                                allMembers={members}
                                                sprints={sprints}
                                                onDeleteTask={handleDeleteTask}
                                                onUpdateTask={handleOpenEditTask}
                                                onViewTask={handleViewTask}
                                                projectId={projectId}
                                                refreshTasks={refreshTasks}
                                            />
                                        </div>
                                    </div>
                                </DndContext>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals moved outside container to avoid board-specific CSS overrides */}
            <div className="project-modals-portal">

                {/* Modal de edición de tarea */}
                {showEditTaskModal && taskToEdit && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-[9999] p-4 animate-in fade-in duration-300 overflow-y-auto">

                        <div className="glass-card shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden flex flex-col border border-white/10 relative">
                            {/* Shimmer Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer bg-[length:200%_100%]"></div>

                            {/* Header */}
                            <div className="relative px-6 py-5 border-b border-white/5 bg-gradient-to-br from-primary/10 via-background to-accent/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Edit Task</h2>
                                        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-0.5">Update Parameters</p>
                                    </div>
                                    <button
                                        onClick={() => { setShowEditTaskModal(false); setTaskToEdit(null); }}
                                        className="flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10"
                                    />
                                    Edit Task
                                    Update Parameters
                                </div>
                            </div>

                            <form onSubmit={handleSaveEditTask} className="px-6 py-5 space-y-3.5">
                                <div className="space-y-1">
                                    <label htmlFor="edit-title" className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Objective Title</label>
                                    <input
                                        id="edit-title"
                                        type="text"
                                        value={editTask.title}
                                        onChange={(e) => setEditTask(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-white text-base font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="edit-description" className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Protocol Description</label>
                                    <textarea
                                        id="edit-description"
                                        value={editTask.description}
                                        onChange={(e) => setEditTask(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm font-medium placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner resize-none min-h-[80px]"
                                        rows="2"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="edit-assignee" className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Assigned Operative</label>
                                    <div className="relative">
                                        <select
                                            id="edit-assignee"
                                            value={editTask.assigneeId}
                                            onChange={(e) => setEditTask(prev => ({ ...prev, assigneeId: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                            disabled={isSubmitting}
                                        >
                                            <option value="" className="bg-background">Unassigned</option>
                                            {members.map((member) => (
                                                <option key={member.userId} value={member.userId} className="bg-background text-sm">
                                                    {member.user.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2.5 pt-4 border-t border-white/5">
                                    <button
                                        type="submit"
                                        className="btn-gradient w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowEditTaskModal(false); setTaskToEdit(null); }}
                                        className="py-1 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Discard Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showAddTaskModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-[9999] p-4 animate-in fade-in duration-300 overflow-y-auto">

                        <div className="glass-card shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden flex flex-col border border-white/10 relative">
                            {/* Shimmer Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer bg-[length:200%_100%]"></div>

                            {/* Header */}
                            <div className="relative px-6 py-5 border-b border-white/5 bg-gradient-to-br from-primary/10 via-background to-accent/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">New Task</h2>
                                        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-0.5">Initialize Objective</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowAddTaskModal(false);
                                            setNewTask({ title: '', description: '', assigneeId: '' });
                                        }}
                                        className="flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10"
                                        disabled={isSubmitting}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleCreateTask} className="px-6 py-5 space-y-3.5">
                                <div className="space-y-1">
                                    <label htmlFor="title" className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Objective Title</label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-white text-base font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                                        placeholder="Enter designation..."
                                        required
                                        disabled={isSubmitting || disableCreate}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="description" className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Protocol Description</label>
                                    <textarea
                                        id="description"
                                        value={newTask.description}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm font-medium placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner resize-none min-h-[80px]"
                                        placeholder="Outline the protocol..."
                                        rows="2"
                                        disabled={isSubmitting || disableCreate}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="assignee" className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Assigned Operative</label>
                                    <div className="relative">
                                        <select
                                            id="assignee"
                                            value={newTask.assigneeId}
                                            onChange={(e) => setNewTask(prev => ({ ...prev, assigneeId: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                            disabled={isSubmitting || disableCreate}
                                        >
                                            <option value="" className="bg-background">Unassigned</option>
                                            {members.map((member) => (
                                                <option key={member.userId} value={member.userId} className="bg-background text-sm">
                                                    {member.user.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2.5 pt-4 border-t border-white/5">
                                    <button
                                        type="submit"
                                        className="btn-gradient w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
                                        disabled={isSubmitting || disableCreate}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Initialize Task
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddTaskModal(false);
                                            setNewTask({ title: '', description: '', assigneeId: '' });
                                        }}
                                        className="py-1 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Abort Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Task deletion confirmation modal */}
                {showDeleteTaskModal && taskToDelete && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-[9999] p-4 animate-in fade-in duration-300 overflow-y-auto">

                        <div className="glass-card shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden flex flex-col border border-white/10 relative">
                            {/* Danger Shimmer Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-shimmer bg-[length:200%_100%]"></div>

                            {/* Header */}
                            <div className="relative px-6 py-5 border-b border-white/5 bg-gradient-to-br from-red-500/10 via-background to-orange-500/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/20 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/10">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Delete Task</h2>
                                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-0.5">Termination Protocol</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCancelDeleteTask}
                                        className="flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10"
                                    >
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-5 space-y-5">
                                <p className="text-white/60 text-sm leading-relaxed text-center">
                                    Are you sure you want to terminate <span className="text-white font-bold">"{taskToDelete.title}"</span>? Data will be purged from the protocol.
                                </p>

                                {/* Actions */}
                                <div className="flex flex-col gap-2.5">
                                    <button
                                        onClick={handleConfirmDeleteTask}
                                        className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black uppercase tracking-widest text-[11px] rounded-xl shadow-lg shadow-red-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                                    >
                                        Confirm Deletion
                                    </button>
                                    <button
                                        onClick={handleCancelDeleteTask}
                                        className="py-1 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                    >
                                        Abort Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Full-Screen View Task Modal */}
                {showViewModal && taskToView && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-[9999] p-4 animate-in fade-in duration-300 overflow-y-auto">

                        <div className="glass-card shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col border border-white/10 relative" onClick={(e) => e.stopPropagation()}>
                            {/* Shimmer Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer bg-[length:200%_100%]"></div>

                            {/* Header Section */}
                            <div className="relative px-6 py-5 border-b border-white/5 bg-gradient-to-br from-primary/10 via-background to-accent/5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const statusStyles = getStatusStyles(taskToView.status);
                                                return (
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 ${statusStyles}`}>
                                                        {taskToView.status.replace('_', ' ')}
                                                    </span>
                                                );
                                            })()}
                                            {taskToView.estimatedHours && (
                                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                                    {formatEstimatedTime(taskToView.estimatedHours)}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight">{taskToView.title}</h2>
                                    </div>
                                    <button
                                        onClick={handleCloseViewModal}
                                        className="flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {/* Description */}
                                <div className="space-y-2">
                                    <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Operational Description</h3>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-white/70 leading-relaxed text-sm whitespace-pre-wrap">
                                            {taskToView.description || <span className="italic text-white/20 uppercase tracking-widest text-[10px]">No description record found</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Sprint */}
                                    <div className="space-y-2">
                                        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Iteration</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs border border-primary/20">🏁</div>
                                            <div className="text-[11px] font-black text-white uppercase tracking-wider">
                                                {taskToView.sprint?.name || 'Backlog'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignee */}
                                    <div className="space-y-2">
                                        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Assigned Operative</h3>
                                        <div className="flex items-center gap-3">
                                            {taskToView.assignee ? (
                                                <>
                                                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarColor(taskToView.assignee.id, taskToView.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(), members)} flex items-center justify-center text-[10px] font-black text-white border border-white/10`}>
                                                        {taskToView.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="text-[11px] font-black text-white uppercase tracking-wider truncate">
                                                        {taskToView.assignee.name.split(' ')[0]}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-[10px] italic text-white/20 uppercase tracking-widest">Unassigned</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

TaskBoard.propTypes = {
    projectId: PropTypes.string.isRequired,
    initialTasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            status: PropTypes.string.isRequired,
            assignee: PropTypes.shape({
                name: PropTypes.string.isRequired
            })
        })
    ).isRequired,
    isAdmin: PropTypes.bool.isRequired,
    currentUserId: PropTypes.string,
    sprints: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            status: PropTypes.string
        })
    ),
    onTaskUpdate: PropTypes.func,
    onTaskDelete: PropTypes.func,
    onTaskCreate: PropTypes.func
};

export default TaskBoard;


