import next from 'next';
import { createServer } from 'http';
import { configureSocketServer } from './lib/socket';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            await handle(req, res);
        } catch (err) {
            console.error('Error handling request:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    });

    const io = configureSocketServer(server);

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
        console.log('> Socket.IO server running');
    });
});
