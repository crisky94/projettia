import next from 'next';
import { createServer } from 'http';
import { configureSocketServer } from './lib/socket';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        if (req.url.startsWith('/socket.io')) {
            // Dejar que Socket.IO maneje la solicitud
            res.writeHead(404).end();
        } else {
            try {
                handle(req, res);
            } catch (err) {
                console.error('Error handling request:', err);
                res.writeHead(500).end('Internal Server Error');
            }
        }
    });

    const io = configureSocketServer(server);

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
        console.log('> Socket.IO server running');
    });
});
});
});