import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';

const TaskColumn = ({ status, tasks, isAdmin, onAddTask }) => {
    return (
        <div className="w-80 bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{status}</h3>
                {isAdmin && (
                    <button
                        onClick={() => onAddTask(status)}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        + Add Task
                    </button>
                )}
            </div>
            <Droppable droppableId={status}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[200px]"
                    >
                        {tasks.map((task, index) => (
                            <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                                isDragDisabled={!isAdmin}
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
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
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

TaskColumn.propTypes = {
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
    onAddTask: PropTypes.func.isRequired
};

const TaskBoard = ({ projectId, tasks: initialTasks, isAdmin }) => {
    const [tasks, setTasks] = useState(initialTasks);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTaskStatus, setNewTaskStatus] = useState('');
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigneeEmail: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const socketRef = useRef(null);

    const handleAddTask = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Validar los campos requeridos
        if (!newTask.title.trim()) {
            setError('Title is required');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`/api/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newTask,
                    status: newTaskStatus,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to create task');
            }

            setTasks(prev => [...prev, data]);
            setShowAddTaskModal(false);
            setNewTask({ title: '', description: '', assigneeEmail: '' });
        } catch (error) {
            console.error('Error creating task:', error);
            setError(error.message || 'Failed to create task. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateTaskInList = (prev, updatedTask) => {
        const taskIndex = prev.findIndex(t => t.id === updatedTask.id);
        if (taskIndex === -1) {
            return [...prev, updatedTask];
        }
        const newTasks = [...prev];
        newTasks[taskIndex] = updatedTask;
        return newTasks;
    };

    const handleTaskUpdate = updatedTask => {
        setTasks(prev => updateTaskInList(prev, updatedTask));
    };

    useEffect(() => {
        // Inicializar socket
        socketRef.current = io();
        const socket = socketRef.current;

        // Unirse al proyecto
        socket.emit('joinProject', projectId);

        // Escuchar actualizaciones de tareas
        socket.on('taskUpdated', handleTaskUpdate);

        return () => {
            socket.disconnect();
        };
    }, [projectId]);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId === destination.droppableId) return;

        // Optimistic update
        const newTasks = [...tasks];
        const taskIndex = newTasks.findIndex(t => t.id === draggableId);
        newTasks[taskIndex] = {
            ...newTasks[taskIndex],
            status: destination.droppableId
        };
        setTasks(newTasks);

        // Emitir evento de cambio de estado
        socketRef.current.emit('taskStatusChange', {
            projectId,
            taskId: draggableId,
            status: destination.droppableId,
        });
    };

    const columns = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    const handleOpenAddTask = (status) => {
        setNewTaskStatus(status);
        setShowAddTaskModal(true);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto p-4">
                {columns.map(status => (
                    <TaskColumn
                        key={status}
                        status={status}
                        tasks={tasks.filter(task => task.status === status)}
                        isAdmin={isAdmin}
                        onAddTask={handleOpenAddTask}
                    />
                ))}
            </div>

            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add New Task</h2>
                        <form onSubmit={handleAddTask}>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}
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
                                    placeholder="Enter member email address"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddTaskModal(false);
                                        setError('');
                                        setNewTask({ title: '', description: '', assigneeEmail: '' });
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 rounded-lg text-white ${
                                        isSubmitting
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
        </DragDropContext>
    );
};

TaskBoard.propTypes = {
    projectId: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(
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
