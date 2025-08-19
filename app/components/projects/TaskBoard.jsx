import { useState, useEffect } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, closestCorners, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';

const TaskCard = ({ task, isAdmin, allMembers = [] }) => {
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
            className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 ${isAdmin
                    ? 'cursor-grab active:cursor-grabbing hover:border-blue-300 active:shadow-lg'
                    : 'cursor-default'
                } ${isDragging ? 'rotate-2 shadow-xl border-blue-400' : ''}`}
        >
        
            <h4 className="font-semibold text-gray-900">{task.title}</h4>
            {task.description && (
                <p className="text-gray-600 text-sm mt-1 ">
                    {task.description}
                </p>
            )}
            {task.assignee && (
                <div className="mt-3 flex items-center text-sm text-gray-500">
                    {(() => {
                        const initials = task.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        const avatarColor = getAvatarColor(task.assignee.id, initials, allMembers);
                        return (
                            <div className={`w-8 h-8 bg-gradient-to-r ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 shadow-sm`}>
                                {initials}
                            </div>
                        );
                    })()}
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-700">{task.assignee.name}</span>
                        <span className="text-xs text-gray-500">{task.assignee.email}</span>
                    </div>
                </div>
            )}
            <div className="mt-2 text-xs text-gray-400">
                Estado: {task.status.replace('_', ' ')}
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
    )
};

const TaskColumn = ({ title, tasks, isAdmin, status, allMembers = [] }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    return (
        <div
            ref={setNodeRef}
            className={`w-80 rounded-lg p-4 transition-colors duration-200 min-h-[500px] items-center ${isOver ? 'bg-blue-100 border-2 border-blue-400 shadow-lg' : 'bg-gray-100 border-2 border-transparent'
                }`}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                    {tasks.length}
                </span>
            </div>
            <div className="min-h-[400px] max-h-[600px] overflow-y-hidden space-y-3 pr-1">
                {tasks.filter(task => task && task.id).map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        isAdmin={isAdmin}
                        allMembers={allMembers}
                    />
                ))}
                {tasks.length === 0 && (
                    <div className={`text-center py-12 border-2 border-dashed rounded-lg transition-all duration-200 ${isOver
                            ? 'text-blue-600 border-blue-400 bg-blue-50'
                            : 'text-gray-400 border-gray-300'
                        }`}>
                        {isOver ? 'Suelta la tarea aquí' : 'Sin tareas'}
                    </div>
                )}
                {tasks.length > 0 && isOver && (
                    <div className="text-blue-600 text-center py-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 font-medium">
                        ✓ Soltar en {title}
                    </div>
                )}
            </div>
        </div>
    );
};

TaskColumn.propTypes = {
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
    )
};

const TaskBoard = ({ projectId, initialTasks, isAdmin }) => {
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
                    setMembers(membersData);
                } else {
                    console.error('Failed to load project members');
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
                setMembers(membersData);
            } else {
                console.error('Failed to reload project members');
            }
        } catch (error) {
            console.error('Error reloading members:', error);
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
                const updatedTasks = tasks.map(task =>
                    task.id === activeTask.id
                        ? { ...task, status: newStatus }
                        : task
                );
                setTasks(updatedTasks);

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
            setShowAddTaskModal(false);
            setNewTask({ title: '', description: '', assigneeId: '' });
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4">{/* Project Members Section */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-800">Miembros del Proyecto ({members.length})</h2>
                        {isLoadingMembers && (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" 
                                 title="Actualizando miembros..."></div>
                        )}
                    </div>
                </div>
                {members.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                        {isLoadingMembers ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>Cargando miembros...</span>
                            </div>
                        ) : (
                            <span>No hay miembros en este proyecto</span>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {members.map((member) => {
                            const initials = member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            
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
                                const membersWithSameInitials = allMembers.filter(m => {
                                    const memberInitials = m.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                    return memberInitials === initials;
                                });

                                if (membersWithSameInitials.length === 1) {
                                    // If only one member has these initials, use the default blue-purple
                                    return colors[0];
                                }

                                // If multiple members have the same initials, assign different colors
                                const memberIndex = membersWithSameInitials.findIndex(m => m.userId === userId);
                                return colors[memberIndex % colors.length];
                            };

                            const avatarColor = getAvatarColor(member.userId, initials, members);

                            return (
                                <div 
                                    key={member.userId} 
                                    className="flex items-center bg-gray-50 px-3 py-2 rounded-full border hover:bg-gray-100 transition-colors"
                                >
                                    <div className={`w-8 h-8 bg-gradient-to-r ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 shadow-sm`}>
                                        {initials}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-700">{member.user.name}</span>
                                        <span className="text-xs text-gray-500">
                                            {member.role === 'ADMIN' ? 'Admin' : 'Miembro'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isAdmin && (
                <div className="mb-4">
                    <button
                        onClick={() => setShowAddTaskModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm"
                    >
                        + Add New Task
                    </button>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4">
                    {/* Debug info */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="fixed top-12 right-0 bg-white p-2 text-xs">
                            Total tasks: {tasks.length}<br />
                            {/* Active: {activeId || 'none'} */}
                        </div>
                    )}
                    <TaskColumn
                        title="Pending"
                        status="PENDING"
                        tasks={tasks.filter(task => task.status === 'PENDING')}
                        isAdmin={isAdmin}
                        allMembers={members}
                    />
                    <TaskColumn
                        title="In Progress"
                        status="IN_PROGRESS"
                        tasks={tasks.filter(task => task.status === 'IN_PROGRESS')}
                        isAdmin={isAdmin}
                        allMembers={members}
                    />
                    <TaskColumn
                        title="Completed"
                        status="COMPLETED"
                        tasks={tasks.filter(task => task.status === 'COMPLETED')}
                        isAdmin={isAdmin}
                        allMembers={members}
                    />
                </div>
            </DndContext>

            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 max-w-full">
                        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                                    Asignar a
                                </label>
                                <select
                                    id="assignee"
                                    value={newTask.assigneeId}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, assigneeId: e.target.value }))}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isSubmitting}
                                >
                                    <option value="">Sin asignar</option>
                                    {members.length === 0 ? (
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
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        setNewTask({ title: '', description: '', assigneeId: '' });
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 rounded-lg text-white ${isSubmitting
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                        }`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Task'}
                                </button>
                            </div>
                        </form>
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
    isAdmin: PropTypes.bool.isRequired
};

export default TaskBoard;
