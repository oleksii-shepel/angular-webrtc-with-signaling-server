import express from 'express';
import { Server, Socket } from 'socket.io';
import * as http from 'http';
import * as uuid from 'uuid';

const expressApp = express();

// expressApp.use(express.static('dist/public'));

expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

expressApp.get('/hello', (req, res) => {
  res.send('Hello!');
});

const rooms = {} as any;
const userIds = {} as any;

const server = http.createServer(expressApp);
const socketio = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }
});

export function run(config: any = {}) {

  // server.listen(config.PORT);
  console.log('Listening on', config.PORT);
  const io = socketio.listen(+config.PORT);
  io.on('connection', function (socket) {

    let currentRoom: string, id: number;
    socket.on('init', (data, callback) => {
      currentRoom = (data || {}).room || uuid.v4();
      var room = rooms[currentRoom];
      if (!room) {
        rooms[currentRoom] = [socket];
        id = userIds[currentRoom] = 0;
        callback({ room: currentRoom, id: id });
        console.log('Room created, with #', currentRoom);
      } else {
        userIds[currentRoom] += 1;
        id = userIds[currentRoom];
        callback({ room: currentRoom, id: id });
        
        room.forEach(function (s: Socket) {
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
      } else {
        console.warn('Invalid user');
      }
    });

    socket.on('disconnect', function () {
      if (!currentRoom || !rooms[currentRoom]) {
        return;
      }
      delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)];
      rooms[currentRoom].forEach(function (socket: Socket) {
        if (socket) {
          socket.emit('peer.disconnected', { id: id });
        }
      });
    });
  });
}