const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const {username, room} = Object.fromEntries(new URLSearchParams(location.search));

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible Height
    const visibleHeight = $messages.offsetHeight;

    // Container Height
    const containerHeight = $messages.scrollHeight;

    // Scroll Position
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    const html  = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        timestamp: moment(message.createdAt).format('DDMMYYYY HHmmss')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.url,
        timestamp: moment(location.createdAt).format('DDMMYYYY HHmmss')
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    $messageFormButton.setAttribute('disabled', 'disabled');

    // Target the form > input name="message"
    const message = event.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {

        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.error(error);
        }
    });
});

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');
    
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            // We got acknowledgement that the location was shared
            $sendLocationButton.removeAttribute('disabled');
        });
    });
});

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});