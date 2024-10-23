const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      // Перевіряємо, чи передані дані у форматі JSON
      const data = JSON.parse(message);

      // Лог для перевірки отриманих даних
      console.log('Received message:', data);

      // Перевіряємо, чи потрібно очистити полотно
      if (data.clear) {
        // Передаємо команду очищення всім клієнтам
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ clear: true }));
          }
        });
      } else {
        // Якщо це малювання, передаємо дані всім клієнтам
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message); // Надсилаємо отримане повідомлення всім клієнтам
          }
        });
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket сервер працює на ws://localhost:3001');


