const socket = io();   // Connects to socket.io server

socket.on('message', (message) => {
    console.log(message);
})

const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#message-input');
messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newText = event.target.elements.message.value.trim();
    if (newText) {
        socket.emit('sendMessage', newText);
    }
})