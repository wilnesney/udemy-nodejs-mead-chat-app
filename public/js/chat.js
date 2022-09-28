const socket = io();   // Connects to socket.io server

// Elements (DOM element variables prefixed by $ by convention)
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');

socket.on('message', (message) => {
    console.log(message);
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Disable form submission while waiting for response
    $messageFormButton.setAttribute('disabled', 'disabled');

    const newText = event.target.elements.message.value.trim();
    if (newText) {
        socket.emit('sendMessage', newText, (error) => {
            // Got response from server, so re-enable form
            $messageFormButton.removeAttribute('disabled');
            // Also, clear sent message text & ensure focus returns to text field.
            // E.g., in case they clicked the button to send.
            $messageFormInput.value = '';
            $messageFormInput.focus();

            if (error) {
                return console.log(error);
            }
            console.log('The message was delivered!');
        });
    }
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    // Disable button until server responds
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');    // Re-enable button
            console.log('Location shared!');
        });
    })
})