'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { showToast } from '../../lib/toast';

// Component to display a task card in showcase mode (read-only)
const ShowcaseTaskCard = ({ task }) => {
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

            {/* Showcase indicator */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs">
                    Showcase Mode
                </div>
            </div>

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
    }).isRequired
};

// Component to display a sprint with its tasks in showcase mode (read-only)
const ShowcaseSprintCard = ({ sprint, tasks }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const getSprintStatusStyles = (status) => {
        switch (status) {
            case 'PLANNING':
                return 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-300';
            case 'ACTIVE':
                return 'border-green-300 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300';
            case 'COMPLETED':
                return 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-300';
            case 'CANCELLED':
                return 'border-red-300 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300';
            default:
                return 'border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-900/20 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            PLANNING: '📋',
            ACTIVE: '🚀',
            COMPLETED: '✅',
            CANCELLED: '❌'
        };
        return icons[status] || '📋';
    };

    const getTotalEstimatedHours = () => {
        return tasks.reduce((total, task) => total + (task.estimatedHours || 0), 0);
    };

    const getCompletedTasksCount = () => {
        return tasks.filter(task => task.status === 'COMPLETED').length;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleDisabledAction = (actionName) => {
        showToast.info(`${actionName} is disabled in showcase mode`);
    };

    return (
        <div className={`rounded-xl border-2 bg-card text-slate-400 transition-all duration-200 w-full overflow-hidden ${getSprintStatusStyles(sprint.status)}`}>
            {/* Header */}
            <div className="p-4 border-b border-current/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{getStatusIcon(sprint.status)}</span>
                        <div>
                            <h3 className="text-lg font-bold">{sprint.name}</h3>
                            <div className="flex items-center gap-4 text-sm opacity-80">
                                <span>📅 {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                                <span>📊 {getCompletedTasksCount()}/{tasks.length} tasks</span>
                                {getTotalEstimatedHours() > 0 && (
                                    <span>⏱️ {getTotalEstimatedHours()}h estimated</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleDisabledAction('Create Task')}
                                className="p-2 bg-gray-400 text-white rounded-md cursor-default opacity-60 min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Create Task (Disabled in showcase)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDisabledAction('Edit Sprint')}
                                className="p-2 bg-gray-400 text-white rounded-md cursor-default opacity-60 min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Edit Sprint (Disabled in showcase)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDisabledAction('Delete Sprint')}
                                className="p-2 bg-gray-400 text-white rounded-md cursor-default opacity-60 min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Delete Sprint (Disabled in showcase)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-white/20 rounded-md transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
                        >
                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Description */}
                {sprint.description && (
                    <p className="mt-3 text-sm opacity-80">{sprint.description}</p>
                )}
            </div>

            {/* Tasks */}
            {isExpanded && (
                <div className="p-4">
                    {tasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-700 dark:text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>No tasks in this sprint</span>
                        </div>
                    ) : (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                            {tasks.map(task => (
                                <ShowcaseTaskCard
                                    key={task.id}
                                    task={task}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

ShowcaseSprintCard.propTypes = {
    sprint: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        startDate: PropTypes.string.isRequired,
        endDate: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired
    }).isRequired,
    tasks: PropTypes.array.isRequired
};

// Main Showcase Sprint Manager Component
const ShowcaseSprintManager = ({ sprints = [], tasks = [] }) => {
    const getTasksForSprint = (sprintId) => {
        return tasks.filter(task => task.sprint?.id === sprintId);
    };

    const getTasksWithoutSprint = () => {
        return tasks.filter(task => !task.sprint);
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
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Sprint Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => showToast.info('Create Sprint is disabled in showcase mode')}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-default opacity-60"
                    >
                        + Create Sprint (Disabled)
                    </button>
                    <button
                        onClick={() => showToast.info('Create Task is disabled in showcase mode')}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-default opacity-60"
                    >
                        + Create Task (Disabled)
                    </button>
                </div>
            </div>

            {/* Sprints */}
            <div className="space-y-6">
                {sprints.map(sprint => (
                    <ShowcaseSprintCard
                        key={sprint.id}
                        sprint={sprint}
                        tasks={getTasksForSprint(sprint.id)}
                    />
                ))}

                {/* Tasks without Sprint */}
                {getTasksWithoutSprint().length > 0 && (
                    <div className="rounded-xl border-2 border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <span className="text-2xl">📋</span>
                                Backlog (No Sprint Assigned)
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                                {getTasksWithoutSprint().map(task => (
                                    <ShowcaseTaskCard
                                        key={task.id}
                                        task={task}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty state */}
            {sprints.length === 0 && tasks.length === 0 && (
                <div className="text-center py-12 px-4">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Sprints Yet</h3>
                    <p className="text-muted-foreground mb-4">
                        This is where you would organize your work into time-boxed sprints
                    </p>
                    <p className="text-sm text-muted-foreground">
                        In the real app, you could create sprints and assign tasks to them
                    </p>
                </div>
            )}
        </div>
    );
};

ShowcaseSprintManager.propTypes = {
    sprints: PropTypes.array,
    tasks: PropTypes.array
};

export default ShowcaseSprintManager;