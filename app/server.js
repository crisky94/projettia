// Importamos los módulos necesarios
import next from 'next';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import prisma from './src/lib/prismaClient.js';
// Creamos una instancia del cliente de Prisma

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


  // Escuchamos cuando un cliente se conecta vía WebSocket
  io.on('connection', (socket) => {
    console.log(`socket conectado con id:${socket.id}`);

    // aqui van los eventos del juego y jugadores
    gameEvents(socket, io, prisma);
    playerEvents(socket, io, prisma, gamePlayerMap);

    socket.on('disconnect', () => {
      console.log('socket desconectado 😐');
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
});
