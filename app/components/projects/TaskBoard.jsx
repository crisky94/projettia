import { useState, useEffect } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, closestCorners, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';

const TaskCard = ({ task, isAdmin }) => {
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
                 
                    <span>{task.assignee.name}</span>
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
            name: PropTypes.string.isRequired
        })
    }).isRequired,
    isAdmin: PropTypes.bool.isRequired
};

const TaskColumn = ({ title, tasks, isAdmin, status }) => {
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
    isAdmin: PropTypes.bool.isRequired
};

const TaskBoard = ({ projectId, initialTasks, isAdmin }) => {
    const [tasks, setTasks] = useState(initialTasks || []);
    const [activeId, setActiveId] = useState(null);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigneeEmail: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    ...newTask,
                    status: 'PENDING'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const createdTask = await response.json();
            setTasks(prevTasks => [...prevTasks, createdTask]);
            setShowAddTaskModal(false);
            setNewTask({ title: '', description: '', assigneeEmail: '' });
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4">
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
                        <div className="fixed top-0 right-0 bg-white p-2 text-xs">
                            Total tasks: {tasks.length}<br />
                            {/* Active: {activeId || 'none'} */}
                        </div>
                    )}
                    <TaskColumn
                        title="Pending"
                        status="PENDING"
                        tasks={tasks.filter(task => task.status === 'PENDING')}
                        isAdmin={isAdmin}
                    />
                    <TaskColumn
                        title="In Progress"
                        status="IN_PROGRESS"
                        tasks={tasks.filter(task => task.status === 'IN_PROGRESS')}
                        isAdmin={isAdmin}
                    />
                    <TaskColumn
                        title="Completed"
                        status="COMPLETED"
                        tasks={tasks.filter(task => task.status === 'COMPLETED')}
                        isAdmin={isAdmin}
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
                                <label htmlFor="assigneeEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                    Assignee Email
                                </label>
                                <input
                                    id="assigneeEmail"
                                    type="email"
                                    value={newTask.assigneeEmail}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, assigneeEmail: e.target.value }))}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter team member's email"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        setNewTask({ title: '', description: '', assigneeEmail: '' });
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
