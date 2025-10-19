// Importamos los módulos necesarios
import next from 'next';
import { createServer } from 'http';
import { configureSocketServer } from './lib/socket.js';

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

  // Configuramos Socket.io para el chat
  const io = configureSocketServer(httpServer);

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
});
