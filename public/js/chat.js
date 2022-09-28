const socket = io();   // Connects to socket.io server

socket.on('countUpdated', (count) => {
    console.log('Count updated:', count);
})

const incrementButton = document.querySelector('#increment');
incrementButton.addEventListener('click', () => {
    socket.emit('increment');
})