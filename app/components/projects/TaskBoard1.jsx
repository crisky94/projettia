import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';



function TaskBoard({ projectId, initialTasks, isAdmin }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigneeEmail: ''
});
const socketRef = useRef(null);

const handleAddTask = async (e) => {
    e.preventDefault();
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

        if (!response.ok) {
            throw new Error('Failed to create task');
        }

        const createdTask = await response.json();
        setTasks(prev => [...prev, createdTask]);
        setShowAddTaskModal(false);
        setNewTask({ title: '', description: '', assigneeEmail: '' });
    } catch (error) {
        console.error('Error creating task:', error);
        // Aquí podrías agregar una notificación de error
    }
};

useEffect(() => {
    // Inicializar socket
    socketRef.current = io();
    const socket = socketRef.current;

    // Unirse al proyecto
    socket.emit('joinProject', projectId);

    // Escuchar actualizaciones de tareas
    socket.on('taskUpdated', (updatedTask) => {
        setTasks(prev => {
            const taskIndex = prev.findIndex(t => t.id === updatedTask.id);
            if (taskIndex === -1) {
                return [...prev, updatedTask];
            }
            const newTasks = [...prev];
            newTasks[taskIndex] = updatedTask;
            return newTasks;
        });
    });

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
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-2 border rounded-lg"
                                required
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
                                className="w-full p-2 border rounded-lg"
                                rows="3"
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
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAddTaskModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            >
                                Create Task
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </DragDropContext>
);

};
