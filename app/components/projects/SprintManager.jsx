'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

// Componente para mostrar una tarjeta de tarea con información del sprint
const TaskCard = ({ task, isAdmin, onUpdateTask, onDeleteTask, allMembers = [], sprints = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingTask, setEditingTask] = useState({
        title: task.title,
        description: task.description || '',
        assigneeId: task.assignee?.id || '',
        sprintId: task.sprint?.id || '',
        estimatedHours: task.estimatedHours || ''
    });

    const getStatusStyles = (status) => {
        const styles = {
            PENDING: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
            IN_PROGRESS: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
            COMPLETED: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
            CANCELLED: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
        };
        return styles[status] || styles.PENDING;
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
            toast.success('¡Tarea actualizada exitosamente!');
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Error al actualizar la tarea');
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
        if (hours < 1) return `${Math.round(hours * 60)}min`;
        if (hours >= 8) return `${Math.round(hours / 8)}d`;
        return `${hours}h`;
    };

    return (
        <div className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md group ${getStatusStyles(task.status)}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Título de la tarea"
                        />
                    ) : (
                        <h3 className="font-semibold text-sm mb-1">{task.title}</h3>
                    )}
                </div>
                
                {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                                    title="Editar tarea"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDeleteTask(task.id)}
                                    className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors text-red-600 dark:text-red-400"
                                    title="Eliminar tarea"
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
                                    title="Guardar cambios"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="p-1.5 hover:bg-gray-500/20 rounded-md transition-colors"
                                    title="Cancelar"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Description */}
            {isEditing ? (
                <textarea
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-3"
                    placeholder="Descripción de la tarea"
                    rows="2"
                />
            ) : (
                task.description && (
                    <p className="text-sm opacity-80 mb-3 line-clamp-2">{task.description}</p>
                )
            )}

            {/* Sprint and Time Info */}
            <div className="flex items-center justify-between mb-3 text-xs">
                {isEditing ? (
                    <div className="flex gap-2 w-full">
                        <select
                            value={editingTask.sprintId}
                            onChange={(e) => setEditingTask({...editingTask, sprintId: e.target.value})}
                            className="flex-1 p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">Sin sprint</option>
                            {sprints.filter(s => s.status !== 'COMPLETED').map(sprint => (
                                <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={editingTask.estimatedHours}
                            onChange={(e) => setEditingTask({...editingTask, estimatedHours: e.target.value})}
                            className="w-20 p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="0h"
                            min="0"
                            max="1000"
                            step="0.5"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        {task.sprint && (
                            <span className="bg-white/20 px-2 py-1 rounded-full font-medium">
                                🚀 {task.sprint.name}
                            </span>
                        )}
                        {task.estimatedHours && (
                            <span className="bg-white/20 px-2 py-1 rounded-full font-medium">
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
                    onChange={(e) => setEditingTask({...editingTask, assigneeId: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                    <option value="">Sin asignar</option>
                    {allMembers.map(member => (
                        <option key={member.userId} value={member.userId}>
                            {member.user?.name || 'Usuario desconocido'}
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

// Componente para mostrar un sprint con sus tareas
const SprintCard = ({ sprint, tasks, isAdmin, onUpdateTask, onDeleteTask, onUpdateSprint, onDeleteSprint, allMembers }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingSprint, setEditingSprint] = useState({
        name: sprint.name,
        description: sprint.description || '',
        startDate: sprint.startDate.split('T')[0],
        endDate: sprint.endDate.split('T')[0],
        status: sprint.status
    });

    const getSprintStatusStyles = (status) => {
        const styles = {
            PLANNING: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200',
            ACTIVE: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-200',
            COMPLETED: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-200',
            CANCELLED: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-200'
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
            toast.success('¡Sprint actualizado exitosamente!');
        } catch (error) {
            console.error('Error updating sprint:', error);
            toast.error('Error al actualizar el sprint');
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
        <div className={`rounded-xl border-2 transition-all duration-200 ${getSprintStatusStyles(sprint.status)}`}>
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
                                    onChange={(e) => setEditingSprint({...editingSprint, name: e.target.value})}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Nombre del sprint"
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={editingSprint.status}
                                        onChange={(e) => setEditingSprint({...editingSprint, status: e.target.value})}
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
                                        onChange={(e) => setEditingSprint({...editingSprint, startDate: e.target.value})}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="date"
                                        value={editingSprint.endDate}
                                        onChange={(e) => setEditingSprint({...editingSprint, endDate: e.target.value})}
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
                        {isAdmin && (
                            <div className="flex gap-1">
                                {!isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="p-2 hover:bg-white/20 rounded-md transition-colors"
                                            title="Editar sprint"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDeleteSprint(sprint.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-md transition-colors text-red-600 dark:text-red-400"
                                            title="Eliminar sprint"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
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
                                            title="Cancelar"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                        
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
                        onChange={(e) => setEditingSprint({...editingSprint, description: e.target.value})}
                        className="w-full mt-3 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Descripción del sprint"
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
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>No hay tareas en este sprint</span>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
    allMembers: PropTypes.array.isRequired
};

// Componente principal para gestión de sprints
const SprintManager = ({ projectId, isAdmin, allMembers, tasks = [], onTaskUpdate, onTaskDelete, onTaskCreate }) => {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddSprintModal, setShowAddSprintModal] = useState(false);
    const [newSprint, setNewSprint] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
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
            toast.error('Error al cargar los datos');
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
                toast.success('¡Sprint creado exitosamente!');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error al crear el sprint');
            }
        } catch (error) {
            console.error('Error creating sprint:', error);
            toast.error('Error al crear el sprint');
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
            throw error;
        }
    };

    const handleDeleteSprint = async (sprintId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este sprint? Las tareas se moverán a "Sin sprint".')) {
            return;
        }

        try {
            const response = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setSprints(sprints.filter(s => s.id !== sprintId));
                // Actualizar tareas para remover el sprint eliminado
                setTasks(tasks.map(task => 
                    task.sprintId === sprintId ? { ...task, sprint: null, sprintId: null } : task
                ));
                toast.success('¡Sprint eliminado exitosamente!');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error al eliminar el sprint');
            }
        } catch (error) {
            console.error('Error deleting sprint:', error);
            toast.error('Error al eliminar el sprint');
        }
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
                toast.success('¡Tarea eliminada exitosamente!');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error al eliminar la tarea');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Error al eliminar la tarea');
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🚀 Gestión de Sprints</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Organiza las tareas por sprints y gestiona el tiempo</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAddSprintModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nuevo Sprint
                    </button>
                )}
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
                    />
                ))}

                {/* Tasks without sprint */}
                {getTasksWithoutSprint().length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                📋 Tareas sin Sprint
                                <span className="text-sm font-normal">({getTasksWithoutSprint().length})</span>
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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

            {/* Empty state */}
            {sprints.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No hay sprints creados aún
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Crea tu primer sprint para organizar las tareas por tiempo
                    </p>
                    {isAdmin && (
                        <button
                            onClick={() => setShowAddSprintModal(true)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            Crear Primer Sprint
                        </button>
                    )}
                </div>
            )}

            {/* Add Sprint Modal */}
            {showAddSprintModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    🚀 Nuevo Sprint
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddSprintModal(false);
                                        setNewSprint({ name: '', description: '', startDate: '', endDate: '' });
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleCreateSprint} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre del Sprint *
                                </label>
                                <input
                                    type="text"
                                    value={newSprint.name}
                                    onChange={(e) => setNewSprint({...newSprint, name: e.target.value})}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                    placeholder="ej: Sprint 1 - Funcionalidades básicas"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={newSprint.description}
                                    onChange={(e) => setNewSprint({...newSprint, description: e.target.value})}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors resize-none"
                                    rows="3"
                                    placeholder="Descripción opcional del sprint..."
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Fecha de Inicio *
                                    </label>
                                    <input
                                        type="date"
                                        value={newSprint.startDate}
                                        onChange={(e) => setNewSprint({...newSprint, startDate: e.target.value})}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Fecha de Fin *
                                    </label>
                                    <input
                                        type="date"
                                        value={newSprint.endDate}
                                        onChange={(e) => setNewSprint({...newSprint, endDate: e.target.value})}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddSprintModal(false);
                                        setNewSprint({ name: '', description: '', startDate: '', endDate: '' });
                                    }}
                                    className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={`px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 ${
                                        isSubmitting
                                            ? 'bg-blue-400 text-white cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                                    }`}
                                    disabled={isSubmitting || !newSprint.name.trim() || !newSprint.startDate || !newSprint.endDate}
                                >
                                    {isSubmitting ? 'Creando...' : 'Crear Sprint'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
