import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const TaskColumn = ({ status, tasks, isAdmin }) => {
    return (
        <div className="w-80 bg-gray-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">{status}</h3>
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

export default function TaskBoard({ projectId, tasks: initialTasks, isAdmin }) {
    const [tasks, setTasks] = useState(initialTasks);
    const socketRef = useRef(null);

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

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto p-4">
                {columns.map(status => (
                    <TaskColumn
                        key={status}
                        status={status}
                        tasks={tasks.filter(task => task.status === status)}
                        isAdmin={isAdmin}
                    />
                ))}
            </div>
        </DragDropContext>
    );
}
