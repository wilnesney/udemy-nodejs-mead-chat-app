const http = require('http');
const path = require('path');
const Filter = require('bad-words');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app); // Express usually does this behind the scenes,
                                       // but we need the server to pass to socket.io
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));


io.on('connect', (socket) => {
    console.log('New WebSocket connection');

    

    socket.on('join', ({ username, room }) => {
        socket.join(room);

        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(room).emit('message', generateMessage(`${username} joined!`));
    })

    // The callback is optional--calling it tells to the client that
    // the server received and processed what the client sent, 
    // possibly with other information.
    socket.on('sendMessage', (sentMessage, callback) => {
        const filter = new Filter();
        if (filter.isProfane(sentMessage)) {
            return callback('Profanity is not allowed!');
        }

        io.emit('message', generateMessage(sentMessage));

        callback(); // Acknowledgement callback (so client knows we got it)
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', 
                generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));

        callback(); // Acknowledge
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user left!'));
    })
})

// Note: Using server.listen() instead of typical app.listen()
server.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})
