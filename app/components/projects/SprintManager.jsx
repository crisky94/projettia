'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

// Component to display a task card with sprint information
const TaskCard = ({ task, isAdmin, onUpdateTask, onDeleteTask, allMembers = [], sprints = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingTask, setEditingTask] = useState({
        title: task.title,
        description: task.description || '',
        assigneeId: task.assignee?.id || '',
        sprintId: task.sprint?.id || '',
        estimatedHours: task.estimatedHours || ''
    });

    const getStatusStyles = (status) => {
        // Background adapts to light/dark; borders darken in dark mode for contrast
        const styles = {
            PENDING: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/10 dark:border-amber-800 dark:text-amber-400',
            IN_PROGRESS: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-400',
            COMPLETED: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 dark:text-green-400',
            CANCELLED: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400'
        };
        return styles[status] || styles.PENDING;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': {
                color: 'text-amber-600 bg-amber-200',
                icon: '⏳',
                text: 'Pending'
            },
            'IN_PROGRESS': {
                color: 'text-blue-600 bg-blue-200',
                icon: '⚡',
                text: 'In Progress'
            },
            'COMPLETED': {
                color: 'text-green-600 bg-green-100',
                icon: '✅',
                text: 'Completed'
            },
            'CANCELLED': {
                color: 'text-red-600 bg-red-100',
                icon: '❌',
                text: 'Cancelled'
            }
        };
        return statusConfig[status] || { color: 'text-gray-700 bg-gray-100 dark:bg-gray-700', icon: '❓', text: status };
    };

    const handleSave = async () => {
        try {
            await onUpdateTask(task.id, {
                title: editingTask.title,
                description: editingTask.description,
                assigneeId: editingTask.assigneeId || null,
                sprintId: editingTask.sprintId || null,
                estimatedHours: editingTask.estimatedHours ? parseFloat(editingTask.estimatedHours) : null
            });
            setIsEditing(false);
            toast.success('Task updated successfully!');
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Error updating task');
        }
    };

    const handleCancel = () => {
        setEditingTask({
            title: task.title,
            description: task.description || '',
            assigneeId: task.assignee?.id || '',
            sprintId: task.sprint?.id || '',
            estimatedHours: task.estimatedHours || ''
        });
        setIsEditing(false);
    };

    const formatEstimatedTime = (hours) => {
        if (!hours) return null;
        if (hours < 1) {
            // Convert to minutes and handle decimal precision
            const minutes = Math.round(hours * 60);
            return `${minutes}min`;
        }
        if (hours >= 8) return `${Math.round(hours / 8)}d`;
        // Show hours as they are
        return `${hours}h`;
    };

    // Helper functions to determine if content is too long
    const isTitleLong = task.title && task.title.length > 50;
    const isDescriptionLong = task.description && task.description.length > 100;
    const shouldShowViewMore = isTitleLong || isDescriptionLong;

    const truncateText = (text, maxLength) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md group w-full break-words relative ${getStatusStyles(task.status)}`}>
            {/* Header */}
            <div className="mb-3">
                <div className="flex-1">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Task title"
                        />
                    ) : (
                        <div>
                            <h3 className="font-semibold text-sm mb-1 break-words overflow-hidden">
                                {isTitleLong ? truncateText(task.title, 50) : task.title}
                            </h3>
                            {shouldShowViewMore && (
                                <button
                                    onClick={() => setShowViewModal(true)}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block"
                                    title="Ver tarea completa"
                                >
                                    Ver más
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>            {/* Description */}
            {isEditing ? (
                <textarea
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-3"
                    placeholder="Task description"
                    rows="2"
                />
            ) : (
                task.description && (
                    <p className="text-sm opacity-80 mb-3 line-clamp-2">
                        {isDescriptionLong ? truncateText(task.description, 100) : task.description}
                    </p>
                )
            )}

            {/* Sprint and Time Info */}
            <div className="flex items-center justify-between mb-3 text-xs">
                {isEditing ? (
                    <div className="flex gap-2 w-full">
                        <select
                            value={editingTask.sprintId}
                            onChange={(e) => setEditingTask({ ...editingTask, sprintId: e.target.value })}
                            className="flex-1 p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">No sprint</option>
                            {sprints.filter(s => s.status !== 'COMPLETED').map(sprint => (
                                <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={editingTask.estimatedHours}
                            onChange={(e) => setEditingTask({ ...editingTask, estimatedHours: e.target.value })}
                            className="w-20 p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="0.5h"
                            min="0.5"
                            max="1000"
                            step="0.5"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Badge */}
                        {(() => {
                            const statusBadge = getStatusBadge(task.status);
                            return (
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                    <span className="text-xs">{statusBadge.icon}</span>
                                    {statusBadge.text}
                                </span>
                            );
                        })()}
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
                )}
            </div>

            {/* Assignee */}
            {isEditing ? (
                <select
                    value={editingTask.assigneeId}
                    onChange={(e) => setEditingTask({ ...editingTask, assigneeId: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                    <option value="">unasigned</option>
                    {allMembers.map(member => (
                        <option key={member.userId} value={member.userId}>
                            {member.user?.name || 'Unknown user'}
                        </option>
                    ))}
                </select>
            ) : (
                task.assignee && (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-semibold">
                            {task.assignee.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium">{task.assignee.name}</span>
                    </div>
                )
            )}

            {/* Action buttons positioned at bottom right */}
            {!isEditing && (
                <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 hover:bg-white/20 rounded-md transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center touch-action-manipulation"
                        title="Edit task"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors text-red-600 dark:text-red-400 min-h-[32px] min-w-[32px] flex items-center justify-center touch-action-manipulation"
                        title="Delete task"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )}

            {isEditing && (
                <div className="absolute bottom-3 right-3 flex gap-1">
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
                        className="p-1.5 hover:bg-gray-500/20 rounded-md transition-colors"
                        title="Cancel"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Modal de vista completa */}
            {showViewModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-card">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-card-foreground mb-2 break-words word-wrap overflow-wrap-anywhere">
                                        {task.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        {(() => {
                                            const statusBadge = getStatusBadge(task.status);
                                            return (
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                    <span className="text-xs">{statusBadge.icon}</span>
                                                    {statusBadge.text}
                                                </span>
                                            );
                                        })()}
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
                                    title="Cerrar"
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
                                    <h3 className="text-sm font-semibold text-card-foreground mb-2">Descripción</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {task.description}
                                    </p>
                                </div>
                            )}

                            {/* Sprint Info */}
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
                                    <h3 className="text-sm font-semibold text-card-foreground mb-2">Asignado a</h3>
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
                                    <h3 className="text-sm font-semibold text-card-foreground mb-2">Tiempo estimado</h3>
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
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

TaskCard.propTypes = {
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
    isAdmin: PropTypes.bool.isRequired,
    onUpdateTask: PropTypes.func.isRequired,
    onDeleteTask: PropTypes.func.isRequired,
    allMembers: PropTypes.arrayOf(PropTypes.shape({
        userId: PropTypes.string.isRequired,
        user: PropTypes.shape({
            name: PropTypes.string.isRequired
        }).isRequired
    })).isRequired,
    sprints: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired
    })).isRequired
};

// Component to display a sprint with its tasks
const SprintCard = ({ sprint, tasks, isAdmin, onUpdateTask, onDeleteTask, onUpdateSprint, onDeleteSprint, allMembers, projectId, onTaskCreate }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigneeId: '',
        estimatedHours: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSprint, setEditingSprint] = useState({
        name: sprint.name,
        description: sprint.description || '',
        startDate: sprint.startDate.split('T')[0],
        endDate: sprint.endDate.split('T')[0],
        status: sprint.status
    });

    const getSprintStatusStyles = (status) => {
        // Only the border reflects the sprint status color; content stays neutral (black in light, white in dark)
        const styles = {
            PLANNING: 'border-gray-400 dark:border-gray-500',
            ACTIVE: 'border-blue-500 dark:border-blue-400',
            COMPLETED: 'border-green-500 dark:border-green-400',
            CANCELLED: 'border-red-500 dark:border-red-400'
        };
        return styles[status] || styles.PLANNING;
    };

    const getStatusIcon = (status) => {
        const icons = {
            PLANNING: '📋',
            ACTIVE: '🚀',
            COMPLETED: '✅',
            CANCELLED: '❌'
        };
        return icons[status] || icons.PLANNING;
    };

    const handleSaveSprint = async () => {
        try {
            await onUpdateSprint(sprint.id, editingSprint);
            setIsEditing(false);
            toast.success('Sprint updated successfully!');
        } catch (error) {
            console.error('Error updating sprint:', error);
            toast.error('Error updating sprint');
        }
    };

    const handleCancel = () => {
        setEditingSprint({
            name: sprint.name,
            description: sprint.description || '',
            startDate: sprint.startDate.split('T')[0],
            endDate: sprint.endDate.split('T')[0],
            status: sprint.status
        });
        setIsEditing(false);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    assigneeId: newTask.assigneeId || null,
                    sprintId: sprint.id,
                    // Convert minutes input to hours (e.g., 30 -> 0.5)
                    estimatedHours: newTask.estimatedHours ? Number(newTask.estimatedHours) / 60 : null,
                    status: 'PENDING'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const createdTask = await response.json();

            // Notify parent component
            if (onTaskCreate) {
                onTaskCreate(createdTask);
            }

            setShowAddTaskModal(false);
            setNewTask({ title: '', description: '', assigneeId: '', estimatedHours: '' });

            // Show success notification
            toast.success('Task created successfully!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error creating task:', error);
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

    const getTotalEstimatedHours = () => {
        return tasks.reduce((total, task) => total + (task.estimatedHours || 0), 0);
    };

    const getCompletedTasksCount = () => {
        return tasks.filter(task => task.status === 'COMPLETED').length;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className={`rounded-xl border-2 bg-card text-slate-400 transition-all duration-200 w-full overflow-hidden ${getSprintStatusStyles(sprint.status)}`}>
            {/* Sprint Header */}
            <div className="p-4 border-b border-current/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{getStatusIcon(sprint.status)}</span>
                        {isEditing ? (
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    value={editingSprint.name}
                                    onChange={(e) => setEditingSprint({ ...editingSprint, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Sprint name"
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={editingSprint.status}
                                        onChange={(e) => setEditingSprint({ ...editingSprint, status: e.target.value })}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="PLANNING">Planificación</option>
                                        <option value="ACTIVE">Activo</option>
                                        <option value="COMPLETED">Completado</option>
                                        <option value="CANCELLED">Cancelado</option>
                                    </select>
                                    <input
                                        type="date"
                                        value={editingSprint.startDate}
                                        onChange={(e) => {
                                            const newStartDate = e.target.value;
                                            const updates = { startDate: newStartDate };

                                            // If end date is before start date, clear it
                                            if (editingSprint.endDate && editingSprint.endDate < newStartDate) {
                                                updates.endDate = '';
                                            }

                                            setEditingSprint({ ...editingSprint, ...updates });
                                        }}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="date"
                                        value={editingSprint.endDate}
                                        onChange={(e) => setEditingSprint({ ...editingSprint, endDate: e.target.value })}
                                        min={editingSprint.startDate || undefined}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-bold">{sprint.name}</h3>
                                <div className="flex items-center gap-4 text-sm opacity-80">
                                    <span>📅 {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                                    <span>📊 {getCompletedTasksCount()}/{tasks.length} tareas</span>
                                    {getTotalEstimatedHours() > 0 && (
                                        <span>⏱️ {getTotalEstimatedHours()}h estimadas</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setShowAddTaskModal(true)}
                                        className="p-2 hover:bg-white/20 rounded-md transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center touch-action-manipulation"
                                        title="Add new task to this sprint"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 hover:bg-white/20 rounded-md transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center touch-action-manipulation"
                                        title="Edit sprint"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={() => onDeleteSprint(sprint.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-md transition-colors text-red-600 dark:text-red-400 min-h-[36px] min-w-[36px] flex items-center justify-center touch-action-manipulation"
                                            title="Delete sprint - Admin only"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSaveSprint}
                                        className="p-2 hover:bg-green-500/20 rounded-md transition-colors text-green-600 dark:text-green-400"
                                        title="Guardar cambios"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="p-2 hover:bg-gray-500/20 rounded-md transition-colors"
                                        title="Cancel"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-white/20 rounded-md transition-colors"
                            title={isExpanded ? "Contraer" : "Expandir"}
                        >
                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Sprint Description */}
                {isEditing ? (
                    <textarea
                        value={editingSprint.description}
                        onChange={(e) => setEditingSprint({ ...editingSprint, description: e.target.value })}
                        className="w-full mt-3 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Sprint description"
                        rows="2"
                    />
                ) : (
                    sprint.description && (
                        <p className="mt-3 text-sm opacity-80">{sprint.description}</p>
                    )
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
                            <span>No hay tareas en este sprint</span>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {tasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    isAdmin={isAdmin}
                                    onUpdateTask={onUpdateTask}
                                    onDeleteTask={onDeleteTask}
                                    allMembers={allMembers}
                                    sprints={[]}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add Task Modal */}
            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
                    <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border">
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                                    <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-3 h-3 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    Add Task to Sprint
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        setNewTask({ title: '', description: '', assigneeId: '', estimatedHours: '' });
                                    }}
                                    className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 transition-colors p-2 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                                    disabled={isSubmitting}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">
                                Creating task for: <span className="font-semibold">{sprint.name}</span>
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreateTask} className="p-3 space-y-3">
                            <div>
                                <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Task Title *
                                </label>
                                <input
                                    id="task-title"
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                    placeholder="Enter task title..."
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="task-description"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors resize-none"
                                    rows="3"
                                    placeholder="Describe the task details..."
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="task-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Assign to
                                    </label>
                                    <select
                                        id="task-assignee"
                                        value={newTask.assigneeId}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, assigneeId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">unasigned</option>
                                        {!Array.isArray(allMembers) || allMembers.length === 0 ? (
                                            <option disabled>Loading members...</option>
                                        ) : (
                                            allMembers.map((member) => (
                                                <option key={member.userId} value={member.userId}>
                                                    {member.user.name} ({member.role === 'ADMIN' ? 'Admin' : 'Member'})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="task-minutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Estimated Time (minutes)
                                    </label>
                                    <input
                                        id="task-minutes"
                                        type="number"
                                        min="30"
                                        step="30"
                                        value={newTask.estimatedHours}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        placeholder="30, 60, 90..."
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-xs text-gray-700 mt-1">Mínimo 30 minutos. Incrementos de 30.</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        setNewTask({ title: '', description: '', assigneeId: '', estimatedHours: '' });
                                    }}
                                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-muted-foreground hover:text-card-foreground font-medium transition-colors text-sm min-h-[44px] sm:min-h-[36px] rounded-lg border border-border hover:bg-muted touch-action-manipulation flex items-center justify-center"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg font-medium shadow-sm transition-all duration-200 text-sm min-h-[44px] sm:min-h-[36px] touch-action-manipulation flex items-center justify-center gap-2 ${isSubmitting
                                        ? 'bg-violet-400 text-white cursor-not-allowed'
                                        : 'bg-violet-500 text-white '
                                        }`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating...
                                        </span>
                                    ) : (
                                        'Create Task'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

SprintCard.propTypes = {
    sprint: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        startDate: PropTypes.string.isRequired,
        endDate: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired
    }).isRequired,
    tasks: PropTypes.array.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onUpdateTask: PropTypes.func.isRequired,
    onDeleteTask: PropTypes.func.isRequired,
    onUpdateSprint: PropTypes.func.isRequired,
    onDeleteSprint: PropTypes.func.isRequired,
    allMembers: PropTypes.array.isRequired,
    projectId: PropTypes.string.isRequired,
    onTaskCreate: PropTypes.func.isRequired
};

/**
 * SprintManager Component
 * 
 * PERMISSIONS UPDATED:
 * - ✅ All members can CREATE sprints (no longer admin-only)
 * - ✅ All members can EDIT sprints (no longer admin-only)
 * - ✅ All members can CREATE tasks within sprints (no longer admin-only)
 * - ✅ All members can EDIT tasks (no longer admin-only)
 * - ✅ All members can DELETE tasks (no longer admin-only)
 * - ❌ Only admins can DELETE sprints (security restriction maintained)
 * 
 * This enables better team collaboration where any member can organize work
 * into sprints, manage sprint details, and handle task management completely,
 * while keeping sprint deletion restricted for project integrity.
 */
const SprintManager = ({ projectId, isAdmin, allMembers, tasks = [], onTaskUpdate, onTaskDelete, onTaskCreate }) => {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddSprintModal, setShowAddSprintModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showDeleteSprintModal, setShowDeleteSprintModal] = useState(false);
    const [sprintToDelete, setSprintToDelete] = useState(null);
    const [newSprint, setNewSprint] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
    });
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigneeId: '',
        estimatedHours: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const sprintsRes = await fetch(`/api/projects/${projectId}/sprints`);

            if (sprintsRes.ok) {
                const sprintsData = await sprintsRes.json();
                setSprints(sprintsData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSprint = async (e) => {
        e.preventDefault();
        if (!newSprint.name.trim() || !newSprint.startDate || !newSprint.endDate) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/sprints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSprint)
            });

            if (response.ok) {
                const sprint = await response.json();
                setSprints([sprint, ...sprints]);
                setNewSprint({ name: '', description: '', startDate: '', endDate: '' });
                setShowAddSprintModal(false);
                toast.success('Sprint created successfully!');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error creating sprint');
            }
        } catch (error) {
            console.error('Error creating sprint:', error);
            toast.error('Error creating sprint');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSprint = async (sprintId, updateData) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedSprint = await response.json();
                setSprints(sprints.map(s => s.id === sprintId ? updatedSprint : s));
            } else {
                const error = await response.json();
                throw new Error(error.error);
            }
        } catch (error) {
            console.error('Error updating sprint:', error);
            toast.error('Error updating sprint');
            throw error;
        }
    };

    const handleDeleteSprint = async (sprintId) => {
        setSprintToDelete(sprints.find(s => s.id === sprintId));
        setShowDeleteSprintModal(true);
    };

    const confirmDeleteSprint = async () => {
        if (!sprintToDelete) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/sprints/${sprintToDelete.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setSprints(sprints.filter(s => s.id !== sprintToDelete.id));
                toast.success(`El sprint "${sprintToDelete.name}" fue eliminado. Las tareas se movieron a "Sin sprint".`, {
                    position: 'top-right',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error eliminando sprint', {
                    position: 'top-right',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error('Error eliminando sprint:', error);
            toast.error('Error eliminando sprint', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSubmitting(false);
            setShowDeleteSprintModal(false);
            setSprintToDelete(null);
        }
    };

    const cancelDeleteSprint = () => {
        setShowDeleteSprintModal(false);
        setSprintToDelete(null);
    };
    // ...existing code...

    const handleUpdateTask = async (taskId, updateData) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedTask = await response.json();
                // Notify parent component to update shared state
                if (onTaskUpdate) {
                    onTaskUpdate(updatedTask);
                }
            } else {
                const error = await response.json();
                throw new Error(error.error);
            }
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
            return;
        }

        try {
            const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Find the task being deleted
                const deletedTask = tasks.find(t => t.id === taskId);
                // Notify parent component to update shared state
                if (onTaskDelete && deletedTask) {
                    onTaskDelete(deletedTask);
                }
                toast.success('Task deleted successfully!');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error deleting task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Error deleting task');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    assigneeId: newTask.assigneeId || null,
                    // Convert minutes input to hours (e.g., 30 -> 0.5)
                    estimatedHours: newTask.estimatedHours ? Number(newTask.estimatedHours) / 60 : null,
                    status: 'PENDING'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const createdTask = await response.json();

            // Notify parent component
            if (onTaskCreate) {
                onTaskCreate(createdTask);
            }

            setShowAddTaskModal(false);
            setNewTask({ title: '', description: '', assigneeId: '', estimatedHours: '' });

            // Show success notification
            toast.success('Task created successfully!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error creating task:', error);
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

    const getTasksForSprint = (sprintId) => {
        return tasks.filter(task => task.sprintId === sprintId);
    };

    const getTasksWithoutSprint = () => {
        return tasks.filter(task => !task.sprintId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8 bg-background min-h-screen overflow-x-hidden">
            <div className="space-y-6 w-full">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-4 sm:flex-row sm:items-center sm:justify-between sm:text-left sm:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold dark:text-gray-600">🚀 Sprint Management</h2>
                    <p className="text-gray-600 dark:text-gray-600 mt-1">Organize your tasks into time-boxed sprints</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddTaskModal(true)}
                        className="px-4 py-2 bg-violet-400 text-primary-foreground hover:opacity-90  rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2 min-h-[44px] touch-action-manipulation"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="hidden sm:inline">New Task</span>
                        <span className="sm:hidden">Task</span>
                    </button>
                    <button
                        onClick={() => setShowAddSprintModal(true)}
                        className="px-4 py-2 rounded-lg font-medium shadow-sm bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 flex items-center gap-2 min-h-[44px] touch-action-manipulation"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="hidden sm:inline">New Sprint</span>
                        <span className="sm:hidden">Sprint</span>
                    </button>
                </div>
            </div>

            {/* Sprints */}
            <div className="space-y-6">
                {sprints.map(sprint => (
                    <SprintCard
                        key={sprint.id}
                        sprint={sprint}
                        tasks={getTasksForSprint(sprint.id)}
                        isAdmin={isAdmin}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        onUpdateSprint={handleUpdateSprint}
                        onDeleteSprint={handleDeleteSprint}
                        allMembers={allMembers}
                        projectId={projectId}
                        onTaskCreate={onTaskCreate}
                    />
                ))}

                {/* Tasks without sprint */}
                {getTasksWithoutSprint().length > 0 && (
                    <div className="bg-card rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    📋 Tasks without Sprint
                                    <span className="text-sm font-normal">({getTasksWithoutSprint().length})</span>
                                </h3>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                {getTasksWithoutSprint().map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        isAdmin={isAdmin}
                                        onUpdateTask={handleUpdateTask}
                                        onDeleteTask={handleDeleteTask}
                                        allMembers={allMembers}
                                        sprints={sprints}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Modal de confirmación para eliminar sprint */}
            {showDeleteSprintModal && sprintToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-card-foreground">Eliminar Sprint</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">¿Seguro que quieres eliminar el sprint "{sprintToDelete.name}"? Las tareas se moverán a "Sin sprint".</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-3 flex justify-end gap-3">
                            <button
                                onClick={cancelDeleteSprint}
                                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-muted-foreground hover:text-card-foreground font-medium transition-colors text-sm min-h-[44px] sm:min-h-[36px] rounded-lg border border-border hover:bg-muted touch-action-manipulation flex items-center justify-center"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteSprint}
                                className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg text-white font-medium min-h-[44px] sm:min-h-[36px] ${isSubmitting ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Sprint Modal */}
            {showAddSprintModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
                    <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border">
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                                    <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-3 h-3 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    New Sprint
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddSprintModal(false);
                                        setNewSprint({ name: '', description: '', startDate: '', endDate: '' });
                                    }}
                                    className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 transition-colors p-2 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleCreateSprint} className="p-3 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sprint Name *
                                </label>
                                <input
                                    type="text"
                                    value={newSprint.name}
                                    onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                    placeholder="e.g.: Sprint 1 - Basic Features"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newSprint.description}
                                    onChange={(e) => setNewSprint({ ...newSprint, description: e.target.value })}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors resize-none"
                                    rows="3"
                                    placeholder="Optional sprint description..."
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={newSprint.startDate}
                                        onChange={(e) => {
                                            const newStartDate = e.target.value;
                                            const updates = { startDate: newStartDate };

                                            // If end date is before start date, clear it
                                            if (newSprint.endDate && newSprint.endDate < newStartDate) {
                                                updates.endDate = '';
                                            }

                                            setNewSprint({ ...newSprint, ...updates });
                                        }}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={newSprint.endDate}
                                        onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                                        min={newSprint.startDate || undefined}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddSprintModal(false);
                                        setNewSprint({ name: '', description: '', startDate: '', endDate: '' });
                                    }}
                                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-muted-foreground hover:text-card-foreground font-medium transition-colors text-sm min-h-[44px] sm:min-h-[36px] rounded-lg border border-border hover:bg-muted touch-action-manipulation flex items-center justify-center"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg font-medium shadow-sm transition-all duration-200 text-sm min-h-[44px] sm:min-h-[36px] touch-action-manipulation flex items-center justify-center gap-2 ${isSubmitting
                                        ? 'bg-violet-400 text-white cursor-not-allowed'
                                        : 'bg-violet-500 text-white '
                                        }`}
                                    disabled={isSubmitting || !newSprint.name.trim() || !newSprint.startDate || !newSprint.endDate}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Sprint'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Task Modal (for tasks without sprint) */}
            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
                    <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border">
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                                    <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-3 h-3 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    New Task
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        setNewTask({ title: '', description: '', assigneeId: '', estimatedHours: '' });
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                                    disabled={isSubmitting}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreateTask} className="p-3 space-y-3">
                            <div>
                                <label htmlFor="main-task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Task Title *
                                </label>
                                <input
                                    id="main-task-title"
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                    placeholder="Enter task title..."
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="main-task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="main-task-description"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors resize-none"
                                    rows="3"
                                    placeholder="Describe the task details..."
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="main-task-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Assign to
                                    </label>
                                    <select
                                        id="main-task-assignee"
                                        value={newTask.assigneeId}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, assigneeId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">unasigned</option>
                                        {!Array.isArray(allMembers) || allMembers.length === 0 ? (
                                            <option disabled>Loading members...</option>
                                        ) : (
                                            allMembers.map((member) => (
                                                <option key={member.userId} value={member.userId}>
                                                    {member.user.name} ({member.role === 'ADMIN' ? 'Admin' : 'Member'})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="main-task-minutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Estimated Time (minutes)
                                    </label>
                                    <input
                                        id="main-task-minutes"
                                        type="number"
                                        min="30"
                                        step="30"
                                        value={newTask.estimatedHours}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        placeholder="30, 60, 90..."
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-xs text-gray-700 mt-1">Mínimo 30 minutos. Incrementos de 30.</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        setNewTask({ title: '', description: '', assigneeId: '', estimatedHours: '' });
                                    }}
                                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-muted-foreground hover:text-card-foreground font-medium transition-colors text-sm min-h-[44px] sm:min-h-[36px] rounded-lg border border-border hover:bg-muted touch-action-manipulation flex items-center justify-center"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg font-medium shadow-sm transition-all duration-200 text-sm min-h-[44px] sm:min-h-[36px] touch-action-manipulation flex items-center justify-center gap-2 ${isSubmitting
                                        ? 'bg-violet-400 text-white cursor-not-allowed'
                                        : 'bg-violet-500 text-white '
                                        }`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating...
                                        </span>
                                    ) : (
                                        'Create Task'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

SprintManager.propTypes = {
    projectId: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    allMembers: PropTypes.array.isRequired,
    tasks: PropTypes.array,
    onTaskUpdate: PropTypes.func,
    onTaskDelete: PropTypes.func,
    onTaskCreate: PropTypes.func
};

export default SprintManager;
