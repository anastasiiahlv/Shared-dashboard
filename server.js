const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Дозволяємо запити з цього походження
    methods: ["GET", "POST"]
  }
});

app.use(cors()); // Використовуємо CORS для всіх маршрутів

app.get('/', (req, res) => {
  res.send('Server is running');
});

io.on('connection', (socket) => {
  console.log('User connected');

  // Обробка малювання
  socket.on('drawing', (elements) => {
    // Відправляємо малюнки всім підключеним клієнтам, окрім того, хто відправив
    socket.broadcast.emit('drawing', elements);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



