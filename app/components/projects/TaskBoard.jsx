import { useState, useEffect } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, closestCorners, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const TaskCard = ({ task, isAdmin, currentUserId, allMembers = [], sprints = [], onDeleteTask, onUpdateTask, onViewTask }) => {
    const canDrag = isAdmin || (task?.assignee?.id && task.assignee.id === currentUserId);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
        id: task.id.toString(),
        disabled: !canDrag,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: canDrag ? 'grab' : 'default',
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
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

        const membersWithSameInitials = allMembersList.filter(member => {
            const memberInitials = member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return memberInitials === initials;
        });

        if (membersWithSameInitials.length === 1) return colors[0];

        const memberIndex = membersWithSameInitials.findIndex(member => member.userId === userId);
        return colors[memberIndex % colors.length];
    };

    const assigneeName = task.assignee?.name || null;
    const assigneeInitials = assigneeName
        ? assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : null;

    // Helper functions to determine if content is too long
    const isTitleLong = task.title && task.title.length > 50;
    const isDescriptionLong = task.description && task.description.length > 100;
    const shouldShowViewMore = isTitleLong || isDescriptionLong;

    const truncateText = (text, maxLength) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`card-professional shadow-theme-sm hover:shadow-theme-md p-5 lg:p-6 xl:p-8 w-full min-h-[180px] lg:min-h-[200px] xl:min-h-[220px] break-words relative group transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 ${canDrag ? 'hover:-translate-y-1' : 'opacity-95'}`}
        >
            {/* Priority indicator */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-xl"></div>

            {/* Title */}
            <div className="mb-3 lg:mb-4 pl-2">
                <h4 className="text-base lg:text-lg xl:text-xl font-semibold text-card-foreground mb-1 break-words overflow-hidden leading-tight">
                    {isTitleLong ? truncateText(task.title, 50) : task.title}
                </h4>
                {shouldShowViewMore && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation?.();
                            onViewTask && onViewTask(task);
                        }}
                        className="text-xs text-primary hover:opacity-80 font-medium inline-flex items-center gap-1 hover:underline"
                        title="View complete task"
                    >
                        <span>View more</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Description */}
            {task.description && (
                <p className="mt-2 text-sm lg:text-base text-muted-foreground">
                    {isDescriptionLong ? truncateText(task.description, 100) : task.description}
                </p>
            )}

            {/* Assignee */}
            <div className="mt-2 lg:mt-3 flex items-center gap-2">
                {assigneeName ? (
                    <div className={`h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-gradient-to-br ${getAvatarColor(task.assignee.id, assigneeInitials, allMembers)} flex items-center justify-center text-[9px] lg:text-[10px] font-bold text-white`}>
                        {assigneeInitials}
                    </div>
                ) : (
                    <div className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-muted flex items-center justify-center text-[9px] lg:text-[10px] font-bold text-muted-foreground">--</div>
                )}
                <span className="text-xs sm:text-sm text-muted-foreground truncate">{assigneeName || 'unasigned'}</span>
            </div>

            {/* Sprint display only (no assignment/change) */}
            {task.sprint && (
                <div className="mt-2 lg:mt-3 p-1.5 lg:p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-1.5 lg:gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Sprint:</span>
                        <span className="inline-flex items-center gap-1 px-1.5 lg:px-2 py-0.5 lg:py-1 bg-violet-100 dark:bg-violet-100 text-violet-400 dark:text-violet-700 rounded-md text-xs font-medium truncate">
                            🚀 {task.sprint.name}
                        </span>
                    </div>
                </div>
            )}

            {/* Action buttons positioned at bottom right */}
            {isAdmin && (
                <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation?.(); onUpdateTask && onUpdateTask('edit', task); }}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-card-foreground transition-colors"
                        title="Edit task"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation?.(); onDeleteTask && onDeleteTask(task.id); }}
                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                        title="Delete task"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    onViewTask: PropTypes.func
};

const TaskRow = ({ title, tasks, isAdmin, currentUserId, status, allMembers = [], sprints = [], onDeleteTask, onUpdateTask, onViewTask }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });
    // Define row styles based on status
    const getRowStyles = (status, isOver) => {
        const baseStyles = "w-full card-professional shadow-theme-sm hover:shadow-theme-md rounded-xl border transition-all duration-200 overflow-hidden";

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
            className={getRowStyles(status, isOver)}
        >
            <div className="p-6 border-b border-border w-full">
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 flex-1">
                        <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${status === 'PENDING' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                            status === 'IN_PROGRESS' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                status === 'COMPLETED' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                    'bg-gradient-to-br from-gray-500 to-gray-600'
                            }`}>
                            <span className="text-white text-base lg:text-lg">
                                {status === 'PENDING' ? '📋' : status === 'IN_PROGRESS' ? '⚡' : status === 'COMPLETED' ? '✅' : '📝'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-xl lg:text-2xl xl:text-3xl font-bold ${getHeaderStyles(status)}`}>
                                {title.replace(/^[📋⚡✅📝]\s*/, '')}
                            </h3>
                            <p className="text-base lg:text-lg text-muted-foreground">
                                {status === 'PENDING' ? 'Pending tasks to start' :
                                    status === 'IN_PROGRESS' ? 'Tasks in active development' :
                                        status === 'COMPLETED' ? 'Successfully completed tasks' :
                                            'Task status'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`${getBadgeStyles(status)} w-24 px-5 py-2 rounded-lg text-base lg:text-lg font-semibold shadow-sm`}>
                            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="p-1 w-full">

                {/* Tasks Container - Wrap to next row (no horizontal scroll) */}
                <div className="relative w-full">
                    {tasks.length === 0 ? (
                        <div className={`text-center py-16 border-2 border-dashed rounded-xl transition-all duration-200 w-full ${isOver
                            ? 'border-current text-current bg-current/5'
                            : 'border-border text-muted-foreground'
                            }`}>
                            {isOver ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7m14-8l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold text-lg text-primary">Drop task here</span>
                                    <p className="text-sm text-primary/80">Task will move to this status</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-base text-card-foreground">No tasks here</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {status === 'PENDING' ? 'Create new tasks or move existing tasks here' :
                                                status === 'IN_PROGRESS' ? 'Drag tasks from "To Do\'s" to start' :
                                                    status === 'COMPLETED' ? 'Completed tasks will appear here' :
                                                        'Drag tasks to organize them'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Responsive grid optimized for full width layout */
                        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">{/* Increased gap between cards */}
                            {tasks.filter(task => task && task.id).map((task) => (
                                <div key={task.id} className="w-full">
                                    <TaskCard
                                        task={task}
                                        isAdmin={isAdmin}
                                        currentUserId={currentUserId}
                                        allMembers={allMembers}
                                        sprints={sprints}
                                        onDeleteTask={onDeleteTask}
                                        onUpdateTask={onUpdateTask}
                                        onViewTask={onViewTask}
                                    />
                                </div>
                            ))}

                            {/* Drop zone indicator when dragging */}
                            {isOver && tasks.length > 0 && (
                                <div className="w-full h-24 flex items-center justify-center border-2 border-dashed border-current rounded-xl bg-current/5 text-current">
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span className="font-medium text-xs sm:text-sm">Soltar aquí</span>
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
const TaskBoard = ({ projectId, initialTasks, isAdmin, currentUserId, onTaskUpdate, onTaskDelete, onTaskCreate, sprints = [] }) => {
    // Estado para edición de tarea
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [editTask, setEditTask] = useState({ title: '', description: '', assigneeId: '' });
    const [tasks, setTasks] = useState(initialTasks || []);
    // Eliminar sprint de las tareas si el sprint fue borrado
    useEffect(() => {
        // Cuando cambian los sprints, recargar las tareas desde el backend para reflejar cambios
        const fetchTasks = async () => {
            try {
                const tasksRes = await fetch(`/api/projects/${projectId}/tasks`);
                if (tasksRes.ok) {
                    const tasksData = await tasksRes.json();
                    if (Array.isArray(tasksData)) {
                        const validatedTasks = tasksData.map(task => ({
                            ...task,
                            status: task.status || 'PENDING',
                            // Si el sprint asignado ya no existe, quitar la referencia
                            sprintId: task.sprintId && !sprints.some(s => s.id === task.sprintId) ? null : task.sprintId,
                            sprint: task.sprintId && !sprints.some(s => s.id === task.sprintId) ? null : task.sprint
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
        fetchTasks();
    }, [sprints, projectId]);
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
            await refreshTasks();
            // Refresh tasks from server to ensure we have the most up-to-date data

            // Notify parent component
            if (onTaskCreate) {
                onTaskCreate(createdTask);
            }

            setShowAddTaskModal(false);
            setNewTask({ title: '', description: '', assigneeId: '' });

            // Show success notification
            toast.success('✅ Task created successfully! You can now manage and track its progress.', {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Error creating task:', error);

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
                assigneeId: task.assignee?.id || ''
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
            await refreshTasks();
            setShowEditTaskModal(false);
            setTaskToEdit(null);
            toast.success('Task updated successfully!');
        } catch (error) {
            toast.error('Error updating task');
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
        <div className="task-board-container w-full py-4 px-24 bg-background overflow-x-hidden">
            <div className="w-full mx-auto">{/* Centered layout with reasonable max width */}

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
                                onClick={() => setShowAddTaskModal(true)}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-action-manipulation flex items-center justify-center gap-2 transform hover:scale-105"
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
                                                className="group flex items-center bg-gray-50 dark:bg-gray-800/50 px-4 py-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 w-full min-h-[90px]"
                                            >
                                                <div className={`w-12 h-12 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 shadow-lg ring-2 ring-white dark:ring-gray-900 group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
                                                    {initials}
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0 gap-2">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                        <span className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">{member.user.name}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block flex-shrink-0 ${member.role === 'ADMIN'
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
                                {/* Cards - Kanban Board en Filas */}
                                <div className="space-y-6">
                                    {/* Pending Row */}
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
                                    />

                                    {/* In Progress Row */}
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
                                    />

                                    {/* Completed Row */}
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
                                    />
                                    {/* Modal de edición de tarea */}
                                    {showEditTaskModal && taskToEdit && (
                                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16">{/* Changed to items-start and added pt-16 */}
                                            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border">
                                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                    <h2 className="text-lg font-bold text-card-foreground">Editar Tarea</h2>
                                                </div>
                                                <form onSubmit={handleSaveEditTask} className="p-4 space-y-4">
                                                    <div>
                                                        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Título
                                                        </label>
                                                        <input
                                                            id="edit-title"
                                                            type="text"
                                                            value={editTask.title}
                                                            onChange={(e) => setEditTask(prev => ({ ...prev, title: e.target.value }))}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                                            required
                                                            disabled={isSubmitting}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Descripción
                                                        </label>
                                                        <textarea
                                                            id="edit-description"
                                                            value={editTask.description}
                                                            onChange={(e) => setEditTask(prev => ({ ...prev, description: e.target.value }))}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                                                            rows="2"
                                                            disabled={isSubmitting}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="edit-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Asignar a
                                                        </label>
                                                        <select
                                                            id="edit-assignee"
                                                            value={editTask.assigneeId}
                                                            onChange={(e) => setEditTask(prev => ({ ...prev, assigneeId: e.target.value }))}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                                            disabled={isSubmitting}
                                                        >
                                                            <option value="">unasigned</option>
                                                            {members.map((member) => (
                                                                <option key={member.userId} value={member.userId}>
                                                                    {member.user.name} ({member.role === 'ADMIN' ? 'Admin' : 'Member'})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                        <button
                                                            type="button"
                                                            onClick={() => { setShowEditTaskModal(false); setTaskToEdit(null); }}
                                                            className="w-full sm:w-auto px-4 py-3 sm:py-2 text-muted-foreground hover:text-card-foreground font-medium min-h-[44px] sm:min-h-[36px] rounded-lg border border-border hover:bg-muted transition-colors touch-action-manipulation flex items-center justify-center"
                                                            disabled={isSubmitting}
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg font-medium shadow-sm transition-all duration-200 text-sm min-h-[44px] sm:min-h-[36px] touch-action-manipulation flex items-center justify-center gap-2 ${isSubmitting
                                                                ? 'bg-blue-400 text-white cursor-not-allowed'
                                                                : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md'
                                                                }`}
                                                            disabled={isSubmitting}
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                    <span>Guardando...</span>
                                                                </>
                                                            ) : (
                                                                'Guardar Cambios'
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DndContext>
                        </div>
                    </div>
                </div>

                {showAddTaskModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16">{/* Changed to items-start and added pt-16 */}
                        <div className="card-professional shadow-theme-xl rounded-2xl w-full max-w-md">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
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
                                            setNewTask({ title: '', description: '', assigneeId: '' });
                                        }}
                                        className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 transition-colors p-2 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center touch-action-manipulation hover:bg-gray-100 dark:hover:bg-gray-800"
                                        disabled={isSubmitting}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleCreateTask} className="p-4 space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Task Title
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                        className="input-professional w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        placeholder="Enter task title..."
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={newTask.description}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                        className="input-professional w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors resize-none"
                                        rows="2"
                                        placeholder="Describe the task details..."
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Assign to
                                    </label>
                                    <select
                                        id="assignee"
                                        value={newTask.assigneeId}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, assigneeId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">unasigned</option>
                                        {!Array.isArray(members) || members.length === 0 ? (
                                            <option disabled>Loading members...</option>
                                        ) : (
                                            members.map((member) => (
                                                <option key={member.userId} value={member.userId}>
                                                    {member.user.name} ({member.role === 'ADMIN' ? 'Admin' : 'Member'})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddTaskModal(false);
                                            setNewTask({ title: '', description: '', assigneeId: '' });
                                        }}
                                        className="input-professional w-full sm:w-auto px-4 py-3 sm:py-2 text-muted-foreground hover:text-card-foreground font-medium transition-colors text-sm min-h-[44px] sm:min-h-[36px] rounded-lg border border-border hover:bg-muted touch-action-manipulation flex items-center justify-center"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`button-professional w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg font-medium shadow-theme-sm transition-all duration-200 text-sm min-h-[44px] sm:min-h-[36px] touch-action-manipulation flex items-center justify-center gap-2 ${isSubmitting
                                            ? 'bg-violet-400 text-white cursor-not-allowed'
                                            : 'bg-violet-500 text-white hover:shadow-theme-md'
                                            }`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Creating...</span>
                                            </>
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
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16">{/* Changed to items-start and added pt-16 */}
                        <div className="card-professional shadow-theme-xl rounded-2xl w-full max-w-md">
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
                                        className="input-professional w-full sm:w-auto px-6 py-3 sm:py-2.5 text-muted-foreground hover:text-foreground font-medium border border-border rounded-xl hover:bg-muted transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-action-manipulation flex items-center justify-center"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmDeleteTask}
                                        className="button-professional w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-theme-sm hover:shadow-theme-md transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-action-manipulation flex items-center justify-center gap-2"
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

                {/* Full-Screen View Task Modal */}
                {showViewModal && taskToView && (
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
                        onClick={handleCloseViewModal}
                        style={{
                            position: 'fixed',
                            top: '0',
                            left: '0',
                            right: '0',
                            bottom: '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div
                            className="card-professional shadow-theme-xl rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 break-words leading-tight overflow-hidden max-w-full" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                            {taskToView.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${taskToView.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/30 dark:text-amber-400' :
                                                taskToView.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/30 dark:text-blue-300' :
                                                    taskToView.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-500/30 dark:text-green-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-500/30 dark:text-gray-300'
                                                }`}>
                                                {taskToView.status === 'PENDING' ? '📋 Pending' :
                                                    taskToView.status === 'IN_PROGRESS' ? '⚡ In Progress' :
                                                        taskToView.status === 'COMPLETED' ? '✅ Completed' :
                                                            taskToView.status}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCloseViewModal}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200 flex-shrink-0"
                                        title="Close"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto max-h-[calc(80vh-140px)]">
                                <div className="p-6 space-y-6">
                                    {/* Description Section */}
                                    {taskToView.description && (
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Description
                                            </h3>
                                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm break-words overflow-wrap-anywhere max-w-full overflow-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap', maxWidth: '100%' }}>
                                                {taskToView.description}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Sprint Info */}
                                        {taskToView.sprint && (
                                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-violet-200 dark:border-violet-800">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Sprint
                                                </h3>
                                                <span className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-md text-sm font-medium inline-flex items-center gap-2">
                                                    🚀 {taskToView.sprint.name}
                                                </span>
                                            </div>
                                        )}

                                        {/* Assignee */}
                                        {taskToView.assignee && (
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Assigned to
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                        {taskToView.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white block">{taskToView.assignee.name}</span>
                                                        {taskToView.assignee.email && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <svg className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 truncate">{taskToView.assignee.email}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleCloseViewModal}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        Close
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
