import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.send('Test server is running');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = 3002;
console.log(`Starting test server on port ${PORT}...`);
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});