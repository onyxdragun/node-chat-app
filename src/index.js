import express from 'express';
import {fileURLToPath} from 'url';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import {Filter} from 'bad-words';

import { generateMessage, generateLocation } from './utils/messages.js';
import { getUser, getUsersInRoom, removeUser, addUser } from './utils/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Defined Paths for Express Config
const publicDirectoryPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New web socket connection');

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room});

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'Welcome!')); // Send to connecting user
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`)); // Sends to all BUT connecting user
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        }
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, message)); // Sends to all connected users
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://www.google.com/maps/@$${coords.lat},${coords.long}`));
        callback();
    });

    // When client disconnects
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

// Start the web server
server.listen(port, () => {
    console.log('Server is up on port '+ port);
});
