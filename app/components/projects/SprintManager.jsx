'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

// Component to display a task card with sprint information
// --- Global Helper Functions ---

const getStatusStyles = (status) => {
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
        'PENDING': { color: 'text-amber-600 bg-amber-200', icon: '⏳', text: 'Pending' },
        'IN_PROGRESS': { color: 'text-blue-600 bg-blue-200', icon: '⚡', text: 'In Progress' },
        'COMPLETED': { color: 'text-green-600 bg-green-100', icon: '✅', text: 'Completed' },
        'CANCELLED': { color: 'text-red-600 bg-red-100', icon: '❌', text: 'Cancelled' }
    };
    return statusConfig[status] || { color: 'text-gray-700 bg-gray-100 dark:bg-gray-700', icon: '❓', text: status };
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

const getAvatarColor = (userId, initials, allMembersList) => {
    const colors = [
        'from-blue-500 to-purple-600', 'from-green-500 to-teal-600',
        'from-pink-500 to-rose-600', 'from-orange-500 to-red-600',
        'from-indigo-500 to-blue-600', 'from-purple-500 to-pink-600',
        'from-teal-500 to-cyan-600', 'from-yellow-500 to-orange-600',
        'from-emerald-500 to-green-600', 'from-violet-500 to-purple-600',
    ];
    const membersWithSameInitials = (allMembersList || []).filter(member => {
        if (!member.user?.name) return false;
        const memberInitials = member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        return memberInitials === initials;
    });
    if (membersWithSameInitials.length <= 1) return colors[0];
    const memberIndex = membersWithSameInitials.findIndex(member => member.userId === userId);
    return colors[memberIndex !== -1 ? memberIndex % colors.length : 0];
};

const getSprintStatusStyles = (status) => {
    switch (status) {
        case 'ACTIVE': return 'bg-emerald-500/10 border-emerald-500 text-emerald-500 border-2';
        case 'COMPLETED': return 'bg-blue-500/10 border-blue-500 text-blue-500 border-2';
        case 'PLANNED':
        case 'PLANNING': return 'bg-violet-500/10 border-violet-500 text-violet-500 border-2';
        case 'CANCELLED': return 'bg-red-500/10 border-red-500 text-red-500 border-2';
        default: return 'bg-gray-500/10 border-gray-500 text-gray-500 border-2';
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'ACTIVE': return '⚡';
        case 'COMPLETED': return '✨';
        case 'PLANNED':
        case 'PLANNING': return '📅';
        case 'CANCELLED': return '❌';
        default: return '🔋';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

// --- Components ---

const TaskCard = ({ task, isAdmin, onUpdateTask, onDeleteTask, onViewTask, allMembers = [], sprints = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingTask, setEditingTask] = useState({
        title: task.title,
        description: task.description || '',
        assigneeId: task.assignee?.id || '',
        sprintId: task.sprint?.id || '',
        estimatedHours: task.estimatedHours || ''
    });

    const isTitleLong = task.title && task.title.length > 50;


    const handleSave = async () => {
        try {
            const payload = {
                ...editingTask,
                estimatedHours: parseFloat(editingTask.estimatedHours) || 0
            };
            await onUpdateTask(task.id, payload);
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

    return (
        <div className={`p-5 sm:p-6 lg:p-7 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group w-full break-words relative min-h-[200px] min-w-0 backdrop-blur-sm ${getStatusStyles(task.status)}`}>
            {/* Header / Title */}
            <div className="mb-4">
                {isEditing ? (
                    <div className="space-y-4">
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
                        <div className="space-y-4">
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
                        <div className="pr-20">
                            <h3 className="text-lg font-bold mb-1 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                                {isTitleLong ? truncateText(task.title, 50) : task.title}
                            </h3>
                        </div>
                        <button
                            onClick={() => onViewTask(task)}
                            className="mt-2 text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center gap-1 group/btn"
                            title="View full task"
                        >
                            <svg className="w-3 h-3 transition-transform group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View more
                        </button>

                        <div className="mt-4">
                            <div className="flex items-center gap-3">
                                {task.assignee ? (
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br ${getAvatarColor(task.assignee.id, task.assignee.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(), allMembers)} text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white/20`}>
                                        {task.assignee.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                        ?
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                                    {task.assignee?.name || 'Unassigned'}
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
            </div>

            {/* Action buttons */}
            {!isEditing ? (
                <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 min-h-[36px] min-w-[36px] flex items-center justify-center shadow-lg border border-gray-200 dark:border-gray-700"
                        title="Edit task"
                    >
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 text-red-600 dark:text-red-400 min-h-[36px] min-w-[36px] flex items-center justify-center shadow-lg border border-gray-200 dark:border-gray-700"
                        title="Delete task"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="absolute top-4 right-4 flex gap-1">
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
    onViewTask: PropTypes.func.isRequired,
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
const SprintCard = ({ sprint, tasks, isAdmin, onUpdateTask, onDeleteTask, onUpdateSprint, onDeleteSprint, onViewTask, onViewSprint, onAddTaskToSprint, allMembers, sprints }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingSprint, setEditingSprint] = useState({
        name: sprint.name,
        description: sprint.description || '',
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: sprint.status
    });

    const handleSaveSprint = async () => {
        try {
            await onUpdateSprint(sprint.id, editingSprint);
            setIsEditing(false);
            toast.success('Sprint updated successfully !');
        } catch (error) {
            console.error('Error updating sprint: ', error);
            toast.error('Error updating sprint ');
        }
    };

    const handleCancel = () => {
        setEditingSprint({
            name: sprint.name,
            description: sprint.description || '',
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            status: sprint.status
        });
        setIsEditing(false);
    };

    const getTotalEstimatedHours = () => {
        return tasks.reduce((total, task) => total + (task.estimatedHours || 0), 0);
    };

    const getCompletedTasksCount = () => {
        return tasks.filter(task => task.status === 'COMPLETED').length;
    };

    return (
        <div className={`rounded-2xl border-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 text-slate-400 transition-all duration-300 w-full overflow-hidden shadow-lg hover:shadow-2xl ${getSprintStatusStyles(sprint.status)}`}>
            {/* Sprint Header */}
            <div className="p-4 border-b border-current/20">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
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
                                        <option value="PLANNING">Planning</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                    <input
                                        type="date"
                                        value={editingSprint.startDate.split('T')[0]}
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
                                        value={editingSprint.endDate.split('T')[0]}
                                        onChange={(e) => setEditingSprint({ ...editingSprint, endDate: e.target.value })}
                                        min={editingSprint.startDate.split('T')[0] || undefined}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{sprint.name}</h3>
                                <button
                                    onClick={() => onViewSprint(sprint)}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold flex items-center gap-1 group/btn mt-1"
                                    title="View sprint details"
                                >
                                    <span>View more</span>
                                    <svg className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    {/* Date Range */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold shadow-sm">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                                    </div>
                                    {/* Task Progress */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold shadow-sm">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                        {getCompletedTasksCount()}/{tasks.length} tasks
                                    </div>
                                    {/* Time Estimate */}
                                    {getTotalEstimatedHours() > 0 && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-semibold shadow-sm">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            {getTotalEstimatedHours()}h estimated
                                        </div>
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
                                        onClick={() => onAddTaskToSprint(sprint)}
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
                                        title="Save changes"
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
                            title={isExpanded ? "Collapse" : "Expand"}
                        >
                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Sprint Description when editing */}
                {isEditing && (
                    <textarea
                        value={editingSprint.description}
                        onChange={(e) => setEditingSprint({ ...editingSprint, description: e.target.value })}
                        className="w-full mt-3 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Sprint description"
                        rows="2"
                    />
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
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
                            {tasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    isAdmin={isAdmin}
                                    onUpdateTask={onUpdateTask}
                                    onDeleteTask={onDeleteTask}
                                    onViewTask={onViewTask}
                                    allMembers={allMembers}
                                    sprints={sprints}
                                />
                            ))}
                        </div>
                    )}
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
    onViewTask: PropTypes.func.isRequired,
    onViewSprint: PropTypes.func.isRequired,
    onAddTaskToSprint: PropTypes.func.isRequired,
    allMembers: PropTypes.array.isRequired,
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
const SprintManager = ({
    projectId,
    isAdmin,
    allMembers = [], // For normal mode
    tasks = [],
    onTaskUpdate,
    onTaskDelete,
    onTaskCreate,
    onRefreshTasks,
    onRefreshSprints,
    // Props for initialization
    sprints: initialSprints = [],
    refreshSprints,
    refreshTasks,
    onCreateSprint,
    onUpdateSprint,
    disableCreate = false
}) => {
    const [sprints, setSprints] = useState(initialSprints || []);
    const [loading, setLoading] = useState(true);
    const [showAddSprintModal, setShowAddSprintModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showDeleteSprintModal, setShowDeleteSprintModal] = useState(false);
    const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
    const [sprintToDelete, setSprintToDelete] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
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
    const [showTaskViewModal, setShowTaskViewModal] = useState(false);
    const [taskToView, setTaskToView] = useState(null);
    const [showSprintViewModal, setShowSprintViewModal] = useState(false);
    const [sprintToView, setSprintToView] = useState(null);
    const [targetSprintForNewTask, setTargetSprintForNewTask] = useState(null);

    // Use appropriate members array based on mode
    const membersToUse = allMembers;

    const loadData = useCallback(async () => {
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
    }, [projectId]);

    useEffect(() => {
        // Load initial data or use provided sprints
        if (initialSprints && initialSprints.length > 0) {
            setSprints(initialSprints);
            setLoading(false);
        } else {
            // Load data from API
            loadData();
        }
    }, [projectId, loadData]); // Removed initialSprints from dependencies to prevent loops

    const handleCreateSprint = async (e) => {
        e.preventDefault();
        if (disableCreate) {
            toast.info('Sprint creation is currently disabled', {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }
        if (!newSprint.name.trim() || !newSprint.startDate || !newSprint.endDate) return;

        setIsSubmitting(true);
        try {
            if (onCreateSprint) {
                // Use provided function
                onCreateSprint(newSprint);
                setNewSprint({ name: '', description: '', startDate: '', endDate: '' });
                setShowAddSprintModal(false);
            } else {
                // Make API call
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
                    toast.success('Sprint created successfully! ');
                } else {
                    const error = await response.json();
                    toast.error(error.error || 'Error creating sprint');
                }
            }
        } catch (error) {
            console.error('Error creating sprint: ', error);
            toast.error('Error creating sprint ');
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
            console.error('Error updating sprint: ', error);
            toast.error('Error updating sprint ');
            throw error;
        }
    };

    const handleDeleteSprint = async (sprintId) => {
        setSprintToDelete(sprints.find(s => s.id === sprintId));
        setShowDeleteSprintModal(true);
    };

    const handleConfirmDeleteSprint = async () => {
        if (!sprintToDelete) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/sprints/${sprintToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Delete sprint response status:', response.status);
            console.log('Delete sprint response ok:', response.ok);

            if (response.ok) {
                setSprints(sprints.filter(s => s.id !== sprintToDelete.id));

                // Notify parent component to refresh tasks so they appear in "No Sprint" section
                try {
                    if (onRefreshTasks && typeof onRefreshTasks === 'function') {
                        await onRefreshTasks();
                    }
                    if (onRefreshSprints && typeof onRefreshSprints === 'function') {
                        await onRefreshSprints();
                    }
                } catch (updateError) {
                    console.warn('Error refreshing tasks/sprints after sprint deletion:', updateError);
                    // Don't show error to user since sprint was successfully deleted
                }

                toast.success(`Sprint "${sprintToDelete.name}" was deleted. Tasks were moved to "No sprint". `, {
                    position: 'top-right',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                // Try to parse error response
                let errorMessage = 'Error eliminando sprint ';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch (parseError) {
                    console.warn('Could not parse error response: ', parseError);
                    if (response.status === 401) {
                        errorMessage = 'Not authorized to delete this sprint ';
                    } else if (response.status === 403) {
                        errorMessage = 'Forbidden - Only admins can delete sprints ';
                    } else if (response.status === 404) {
                        errorMessage = 'Sprint not found ';
                    } else {
                        errorMessage = `Server error: ${response.status} `;
                    }
                }

                console.error('Delete sprint API error - Status:', response.status, 'Message:', errorMessage);
                toast.error(errorMessage, {
                    position: 'top-right',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error('Error eliminando sprint (network/other):', error);
            toast.error(`Network error: ${error.message || 'Failed to delete sprint '}`, {
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

    const handleCancelDeleteSprint = () => {
        setShowDeleteSprintModal(false);
        setSprintToDelete(null);
    };

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
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setTaskToDelete(task);
            setShowDeleteTaskModal(true);
        }
    };

    const handleConfirmDeleteTask = async () => {
        if (!taskToDelete) return;

        try {
            const response = await fetch(`/api/projects/${projectId}/tasks/${taskToDelete.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Notify parent component to update shared state
                if (onTaskDelete && taskToDelete) {
                    onTaskDelete(taskToDelete.id);
                }
            } else {
                toast.error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Network error while deleting task');
        } finally {
            setShowDeleteTaskModal(false);
            setTaskToDelete(null);
        }
    };

    const handleViewTask = (task) => {
        setTaskToView(task);
        setShowTaskViewModal(true);
    };

    const handleViewSprint = (sprint) => {
        setSprintToView(sprint);
        setShowSprintViewModal(true);
    };

    const handleAddTaskToSprint = (sprint) => {
        setTargetSprintForNewTask(sprint);
        setShowAddTaskModal(true);
    };

    const handleCancelDeleteTask = () => {
        setShowDeleteTaskModal(false);
        setTaskToDelete(null);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (disableCreate) {
            toast.info('Task creation is disabled', {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }
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
                    sprintId: targetSprintForNewTask?.id || null,
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
        <div className="w-full mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-12 bg-background overflow-x-hidden min-w-0">
            <div className="space-y-6 sm:space-y-10 w-full mx-auto min-w-0">
                {/* Header */}
                <div className="bg-gradient-to-br from-white via-violet-50/30 to-purple-50/30 dark:from-gray-900 dark:via-violet-950/20 dark:to-purple-950/20 rounded-2xl shadow-xl border-2 border-violet-100 dark:border-violet-900/30 p-6 sm:p-8 lg:p-10 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-center space-y-4 sm:flex-row sm:items-center sm:justify-between sm:text-left sm:space-y-0 min-w-0">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Sprint Management</h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-2 text-base lg:text-lg font-medium">Organize and track your team's work efficiently</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    if (disableCreate) {
                                        toast.info('Task creation is disabled', {
                                            position: 'top-right',
                                            autoClose: 3000
                                        });
                                        return;
                                    }
                                    setShowAddTaskModal(true);
                                }}
                                className={`px-6 py-3.5 ${disableCreate ? 'bg-gray-400 cursor-default' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:via-purple-700 hover:to-violet-700 transform hover:scale-105 hover:shadow-2xl'} text-white rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center gap-2.5 min-h-[52px] touch-action-manipulation group`}
                            >
                                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <span className="hidden sm:inline text-base">New Task</span>
                                <span className="sm:hidden text-base">Task</span>
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddSprintModal(true);
                                }}
                                className={`px-6 py-3.5 ${disableCreate ? 'bg-gray-400 cursor-default' : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transform hover:scale-105 hover:shadow-2xl'} text-white rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center gap-2.5 min-h-[52px] touch-action-manipulation group`}
                            >
                                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="hidden sm:inline text-base">New Sprint</span>
                                <span className="sm:hidden text-base">Sprint</span>
                            </button>
                        </div>
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
                            onViewTask={handleViewTask}
                            onViewSprint={handleViewSprint}
                            onAddTaskToSprint={handleAddTaskToSprint}
                            allMembers={membersToUse}
                            sprints={sprints}
                            projectId={projectId}
                            onTaskCreate={onTaskCreate}
                        />
                    ))}

                    {/* Tasks without sprint */}
                    {getTasksWithoutSprint().length > 0 && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-lg">
                            <div className="p-5 border-b-2 border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                                        <span className="text-2xl">📋</span>
                                        <span>Tasks without Sprint</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
                                    {getTasksWithoutSprint().map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            isAdmin={isAdmin}
                                            onUpdateTask={handleUpdateTask}
                                            onDeleteTask={handleDeleteTask}
                                            onViewTask={handleViewTask}
                                            allMembers={membersToUse}
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
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-[9999] p-4 animate-in fade-in duration-300 overflow-y-auto">

                        <div className="glass-card shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden flex flex-col border border-white/10 relative">
                            {/* Danger Shimmer Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-shimmer bg-[length:200%_100%]"></div>

                            {/* Header */}
                            <div className="relative px-6 py-6 border-b border-white/5 bg-gradient-to-br from-red-500/10 via-background to-orange-500/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-500/20 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/10">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Delete Sprint</h2>
                                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">Irreversible Action</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCancelDeleteSprint}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                <p className="text-white/60 text-base leading-relaxed text-center">
                                    Are you sure you want to delete <span className="text-white font-bold">"{sprintToDelete.name}"</span>? All tasks will be moved to "No sprint".
                                </p>

                                {/* Actions */}
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleConfirmDeleteSprint}
                                        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-red-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Purging...' : 'Confirm Deletion'}
                                    </button>
                                    <button
                                        onClick={handleCancelDeleteSprint}
                                        className="py-2 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Cancel & Safe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Add Sprint Modal */}
                {showAddSprintModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-[9999] p-4 animate-in fade-in duration-300 overflow-y-auto">

                        <div className="glass-card shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden flex flex-col border border-white/10 relative">
                            {/* Shimmer Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer bg-[length:200%_100%]"></div>

                            {/* Header */}
                            <div className="relative px-6 py-6 border-b border-white/5 bg-gradient-to-br from-primary/10 via-background to-accent/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">New Sprint</h2>
                                        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">Configure Iteration Cycle</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowAddSprintModal(false);
                                            setNewSprint({ name: '', description: '', startDate: '', endDate: '' });
                                        }}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10"
                                        disabled={isSubmitting}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreateSprint} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Sprint Name</label>
                                    <input
                                        type="text"
                                        value={newSprint.name}
                                        onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-base font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                                        placeholder="e.g.: Sprint 1 - Core"
                                        required
                                        disabled={isSubmitting || disableCreate}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Description</label>
                                    <textarea
                                        value={newSprint.description}
                                        onChange={(e) => setNewSprint({ ...newSprint, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-base font-medium placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner resize-none min-h-[80px]"
                                        rows="2"
                                        placeholder="Optional objectives..."
                                        disabled={isSubmitting || disableCreate}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={newSprint.startDate}
                                            onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            required
                                            disabled={isSubmitting || disableCreate}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">End Date</label>
                                        <input
                                            type="date"
                                            value={newSprint.endDate}
                                            onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                                            min={newSprint.startDate}
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            required
                                            disabled={isSubmitting || disableCreate}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                                    <button
                                        type="submit"
                                        className="btn-gradient w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02]"
                                        disabled={isSubmitting || disableCreate || !newSprint.name.trim() || !newSprint.startDate || !newSprint.endDate}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            'Initialize Sprint'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddSprintModal(false)}
                                        className="py-2 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Abort Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                {/* Add Task Modal (for tasks without sprint) */}
                {showAddTaskModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-[9999] p-4 animate-in fade-in duration-300 overflow-y-auto">

                        <div className="glass-card shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden flex flex-col border border-white/10 relative">
                            {/* Shimmer Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer bg-[length:200%_100%]"></div>

                            {/* Header */}
                            <div className="relative px-6 py-6 border-b border-white/5 bg-gradient-to-br from-primary/10 via-background to-accent/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">New Task</h2>
                                        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">Initialize Project Action</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowAddTaskModal(false);
                                            setNewTask({ title: '', description: '', assigneeId: '', estimatedHours: '' });
                                        }}
                                        className="flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10"
                                        disabled={isSubmitting}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Title</label>
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-base font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                                        placeholder="Task designation..."
                                        required
                                        disabled={isSubmitting || disableCreate}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Description</label>
                                    <textarea
                                        value={newTask.description}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-base font-medium placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner resize-none min-h-[80px]"
                                        rows="2"
                                        placeholder="Operation details..."
                                        disabled={isSubmitting || disableCreate}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Assignee</label>
                                        <div className="relative">
                                            <select
                                                value={newTask.assigneeId}
                                                onChange={(e) => setNewTask(prev => ({ ...prev, assigneeId: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-3 text-white text-[11px] font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                disabled={isSubmitting || disableCreate}
                                            >
                                                <option value="" className="bg-background">Unassigned</option>
                                                {membersToUse.map((member) => (
                                                    <option key={member.userId} value={member.userId} className="bg-background">
                                                        {member.user.name.split(' ')[0]}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Est. Minutes</label>
                                        <input
                                            type="number"
                                            min="30"
                                            step="30"
                                            value={newTask.estimatedHours}
                                            onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                                            placeholder="30, 60..."
                                            required
                                            disabled={isSubmitting || disableCreate}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                                    <button
                                        type="submit"
                                        className="btn-gradient w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02]"
                                        disabled={isSubmitting || disableCreate}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            'Create Task'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddTaskModal(false)}
                                        className="py-2 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Abort
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
                            <div className="relative px-6 py-6 border-b border-white/5 bg-gradient-to-br from-red-500/10 via-background to-orange-500/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-500/20 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/10">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Delete Task</h2>
                                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">Irreversible Action</p>
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
                            <div className="p-6 space-y-6">
                                <p className="text-white/60 text-base leading-relaxed text-center">
                                    Are you sure you want to delete <span className="text-white font-bold">"{taskToDelete.title}"</span>? This operation cannot be undone.
                                </p>

                                {/* Actions */}
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleConfirmDeleteTask}
                                        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-red-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        Permanently Delete
                                    </button>
                                    <button
                                        onClick={handleCancelDeleteTask}
                                        className="py-2 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                    >
                                        Keep Task
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Task Details Modal (Moved to root to avoid transform issues) */}
                {showTaskViewModal && taskToView && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-[9999] p-4 animate-in fade-in duration-300 overflow-y-auto">

                        <div className="glass-card shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col border border-white/10 relative">
                            {/* Shimmer Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer bg-[length:200%_100%]"></div>

                            {/* Header */}
                            <div className="relative px-6 py-6 border-b border-white/5 bg-gradient-to-br from-primary/10 via-background to-accent/5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const statusBadge = getStatusBadge(taskToView.status);
                                                return (
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 ${statusBadge.color}`}>
                                                        {statusBadge.text}
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
                                        onClick={() => setShowTaskViewModal(false)}
                                        className="flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
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
                                                {sprints.find(s => s.id === taskToView.sprintId)?.name || 'Backlog'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignee */}
                                    <div className="space-y-2">
                                        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Assigned Operative</h3>
                                        <div className="flex items-center gap-3">
                                            {taskToView.assignee ? (
                                                <>
                                                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarColor(taskToView.assignee.id, taskToView.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(), membersToUse)} flex items-center justify-center text-[10px] font-black text-white border border-white/10`}>
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


                {/* Sprint Details Modal (Moved to root) */}
                {showSprintViewModal && sprintToView && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-[9999] p-4 animate-in fade-in duration-300 overflow-y-auto">

                        <div className="glass-card shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col border border-white/10 relative">
                            {/* Shimmer Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer bg-[length:200%_100%]"></div>

                            {/* Header */}
                            <div className="relative px-6 py-6 border-b border-white/5 bg-gradient-to-br from-primary/10 via-background to-accent/5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 bg-white/5 text-white/60">
                                                {sprintToView.status}
                                            </span>
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                                {formatDate(sprintToView.startDate)} — {formatDate(sprintToView.endDate)}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight">{sprintToView.name}</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowSprintViewModal(false)}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {/* Description */}
                                <div className="space-y-2">
                                    <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Iteration Strategy</h3>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-white/70 leading-relaxed text-sm whitespace-pre-wrap">
                                            {sprintToView.description || <span className="italic text-white/20 uppercase tracking-widest text-[10px]">No strategic objectives documented</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* Analytics */}
                                <div className="space-y-2">
                                    <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Sprint Metrics</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                                            <div className="text-2xl font-black text-white">
                                                {(() => {
                                                    const sprintTasks = tasks.filter(t => t.sprintId === sprintToView.id);
                                                    const completed = sprintTasks.filter(t => t.status === 'COMPLETED').length;
                                                    return `${completed}/${sprintTasks.length}`;
                                                })()}
                                            </div>
                                            <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Resolution</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                                            <div className="text-2xl font-black text-white">
                                                {(() => {
                                                    const sprintTasks = tasks.filter(t => t.sprintId === sprintToView.id);
                                                    return sprintTasks.reduce((acc, t) => acc + (parseFloat(t.estimatedHours) || 0), 0);
                                                })()}m
                                            </div>
                                            <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Velocity</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
    onTaskCreate: PropTypes.func,
    onRefreshTasks: PropTypes.func,
    onRefreshSprints: PropTypes.func
};

export default SprintManager;
