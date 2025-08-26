import { useState, useEffect } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, closestCorners, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const TaskCard = ({ task, isAdmin, allMembers = [], onDeleteTask }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
        id: task.id.toString(),
        disabled: !isAdmin,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: isAdmin ? 'grab' : 'default',
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    // Function to get avatar color based on initials conflicts
    const getAvatarColor = (userId, initials, allMembers) => {
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
            'from-violet-500 to-purple-600'
        ];

        // Find all members with the same initials
        const membersWithSameInitials = allMembers.filter(member => {
            const memberInitials = member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return memberInitials === initials;
        });

        if (membersWithSameInitials.length === 1) {
            // If only one member has these initials, use the default blue-purple
            return colors[0];
        }

        // If multiple members have the same initials, assign different colors
        const memberIndex = membersWithSameInitials.findIndex(member => member.userId === userId);
        return colors[memberIndex % colors.length];
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isAdmin ? attributes : {})}
            {...(isAdmin ? listeners : {})}
            className={`group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 relative overflow-hidden ${isAdmin
                    ? 'cursor-grab active:cursor-grabbing hover:scale-[1.02] active:scale-105 active:shadow-xl'
                    : 'cursor-default'
                } ${isDragging ? 'rotate-2 shadow-xl border-violet-400 dark:border-violet-500 scale-105 z-50' : ''}`}
        >
            {/* Delete button */}
            {isAdmin && onDeleteTask && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500 hover:bg-red-600 text-white rounded-lg w-7 h-7 flex items-center justify-center text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-110"
                    title="Eliminar tarea"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            <div className="p-5">
                {/* Task Title */}
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-2 pr-8 uppercase">{task.title}</h4>

                {/* Task Description */}
                {task.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {/* Task Assignee */}
                {task.assignee && (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        {(() => {
                            const initials = task.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            const avatarColor = getAvatarColor(task.assignee.id, initials, allMembers);
                            return (
                                <div className={`w-8 h-8 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-gray-700`}>
                                    {initials}
                                </div>
                            );
                        })()}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.assignee.name}</div>
                            {task.assignee.email && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.assignee.email}</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Task Status Badge */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        {(() => {
                            const statusConfig = {
                                'PENDING': {
                                    color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
                                    icon: '⏳',
                                    text: 'Pending'
                                },
                                'IN_PROGRESS': {
                                    color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
                                    icon: '⚡',
                                    text: 'In Progress'
                                },
                                'COMPLETED': {
                                    color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
                                    icon: '✅',
                                    text: 'Completed'
                                }
                            };
                            const config = statusConfig[task.status] || { color: 'text-gray-600 bg-gray-100', icon: '❓', text: task.status };

                            return (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                    <span className="text-sm">{config.icon}</span>
                                    {config.text}
                                </span>
                            );
                        })()}
                    </div>

                    {/* Drag indicator for admins */}
                    {isAdmin && (
                        <div className="opacity-30 group-hover:opacity-70 transition-opacity">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 19v-2h2v2H7zM11 19v-2h2v2h-2zM15 19v-2h2v2h-2zM7 15v-2h2v2H7zM11 15v-2h2v2h-2zM15 15v-2h2v2h-2zM7 11V9h2v2H7zM11 11V9h2v2h-2zM15 11V9h2v2h-2z" />
                            </svg>
                        </div>
                    )}
                </div>
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
        assignee: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            email: PropTypes.string
        })
    }).isRequired,
    isAdmin: PropTypes.bool.isRequired,
    allMembers: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.string.isRequired,
            user: PropTypes.shape({
                name: PropTypes.string.isRequired
            }).isRequired
        })
    ),
    onDeleteTask: PropTypes.func
};

const TaskRow = ({ title, tasks, isAdmin, status, allMembers = [], onDeleteTask }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    // Define row styles based on status
    const getRowStyles = (status, isOver) => {
        const baseStyles = "w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all duration-200";

        if (isOver) {
            switch (status) {
                case 'PENDING':
                    return `${baseStyles} border-amber-300 bg-amber-50 dark:bg-amber-900/20 shadow-lg ring-2 ring-amber-200`;
                case 'IN_PROGRESS':
                    return `${baseStyles} border-blue-300 bg-blue-50 dark:bg-blue-900/20 shadow-lg ring-2 ring-blue-200`;
                case 'COMPLETED':
                    return `${baseStyles} border-green-300 bg-green-50 dark:bg-green-900/20 shadow-lg ring-2 ring-green-200`;
                default:
                    return `${baseStyles} border-gray-300 bg-gray-50 dark:bg-gray-700/20`;
            }
        }

        switch (status) {
            case 'PENDING':
                return `${baseStyles} border-amber-200 dark:border-amber-800 hover:shadow-md`;
            case 'IN_PROGRESS':
                return `${baseStyles} border-blue-200 dark:border-blue-800 hover:shadow-md`;
            case 'COMPLETED':
                return `${baseStyles} border-green-200 dark:border-green-800 hover:shadow-md`;
            default:
                return `${baseStyles} border-gray-200 dark:border-gray-700 hover:shadow-md`;
        }
    };

    const getHeaderStyles = (status) => {
        switch (status) {
            case 'PENDING':
                return 'text-amber-700 dark:text-amber-400';
            case 'IN_PROGRESS':
                return 'text-blue-700 dark:text-blue-400';
            case 'COMPLETED':
                return 'text-green-700 dark:text-green-400';
            default:
                return 'text-gray-700 dark:text-gray-400';
        }
    };

    const getBadgeStyles = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div
            ref={setNodeRef}
            className={getRowStyles(status, isOver)}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${getHeaderStyles(status)}`}>{title}</h3>
                    <span className={`${getBadgeStyles(status)} px-3 py-1 rounded-full text-sm font-medium`}>
                        {tasks.length}
                    </span>
                </div>

                {/* Tasks Container - Horizontal Scroll */}
                <div className="relative">
                    {tasks.length === 0 ? (
                        <div className={`text-center py-12 border-2 border-dashed rounded-xl transition-all duration-200 ${isOver
                                ? 'border-current text-current bg-current/5'
                                : 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700'
                            }`}>
                            {isOver ? (
                                <div className="flex flex-col items-center gap-2">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                    </svg>
                                    <span className="font-medium">Suelta la tarea aquí</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span>Sin tareas</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                            {tasks.filter(task => task && task.id).map((task) => (
                                <div key={task.id} className="flex-shrink-0 w-80">
                                    <TaskCard
                                        task={task}
                                        isAdmin={isAdmin}
                                        allMembers={allMembers}
                                        onDeleteTask={onDeleteTask}
                                    />
                                </div>
                            ))}

                            {/* Drop zone indicator when dragging */}
                            {isOver && tasks.length > 0 && (
                                <div className="flex-shrink-0 w-80 h-full flex items-center justify-center border-2 border-dashed border-current rounded-xl bg-current/5 text-current">
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span className="font-medium text-sm">Soltar aquí</span>
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
    allMembers: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.string.isRequired,
            user: PropTypes.shape({
                name: PropTypes.string.isRequired
            }).isRequired
        })
    ),
    onDeleteTask: PropTypes.func
};

const TaskBoard = ({ projectId, initialTasks, isAdmin, onTaskUpdate, onTaskDelete, onTaskCreate }) => {
    const [tasks, setTasks] = useState(initialTasks || []);
    const [activeId, setActiveId] = useState(null);
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
                    status: 'PENDING'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const createdTask = await response.json();
            setTasks(prevTasks => [...prevTasks, createdTask]);

            // Notify parent component
            if (onTaskCreate) {
                onTaskCreate(createdTask);
            }

            setShowAddTaskModal(false);
            setNewTask({ title: '', description: '', assigneeId: '' });

            // Mostrar notificación de éxito
            toast.success('¡Tarea creada exitosamente!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error creating task:', error);

            // Mostrar notificación de error
            toast.error('Error al crear la tarea', {
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

    const handleDeleteTask = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        setTaskToDelete(task);
        setShowDeleteTaskModal(true);
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
                throw new Error(errorData.error || 'Error al eliminar la tarea');
            }

            // Remover la tarea del estado local
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));

            // Notify parent component
            if (onTaskDelete) {
                onTaskDelete(taskToDelete);
            }

            // Mostrar notificación de éxito
            toast.success('¡Tarea eliminada exitosamente!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            console.log('Tarea eliminada exitosamente:', taskToDelete.id);
        } catch (error) {
            console.error('Error eliminando tarea:', error);

            // Mostrar notificación de error
            toast.error(error.message || 'Error al eliminar la tarea', {
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
    };

    const handleCancelDeleteTask = () => {
        setShowDeleteTaskModal(false);
        setTaskToDelete(null);
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
                {/* Left: Title */}
                <div className="mb-4 sm:mb-0">
                    <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Tablero de Tareas</h1>
                </div>

                {/* Right: Actions */}
                <div className="grid grid-flow-row sm:auto-row-max justify-start sm:justify-end gap-2">


                    {/* Add Task button */}
                    {isAdmin && (
                        <button
                            onClick={() => setShowAddTaskModal(true)}
                            className="btn bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 px-4 py-2 rounded-lg font-medium shadow-sm"
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                New Task
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Project Members Collapsible Section */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700/60 pb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4">
                        {members.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                {isLoadingMembers ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Cargando miembros...</span>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>No hay miembros en este proyecto</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {Array.isArray(members) && members.map((member) => {
                                    const initials = member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                                    // Function to get avatar color based on initials conflicts
                                    const getAvatarColor = (userId, initials, allMembers) => {
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

                                        // Find all members with the same initials
                                        const membersWithSameInitials = allMembers.filter(m => {
                                            const memberInitials = m.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                            return memberInitials === initials;
                                        });

                                        if (membersWithSameInitials.length === 1) {
                                            return colors[0];
                                        }

                                        const memberIndex = membersWithSameInitials.findIndex(m => m.userId === userId);
                                        return colors[memberIndex % colors.length];
                                    };

                                    const avatarColor = getAvatarColor(member.userId, initials, members);

                                    return (
                                        <div
                                            key={member.userId}
                                            className="group flex items-center bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-sm"
                                        >
                                            <div className={`w-10 h-10 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow-sm ring-2 ring-white dark:ring-gray-800`}>
                                                {initials}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{member.user.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {member.role === 'ADMIN' ? (
                                                        <span className="inline-flex items-center gap-1">
                                                            <svg className="w-3 h-3 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        'Miembro'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Cards - Kanban Board en Filas */}
                <div className="space-y-6">
                    {/* {process.env.NODE_ENV === 'development' && (
                        <div className="fixed top-16 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-xs border z-50">
                            <div className="font-semibold text-gray-700 dark:text-gray-300">Debug Info:</div>
                            <div className="text-gray-600 dark:text-gray-400">Total tasks: {tasks.length}</div>
                        </div>
                    )} */}

                    {/* Pending Row */}
                    <TaskRow
                        title="📋 To Do's"
                        status="PENDING"
                        tasks={tasks.filter(task => task.status === 'PENDING')}
                        isAdmin={isAdmin}
                        allMembers={members}
                        onDeleteTask={handleDeleteTask}
                    />

                    {/* In Progress Row */}
                    <TaskRow
                        title="⚡ In Progress"
                        status="IN_PROGRESS"
                        tasks={tasks.filter(task => task.status === 'IN_PROGRESS')}
                        isAdmin={isAdmin}
                        allMembers={members}
                        onDeleteTask={handleDeleteTask}
                    />

                    {/* Completed Row */}
                    <TaskRow
                        title="✅ Completed"
                        status="COMPLETED"
                        tasks={tasks.filter(task => task.status === 'COMPLETED')}
                        isAdmin={isAdmin}
                        allMembers={members}
                        onDeleteTask={handleDeleteTask}
                    />
                </div>
            </DndContext>

            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    Nueva Tarea
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        setNewTask({ title: '', description: '', assigneeId: '' });
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreateTask} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Título de la tarea
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                    placeholder="Ingresa el título de la tarea..."
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    id="description"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors resize-none"
                                    rows="3"
                                    placeholder="Describe los detalles de la tarea..."
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="assignee" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Asignar a
                                </label>
                                <select
                                    id="assignee"
                                    value={newTask.assigneeId}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, assigneeId: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <option value="">Sin asignar</option>
                                    {!Array.isArray(members) || members.length === 0 ? (
                                        <option disabled>Cargando miembros...</option>
                                    ) : (
                                        members.map((member) => (
                                            <option key={member.userId} value={member.userId}>
                                                {member.user.name} ({member.role === 'ADMIN' ? 'Admin' : 'Miembro'})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        setNewTask({ title: '', description: '', assigneeId: '' });
                                    }}
                                    className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={`px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 ${isSubmitting
                                            ? 'bg-violet-400 text-white cursor-not-allowed'
                                            : 'bg-violet-500 hover:bg-violet-600 text-white hover:shadow-md'
                                        }`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creando...
                                        </span>
                                    ) : (
                                        'Crear Tarea'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar tarea */}
            {showDeleteTaskModal && taskToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        Eliminar tarea
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Esta acción no se puede deshacer
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                                    ¿Estás seguro de que quieres eliminar la tarea{' '}
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">"{taskToDelete.title}"</span>?
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleCancelDeleteTask}
                                    className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDeleteTask}
                                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    Eliminar tarea
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
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
    onTaskUpdate: PropTypes.func,
    onTaskDelete: PropTypes.func,
    onTaskCreate: PropTypes.func
};

export default TaskBoard;
