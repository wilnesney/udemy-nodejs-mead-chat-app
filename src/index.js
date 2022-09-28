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



io.on('connect', (socket) => {
    console.log('New WebSocket connection');

    socket.emit('message', 'Welcome!');
    socket.broadcast.emit('message', 'A new user joined!');

    socket.on('sendMessage', (sentMessage) => {
        io.emit('message', sentMessage);
    })

    socket.on('sendLocation', (coords) => {
        io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user left!');
    })
})

// Note: Using server.listen() instead of typical app.listen()
server.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})
