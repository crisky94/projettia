import { useState, useEffect, useRef, useCallback } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';

const TaskCard = ({ task, isAdmin }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: task.id.toString()
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: isAdmin ? 'grab' : 'default'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white p-4 rounded-lg shadow mb-2"
        >
            <h4 className="font-semibold">{task.title}</h4>
            {task.description && (
                <p className="text-gray-600 text-sm mt-1">
                    {task.description}
                </p>
            )}
            {task.assignee && (
                <div className="mt-2 text-sm text-gray-500">
                    Assigned to: {task.assignee.name}
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
        assignee: PropTypes.shape({
            name: PropTypes.string.isRequired
        })
    }).isRequired,
    isAdmin: PropTypes.bool.isRequired
};

const TaskColumn = ({ title, tasks, isAdmin }) => {
    return (
        <div className="w-80 bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <div className="min-h-[200px]">
                <SortableContext
                    items={tasks.filter(task => task && task.id).map(task => task.id.toString())}
                >
                    {tasks.filter(task => task && task.id).map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            isAdmin={isAdmin}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

TaskColumn.propTypes = {
    title: PropTypes.string.isRequired,
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
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigneeEmail: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const socketRef = useRef(null);

    // Debug logs
    useEffect(() => {
        console.log('TaskBoard mounted with initialTasks:', initialTasks);
        console.log('Current tasks state:', tasks);
    }, [initialTasks, tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
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

    const handleTaskUpdate = useCallback((updatedTask) => {
        setTasks(currentTasks => {
            const taskIndex = currentTasks.findIndex(task => task.id === updatedTask.id);
            if (taskIndex === -1) {
                return [...currentTasks, updatedTask];
            }
            const newTasks = [...currentTasks];
            newTasks[taskIndex] = updatedTask;
            return newTasks;
        });
    }, []);

    const connectSocket = useCallback(() => {
        if (!socketRef.current) {
            socketRef.current = io('http://localhost:3000', {
                autoConnect: false,
                path: '/socket.io',
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                forceNew: true
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
                setIsSocketConnected(true);
                socketRef.current.emit('joinProject', projectId);
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsSocketConnected(false);
            });

            socketRef.current.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsSocketConnected(false);
            });

            socketRef.current.on('taskUpdated', handleTaskUpdate);
        }

        if (!isSocketConnected) {
            socketRef.current.connect();
        }
    }, [projectId, isSocketConnected, handleTaskUpdate]);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsSocketConnected(false);
        }
    }, []);

    useEffect(() => {
        connectSocket();
        return () => {
            disconnectSocket();
        };
    }, [connectSocket, disconnectSocket]);

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const activeTask = tasks.find(task => task.id === active.id);
            const overTask = tasks.find(task => task.id === over?.id);

            if (activeTask && overTask) {
                const updatedTasks = [...tasks];
                const activeIndex = tasks.indexOf(activeTask);
                const overIndex = tasks.indexOf(overTask);

                [updatedTasks[activeIndex], updatedTasks[overIndex]] =
                    [updatedTasks[overIndex], updatedTasks[activeIndex]];

                setTasks(updatedTasks);

                if (socketRef.current) {
                    socketRef.current.emit('updateTaskPosition', {
                        projectId,
                        taskId: activeTask.id,
                        newIndex: overIndex
                    });
                }
            }
        }
        setActiveId(null);
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
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToHorizontalAxis]}
            >
                <div className="flex gap-4">
                    {/* Debug info */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="fixed top-0 right-0 bg-white p-2 text-xs">
                            Total tasks: {tasks.length}
                        </div>
                    )}
                    <TaskColumn
                        title="Pending"
                        tasks={tasks.filter(task => task.status === 'PENDING')}
                        isAdmin={isAdmin}
                    />
                    <TaskColumn
                        title="In Progress"
                        tasks={tasks.filter(task => task.status === 'IN_PROGRESS')}
                        isAdmin={isAdmin}
                    />
                    <TaskColumn
                        title="Completed"
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
