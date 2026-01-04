'use client';
import { useState, useEffect, useCallback } from 'react';
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
            toast.success('Task updated successfully !');
        } catch (error) {
            console.error('Error updating task: ', error);
            toast.error('Error updating task ');
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

    // Helper: consistent avatar color when initials collide across members
    const getAvatarColor = (userId, initials, allMembersList) => {
        const colors = [
            'from-blue-500 to-purple-600',
            'from-green-500 to-teal-600',
            'from-pink-500 to-rose-600',
            'from-orange-500 to-red-600',
            'from-indigo-500 to-blue-600',
            'from-purple-500 to-pink-600',
            'from-teal-500 to-cyan-600',
            'from-yellow-500 to-orange-600',
            'from-emerald-500 to-green-600',
            'from-violet-500 to-purple-600',
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

    return (
        <div className={`p-5 sm:p-6 lg:p-7 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group w-full break-words relative min-h-[200px] min-w-0 backdrop-blur-sm ${getStatusStyles(task.status)}`}>
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
                            <h3 className="font-bold text-lg lg:text-xl mb-2 break-words overflow-hidden bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
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
                    <p className="text-sm opacity-75 mb-3 line-clamp-2 leading-relaxed">
                        {isDescriptionLong ? truncateText(task.description, 100) : task.description}
                    </p>
                )
            )}

            {/* Sprint and Time Info Section */}
            <div className="mb-4">
                {isEditing ? (
                    <div className="space-y-4 w-full">
                        {/* Meta Fields Group */}
                        <div className="space-y-4">
                            {/* Sprint Selection */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Sprint Context</label>
                                <select
                                    value={editingTask.sprintId}
                                    onChange={(e) => setEditingTask({ ...editingTask, sprintId: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm"
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
                                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm"
                                        placeholder="0.0"
                                        min="0.5"
                                        max="1000"
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
                                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm"
                                >
                                    <option value="">Unassigned</option>
                                    {allMembers.map(member => (
                                        <option key={member.userId} value={member.userId}>
                                            {member.user?.name || 'Unknown user'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Badge */}
                        {(() => {
                            const statusBadge = getStatusBadge(task.status);
                            return (
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-md ${statusBadge.color}`}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        {task.status === 'PENDING' && (
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        )}
                                        {task.status === 'IN_PROGRESS' && (
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                        )}
                                        {task.status === 'COMPLETED' && (
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        )}
                                    </svg>
                                    {statusBadge.text}
                                </div>
                            );
                        })()}

                        {/* Sprint Badge */}
                        {task.sprint && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold text-xs shadow-md">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {task.sprint.name}
                            </div>
                        )}

                        {/* Time Estimate Badge */}
                        {task.estimatedHours && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold text-xs shadow-md">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {formatEstimatedTime(task.estimatedHours)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Assignee Card (View Mode Only) */}
            {!isEditing && task.assignee && (
                <div className="flex items-center gap-3 mt-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-900/80 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className={`w-11 h-11 flex-shrink-0 bg-gradient-to-br ${getAvatarColor(task.assignee.id, task.assignee.name?.charAt(0)?.toUpperCase(), allMembers)} rounded-full flex items-center justify-center text-base font-bold text-white shadow-lg ring-2 ring-white/30 aspect-square`}>
                        {task.assignee.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">Assigned to</div>
                        <div className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">{task.assignee.name}</div>
                    </div>
                </div>
            )}

            {/* Action buttons positioned at bottom right */}
            {!isEditing && (
                <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 min-h-[36px] min-w-[36px] flex items-center justify-center touch-action-manipulation shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700"
                        title="Edit task"
                    >
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 text-red-600 dark:text-red-400 min-h-[36px] min-w-[36px] flex items-center justify-center touch-action-manipulation shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700"
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

            {/* Premium Full-Screen View Task Modal */}
            {
                showViewModal && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300"
                        onClick={() => setShowViewModal(false)}
                    >
                        <div
                            className="glass-card shadow-2xl rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with Gradient Background */}
                            <div className="relative px-8 py-8 border-b border-white/5 bg-gradient-to-br from-primary/20 via-background to-accent/10">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer bg-[length:200%_100%]"></div>
                                <div className="flex items-start justify-between gap-6 relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            {(() => {
                                                const statusBadge = getStatusBadge(task.status);
                                                return (
                                                    <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/10 ${statusBadge.color}`}>
                                                        <span className="mr-2">{statusBadge.icon}</span>
                                                        {statusBadge.text}
                                                    </span>
                                                );
                                            })()}
                                            {task.estimatedHours && (
                                                <span className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white/5 text-white/70 border border-white/10 shadow-lg backdrop-blur-md">
                                                    ⏱️ {formatEstimatedTime(task.estimatedHours)}
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight break-words tracking-tight">
                                            {task.title}
                                        </h1>
                                    </div>
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10 hover-lift"
                                        title="Close"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content area - Scrollable */}
                            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar bg-transparent">
                                {/* Description Section */}
                                {task.description ? (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                            </svg>
                                            Description
                                        </h3>
                                        <div className="text-white/80 leading-relaxed text-lg whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                                            {task.description}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        <p className="text-white/40 italic text-sm">No description provided</p>
                                    </div>
                                )}

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Assignee Card */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Assignee
                                        </h3>
                                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors shadow-lg">
                                            {task.assignee ? (
                                                <>
                                                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(task.assignee.id, task.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(), allMembers)} flex items-center justify-center text-white text-xl font-black shadow-xl ring-2 ring-white/10`}>
                                                        {task.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xl font-bold text-white truncate">{task.assignee.name}</div>
                                                        <div className="text-sm text-white/50 truncate flex items-center gap-1.5 mt-0.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            {task.assignee.email || 'No email available'}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-4 w-full text-white/40 italic">
                                                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-xl">?</div>
                                                    <span>Unassigned</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sprint Card */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Sprint Context
                                        </h3>
                                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors shadow-lg">
                                            {task.sprint ? (
                                                <>
                                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl shadow-xl ring-2 ring-white/10 animate-pulse-slow">
                                                        🚀
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xl font-bold text-white truncate">{task.sprint.name}</div>
                                                        <div className="text-sm text-white/50 truncate flex items-center gap-1.5 mt-0.5 font-medium">
                                                            Part of current timeline
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-4 w-full text-white/40 italic">
                                                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-xl">📋</div>
                                                    <span>Not associated with any sprint</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-6 border-t border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between gap-4">
                                <div className="text-xs text-white/30 font-medium">
                                    Last updated: Just now
                                </div>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="btn-gradient px-8 py-3 text-sm flex items-center gap-2"
                                >
                                    <span>Close Details</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
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
            toast.success('Task created successfully! ', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error creating task: ', error);
            toast.error('Error creating task ', {
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
                                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{sprint.name}</h3>
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
                            <span>No tasks in this sprint</span>
                        </div>
                    ) : (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
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
    members = [],
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

    // Use appropriate members array based on mode
    const membersToUse = members;

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

    const confirmDeleteSprint = async () => {
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
                    onTaskDelete(taskToDelete);
                }
                toast.success('Task deleted successfully!');
                setShowDeleteTaskModal(false);
                setTaskToDelete(null);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error deleting task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Error deleting task');
        }
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
        <div className="w-full mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8 xl:px-10 bg-background overflow-x-hidden min-w-0">
            <div className="space-y-6 sm:space-y-10 w-full max-w-full sm:max-w-[1400px] 2xl:max-w-[1600px] mx-auto min-w-0">
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
                            allMembers={membersToUse}
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
                                        <span className="text-sm font-semibold bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">({getTasksWithoutSprint().length})</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                    {getTasksWithoutSprint().map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            isAdmin={isAdmin}
                                            onUpdateTask={handleUpdateTask}
                                            onDeleteTask={handleDeleteTask}
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
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-card-foreground">
                                            Delete sprint
                                        </h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
                                            This action cannot be undone
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="mb-6">
                                    <p className="text-gray-700 dark:text-gray-400 text-base leading-relaxed">
                                        Are you sure you want to delete the sprint{' '}
                                        <span className="font-semibold text-card-foreground break-words">"{sprintToDelete.name}"</span>?
                                        {' '}Tasks will be moved to "No sprint".
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2">
                                    <button
                                        onClick={cancelDeleteSprint}
                                        className="w-full sm:w-auto px-6 py-3 sm:py-2.5 text-muted-foreground hover:text-foreground font-medium border border-border rounded-xl hover:bg-muted transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-action-manipulation flex items-center justify-center"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteSprint}
                                        className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-action-manipulation flex items-center justify-center gap-2"
                                        disabled={isSubmitting}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>{isSubmitting ? 'Deleting...' : 'Delete sprint'}</span>
                                    </button>
                                </div>
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
                                        disabled={isSubmitting || disableCreate}
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
                                        disabled={isSubmitting || disableCreate}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            disabled={isSubmitting || disableCreate}
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
                                            disabled={isSubmitting || disableCreate}
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
                                        className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg font-medium shadow-sm transition-all duration-200 text-sm min-h-[44px] sm:min-h-[36px] touch-action-manipulation flex items-center justify-center gap-2 ${isSubmitting || disableCreate
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-violet-500 text-white '
                                            }`}
                                        disabled={isSubmitting || disableCreate || !newSprint.name.trim() || !newSprint.startDate || !newSprint.endDate}
                                    >
                                        {isSubmitting ? 'Creating...' : disableCreate ? 'Creation Disabled' : 'Create Sprint'}
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
                                        disabled={isSubmitting || disableCreate}
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
                                        disabled={isSubmitting || disableCreate}
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
                                            disabled={isSubmitting || disableCreate}
                                        >
                                            <option value="">unasigned</option>
                                            {!Array.isArray(membersToUse) || membersToUse.length === 0 ? (
                                                <option disabled>Loading members...</option>
                                            ) : (
                                                membersToUse.map((member) => (
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
                                            disabled={isSubmitting || disableCreate}
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
                                        className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg font-medium shadow-sm transition-all duration-200 text-sm min-h-[44px] sm:min-h-[36px] touch-action-manipulation flex items-center justify-center gap-2 ${isSubmitting || disableCreate
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-violet-500 text-white '
                                            }`}
                                        disabled={isSubmitting || disableCreate}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Creating...
                                            </span>
                                        ) : disableCreate ? (
                                            'Creation Disabled'
                                        ) : (
                                            'Create Task'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Task deletion confirmation modal */}
                {showDeleteTaskModal && taskToDelete && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-card-foreground">
                                            Delete task
                                        </h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
                                            This action cannot be undone
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="mb-6">
                                    <p className="text-gray-700 dark:text-gray-400 text-base leading-relaxed">
                                        Are you sure you want to delete the task{' '}
                                        <span className="font-semibold text-card-foreground break-words">"{taskToDelete.title}"</span>?
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2">
                                    <button
                                        onClick={handleCancelDeleteTask}
                                        className="w-full sm:w-auto px-6 py-3 sm:py-2.5 text-muted-foreground hover:text-foreground font-medium border border-border rounded-xl hover:bg-muted transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-action-manipulation flex items-center justify-center"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmDeleteTask}
                                        className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-action-manipulation flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Delete task</span>
                                    </button>
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
