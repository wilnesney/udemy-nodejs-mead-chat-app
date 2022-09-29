const socket = io();   // Connects to socket.io server

// Elements (DOM element variables prefixed by $ by convention)
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
// Without ignoreQueryPrefix, we get the query string question mark on one of our variable names
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// Autoscrolls down to newest message *if* the user hasn't scrolled up
// to look at older messages.
const autoscroll = () => {
    // Get latest message
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height of messages area
    const visibleHeight = $messages.offsetHeight;

    // Actual height of messages container
    const containerHeight = $messages.scrollHeight;

    // scrollTop is distance scrolled (0 for no scrolling).
    // scrollTop + the visible height gives us the total distance from
    // the top of messages to the bottom of where the user can see.
    const scrollOffset = $messages.scrollTop + visibleHeight;

    /*  When a new message comes in, nothing automatically scrolls it.
        So, by default (assuming we're at the last message), 
        we should currently be scrolled to just before the new message.
        I.e., scrollOffset should be (containerHeight - newMessageHeight)
        if there are a bunch of messages. 
        If scrollOffset is less than that, it means the user scrolled up
        and is viewing messages, so we *don't* want to annoy them by scrolling
        things down.
    */
    if ((containerHeight - newMessageHeight) <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    const renderedHtml = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'), // Moment formats the timestamp number
    });
    $messages.insertAdjacentHTML('beforeend', renderedHtml);
    autoscroll();
})

socket.on('locationMessage', (locationMessage) => {
    const renderedHtml = Mustache.render(locationMessageTemplate, {
        username: locationMessage.username,
        url: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format('h:mm a'),
    });
    $messages.insertAdjacentHTML('beforeend', renderedHtml);
    autoscroll();
})

socket.on('roomData', ({ room, users }) => {
    const renderedHtml = Mustache.render(sidebarTemplate, {
        room,
        users,
    });
    $sidebar.innerHTML = renderedHtml;
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const newText = event.target.elements.message.value.trim();
    if (newText) {
        // Disable form submission while waiting for response
        $messageFormButton.setAttribute('disabled', 'disabled');
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

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';    // Redirect to main/login page
    }
});