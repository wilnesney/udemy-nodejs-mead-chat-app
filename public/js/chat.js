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
        socket.emit('sendMessage', newText, (error) => {
            if (error) {
                return console.log(error);
            }
            console.log('The message was delivered!');
        });
    }
})

const sendLocationButton = document.querySelector('#send-location');
sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared!');
        });
    })
})