const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app); // Express usually does this behind the scenes,
                                       // but we need the server to pass to socket.io
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

io.on('connect', () => {
    console.log('New WebSocket connection');
})

// Note: Using server.listen() instead of typical app.listen()
server.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})
