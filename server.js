const express = require('express');
const next = require('next');
const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const Y = require('yjs');
const ydoc = new Y.Doc();
const awarenessStates = new Map();

let sharedContent = '';

app.prepare().then(() => {
    const server = express();
    const httpServer = http.createServer(server);
    const io = new Server(httpServer, {
        cors: { origin: '*' }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Send initial document state
        console.log(Y.encodeStateAsUpdate(ydoc));

        socket.emit('document-state', Y.encodeStateAsUpdate(ydoc));

        // Send current awareness states
        socket.emit('awareness-states', Array.from(awarenessStates.entries()));

        // Handle document updates
        socket.on('document-update', (update) => {
            console.log('Received document update from:', socket.id);
            Y.applyUpdate(ydoc, update);
            socket.broadcast.emit('document-update', update);
        });


        // Handle awareness updates
        socket.on('awareness-update', ({ clientId, state }) => {
            if (state === null) {
                awarenessStates.delete(clientId);
            } else {
                awarenessStates.set(clientId, state);
            }
            socket.broadcast.emit('awareness-update', { clientId, state });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            awarenessStates.delete(socket.id);
            io.emit('awareness-update', {
                clientId: socket.id,
                state: null
            });
        });
    });
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    const PORT = process.env.PORT || 3000;

    httpServer.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});
