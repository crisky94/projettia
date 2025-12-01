'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { showToast } from '../../lib/toast';

// Component to display a task card in showcase mode (read-only)
const ShowcaseTaskCard = ({ task, disableActions = true }) => {
    const [showViewModal, setShowViewModal] = useState(false);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'TODO':
                return 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300';
            case 'IN_PROGRESS':
                return 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-300';
            case 'REVIEW':
                return 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-300';
            case 'COMPLETED':
                return 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300';
            default:
                return 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300';
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            TODO: { emoji: '📋', text: 'To Do', color: 'bg-slate-500' },
            IN_PROGRESS: { emoji: '🔄', text: 'In Progress', color: 'bg-blue-500' },
            REVIEW: { emoji: '👁️', text: 'Review', color: 'bg-yellow-500' },
            COMPLETED: { emoji: '✅', text: 'Completed', color: 'bg-green-500' }
        };
        const badge = badges[status] || badges.TODO;
        return (
            <span className={`${badge.color} text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                <span>{badge.emoji}</span>
                {badge.text}
            </span>
        );
    };

    const formatEstimatedTime = (hours) => {
        if (!hours) return '';
        if (hours < 1) {
            const minutes = Math.round(hours * 60);
            return `${minutes}m`;
        }
        return `${hours}h`;
    };

    const isTitleLong = task.title && task.title.length > 50;
    const isDescriptionLong = task.description && task.description.length > 100;
    const shouldShowViewMore = isTitleLong || isDescriptionLong;

    const truncateText = (text, maxLength) => {
        return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const handleDisabledAction = (actionName) => {
        if (globalThis.window?.toast) {
            globalThis.window.toast.info(`${actionName} is disabled in showcase mode`);
        }
    };

    return (
        <div className={`p-4 sm:p-6 lg:p-7 rounded-lg border-2 transition-all duration-200 hover:shadow-lg group w-full break-words relative min-h-[180px] min-w-0 ${getStatusStyles(task.status)}`}>
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
                {getStatusBadge(task.status)}
            </div>

            <div className="mb-3">
                <div className="flex-1">
                    <div>
                        <h3 className="font-semibold text-lg lg:text-xl mb-2 break-words overflow-hidden">
                            {isTitleLong ? truncateText(task.title, 50) : task.title}
                        </h3>
                        {shouldShowViewMore && (
                            <button
                                onClick={() => setShowViewModal(true)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block"
                                title="View complete task"
                            >
                                View More
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-sm opacity-80 mb-3 line-clamp-2">
                    {isDescriptionLong ? truncateText(task.description, 100) : task.description}
                </p>
            )}

            {/* Task Details */}
            <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                    {task.sprint && (
                        <span className="bg-white/20 px-2 py-1 rounded-full font-medium text-xs">
                            🚀 {task.sprint.name}
                        </span>
                    )}
                    {task.estimatedHours && (
                        <span className="bg-white/20 px-2 py-1 rounded-full font-medium text-xs">
                            ⏱️ {formatEstimatedTime(task.estimatedHours)}
                        </span>
                    )}
                </div>
            </div>

            {/* Assignee */}
            {task.assignee && (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {task.assignee.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-sm font-medium">{task.assignee.name}</span>
                </div>
            )}

            {/* Showcase Action Buttons */}
            {disableActions && (
                <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleDisabledAction('Edit Task')}
                        className="p-1.5 bg-gray-400 rounded-md cursor-default transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center text-white opacity-60"
                        title="Edit task (Disabled in showcase)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDisabledAction('Delete Task')}
                        className="p-1.5 bg-gray-400 rounded-md cursor-default transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center text-white opacity-60"
                        title="Delete task (Disabled in showcase)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 task-view-modal">
                    <div className="bg-card rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-border">
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-card">
                            <div className="flex items-start justify-between gap-2 sm:gap-4 min-w-0">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-card-foreground mb-2 break-words word-wrap overflow-wrap-anywhere">
                                        {task.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        {getStatusBadge(task.status)}
                                        {task.estimatedHours && (
                                            <span className="bg-muted px-2 py-1 rounded-full text-xs">
                                                ⏱️ {formatEstimatedTime(task.estimatedHours)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                                    title="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Showcase Banner in Modal */}
                            {disableActions && (
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-lg border border-orange-200 dark:border-orange-700">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">Showcase Mode - Read Only</span>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {task.description && (
                                <div>
                                    <h3 className="text-sm font-semibold text-card-foreground mb-2">Description</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {task.description}
                                    </p>
                                </div>
                            )}

                            {/* Sprint */}
                            {task.sprint && (
                                <div>
                                    <h3 className="text-sm font-semibold text-card-foreground mb-2">Sprint</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-sm font-medium">
                                            🚀 {task.sprint.name}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Assignee */}
                            {task.assignee && (
                                <div>
                                    <h3 className="text-sm font-semibold text-card-foreground mb-2">Assigned to</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {task.assignee.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <span className="text-sm font-medium text-card-foreground">{task.assignee.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Estimated Time */}
                            {task.estimatedHours && (
                                <div>
                                    <h3 className="text-sm font-semibold text-card-foreground mb-2">Estimated Time</h3>
                                    <span className="text-sm text-muted-foreground">
                                        {formatEstimatedTime(task.estimatedHours)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-muted/50">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ShowcaseTaskCard.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        status: PropTypes.string.isRequired,
        estimatedHours: PropTypes.number,
        assignee: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            email: PropTypes.string
        }),
        sprint: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired
        })
    }).isRequired,
    disableActions: PropTypes.bool
};

// Showcase Task Board with Kanban columns
const ShowcaseTaskBoard = ({ tasks = [], sprints = [] }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const columns = [
        { id: 'TODO', title: 'To Do', emoji: '📋', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', textColor: 'text-slate-600' },
        { id: 'IN_PROGRESS', title: 'In Progress', emoji: '🔄', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-600' },
        { id: 'REVIEW', title: 'Review', emoji: '👁️', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-600' },
        { id: 'COMPLETED', title: 'Completed', emoji: '✅', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-600' }
    ];

    const getTasksForColumn = (status) => {
        return tasks.filter(task => task.status === status);
    };

    return (
        <div className="w-full max-w-full mx-auto space-y-6">
            {/* Showcase Banner */}
            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Showcase Mode Active</span>
                </div>
                <p className="text-sm mt-1 opacity-90">
                    You are viewing a read-only demonstration. All creation, editing, and deletion functions are disabled.
                </p>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Task Board</h1>
                <button
                    onClick={() => {
                        setShowCreateModal(true);
                        showToast.info('Create Task is disabled in showcase mode');
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-default opacity-60"
                    disabled
                >
                    + Create Task (Disabled)
                </button>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {columns.map(column => {
                    const columnTasks = getTasksForColumn(column.id);
                    return (
                        <div
                            key={column.id}
                            className={`${column.bgColor} dark:bg-gray-800 ${column.borderColor} dark:border-gray-700 border-2 rounded-lg min-h-[600px] flex flex-col`}
                        >
                            {/* Column Header */}
                            <div className="p-4 border-b border-current/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{column.emoji}</span>
                                        <h3 className={`font-bold text-lg ${column.textColor}`}>
                                            {column.title}
                                        </h3>
                                        <span className={`${column.textColor} bg-white/50 px-2 py-1 rounded-full text-sm font-medium`}>
                                            {columnTasks.length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 p-4">
                                <div className="space-y-4">
                                    {columnTasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                            <div className="text-4xl mb-3 opacity-50">{column.emoji}</div>
                                            <p className="text-sm text-center">No tasks in {column.title.toLowerCase()}</p>
                                        </div>
                                    ) : (
                                        columnTasks.map(task => (
                                            <ShowcaseTaskCard
                                                key={task.id}
                                                task={task}
                                                disableActions={true}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Disabled Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                                Create New Task
                            </h2>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* Showcase Banner in Modal */}
                            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-lg border border-orange-200 dark:border-orange-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">Task Creation Disabled</span>
                                </div>
                                <p className="text-sm opacity-90">
                                    This is a showcase demonstration. Task creation is disabled to preserve the demo state.
                                </p>
                            </div>

                            {/* Disabled Form */}
                            <div className="space-y-4 opacity-50">
                                <div>
                                    <label htmlFor="showcase-task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Task Title
                                    </label>
                                    <input
                                        id="showcase-task-title"
                                        type="text"
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                        placeholder="Enter task title..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="showcase-task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        id="showcase-task-description"
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed resize-none"
                                        rows="3"
                                        placeholder="Describe the task..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="showcase-task-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <select
                                            id="showcase-task-status"
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                        >
                                            <option>To Do</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="showcase-task-sprint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Sprint
                                        </label>
                                        <select
                                            id="showcase-task-sprint"
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                        >
                                            <option>No sprint</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-muted/50 flex justify-end gap-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled
                                className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-60"
                            >
                                Create Task (Disabled)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ShowcaseTaskBoard.propTypes = {
    tasks: PropTypes.array,
    sprints: PropTypes.array
};

export default ShowcaseTaskBoard;