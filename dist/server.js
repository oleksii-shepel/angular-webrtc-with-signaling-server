import express from 'express';
import { Server } from 'socket.io';
import * as http from 'http';
import * as uuid from 'uuid';
const expressApp = express();
expressApp.use(express.static('public'));
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));
expressApp.get('/hello', (req, res) => {
    res.send('Hello!');
});
const rooms = {};
const userIds = {};
const server = http.createServer(expressApp);
const io = new Server(server);
export function run(config = {}) {
    io.on('connection', function (socket) {
        let currentRoom, id;
        socket.on('init', (data, callback) => {
            currentRoom = (data || {}).room || uuid.v4();
            var room = rooms[currentRoom];
            if (!room) {
                rooms[currentRoom] = [socket];
                id = userIds[currentRoom] = 0;
                callback({ room: currentRoom, id: id });
                console.log('Room created, with #', currentRoom);
            }
            else {
                userIds[currentRoom] += 1;
                id = userIds[currentRoom];
                callback({ room: currentRoom, id: id });
                room.forEach(function (s) {
                    s.emit('peer.connected', { id: id });
                });
                room[id] = socket;
                console.log('Peer connected to room', currentRoom, 'with #', id);
            }
        });
        socket.on('msg', function (data) {
            var to = parseInt(data.to, 10);
            if (rooms[currentRoom] && rooms[currentRoom][to]) {
                console.log('Redirecting message to', to, 'by', data.by);
                rooms[currentRoom][to].emit('msg', data);
            }
            else {
                console.warn('Invalid user');
            }
        });
        socket.on('disconnect', function () {
            if (!currentRoom || !rooms[currentRoom]) {
                return;
            }
            delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)];
            rooms[currentRoom].forEach(function (socket) {
                if (socket) {
                    socket.emit('peer.disconnected', { id: id });
                }
            });
        });
    });
    
    console.log('Listening on', config.PORT);
    server.listen(config.PORT);
}
