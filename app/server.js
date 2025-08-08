import next from 'next';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import prisma from '@/lib/prisma';

// Definimos si estamos en modo desarrollo o producción
const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
// Inicializamos la aplicación Next.js
const app = next({ dev, port });

// Manejador para todas las peticiones HTTP con Next.js
const handler = app.getRequestHandler();

// Preparamos la aplicación Next.js
app.prepare().then(() => {
    // Creamos el servidor HTTP
    const httpServer = createServer(handler);

    // Inicializamos el servidor de Socket.io sobre el servidor HTTP
    const io = new SocketServer(httpServer, {
        cors: {
            origin: '*', // Aquí puedes especificar los W permitidos
            methods: ['GET', 'POST', 'DELETE', 'PUT'],
        },
    });

    // Mapa para mantener registro de qué usuario está en qué proyecto
    const userProjectMap = new Map();

    // Escuchamos cuando un cliente se conecta vía WebSocket
    io.on('connection', (socket) => {
        console.log(`Cliente conectado: ${socket.id}`);

        // Unirse a un proyecto
        socket.on('joinProject', (projectId) => {
            socket.join(`project:${projectId}`);
            userProjectMap.set(socket.id, projectId);
            console.log(`Cliente ${socket.id} se unió al proyecto ${projectId}`);
        });

        // Crear/Actualizar tarea
        socket.on('taskUpdate', async ({ projectId, task }) => {
            try {
                const updatedTask = await prisma.task.upsert({
                    where: { id: task.id || '' },
                    update: task,
                    create: task,
                    include: { assignee: true },
                });
                io.to(`project:${projectId}`).emit('taskUpdated', updatedTask);
            } catch (error) {
                console.error('Error al actualizar tarea:', error);
                socket.emit('error', 'Error al actualizar tarea');
            }
        });

        // Cambiar estado de tarea
        socket.on('taskStatusChange', async ({ projectId, taskId, status }) => {
            try {
                const updatedTask = await prisma.task.update({
                    where: { id: taskId },
                    data: { status },
                    include: { assignee: true },
                });
                io.to(`project:${projectId}`).emit('taskUpdated', updatedTask);
            } catch (error) {
                console.error('Error al cambiar estado de tarea:', error);
                socket.emit('error', 'Error al cambiar estado de tarea');
            }
        });

        // Nuevo mensaje en el chat
        socket.on('message', async ({ projectId, message }) => {
            try {
                const newMessage = await prisma.message.create({
                    data: message,
                    include: { user: true },
                });
                io.to(`project:${projectId}`).emit('newMessage', newMessage);
            } catch (error) {
                console.error('Error al enviar mensaje:', error);
                socket.emit('error', 'Error al enviar mensaje');
            }
        });

        // Desconexión
        socket.on('disconnect', () => {
            const projectId = userProjectMap.get(socket.id);
            if (projectId) {
                socket.leave(`project:${projectId}`);
                userProjectMap.delete(socket.id);
            }
            console.log(`Cliente desconectado: ${socket.id}`);
        });
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });
});