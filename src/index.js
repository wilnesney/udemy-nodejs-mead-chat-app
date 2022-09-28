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

let count = 0;

io.on('connect', (socket) => {
    console.log('New WebSocket connection');

    socket.emit('countUpdated', count);
    
    socket.on('increment', () => {
        ++count;
        //socket.emit('countUpdate', count);  // Send to the current connection
        io.emit('countUpdated', count); // Send to all current connections
    })
})

// Note: Using server.listen() instead of typical app.listen()
server.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})
