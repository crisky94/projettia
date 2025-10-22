import { Server } from 'socket.io';
import prisma from '../../lib/prisma.js';

export function configureSocketServer(server) {
    const io = new Server(server, {
        path: '/socket.io',
        serveClient: false,
        pingInterval: 10000,
        pingTimeout: 5000,
        cookie: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["*"]
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true
    });

    // Mapa para mantener registro de qué usuario está en qué proyecto
    const userProjectMap = new Map();

    io.on('connection', (socket) => {
        console.log(`Cliente conectado: ${socket.id}`);

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        socket.on('joinProject', (projectId) => {
            if (!projectId) {
                console.error('No project ID provided');
                return;
            }
            socket.join(`project:${projectId}`);
            userProjectMap.set(socket.id, projectId);
            console.log(`Cliente ${socket.id} se unió al proyecto ${projectId}`);
        });

        socket.on('message', async ({ projectId, message }) => {
            try {
                const newMessage = await prisma.message.create({
                    data: {
                        content: message.content,
                        userId: message.userId,
                        projectId: projectId,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                });

                io.to(`project:${projectId}`).emit('newMessage', newMessage);
            } catch (error) {
                console.error('Error creating message:', error);
                socket.emit('error', { message: 'Error creating message' });
            }
        });

        // Re-difundir a la sala del proyecto cuando un mensaje fue editado
        socket.on('messageEdited', ({ projectId, message }) => {
            if (!projectId || !message?.id) return;
            io.to(`project:${projectId}`).emit('messageEdited', message);
        });

        socket.on('disconnect', () => {
            const projectId = userProjectMap.get(socket.id);
            if (projectId) {
                userProjectMap.delete(socket.id);
                console.log(`Cliente ${socket.id} se desconectó del proyecto ${projectId}`);
            }
        });
    });

    return io;
}
