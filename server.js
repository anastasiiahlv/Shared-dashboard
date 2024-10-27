const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = 5000; 
app.use(cors());
app.use(express.json());

let elements = []; 
let longPollClients = []; 

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('User connected via WebSocket');

  socket.on('ping', () => {
    socket.emit('pong');
  });

  socket.emit('drawing', elements);

  socket.on('drawing', (updatedElements) => {
    elements = updatedElements; 
    socket.broadcast.emit('drawing', elements); 
    notifyLongPollClients();
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from WebSocket');
  });
});

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

const notifyLongPollClients = () => {
  longPollClients.forEach((res) => res.json(elements));
  longPollClients = []; 
};

// Long Polling route
app.get('/long-poll', (req, res) => {
  longPollClients.push(res); 

  req.on('close', () => {
    longPollClients = longPollClients.filter(client => client !== res);
  });
});

app.post('/update-drawing', (req, res) => {
  elements = req.body; 
  notifyLongPollClients(); 
  io.emit('drawing', elements); 
  res.status(200).send();
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
