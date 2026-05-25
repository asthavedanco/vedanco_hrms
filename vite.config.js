import { defineConfig } from 'vite';
import { Server } from 'socket.io';

export default defineConfig({
  plugins: [
    {
      name: 'vite-plugin-socket-io',
      configureServer(server) {
        const io = new Server(server.httpServer, {
          cors: {
            origin: '*'
          }
        });

        io.on('connection', (socket) => {
          console.log('Socket.IO client connected:', socket.id);
          
          // Generic event to broadcast updates
          socket.on('broadcast_update', (data) => {
            socket.broadcast.emit('receive_update', data);
          });

          socket.on('disconnect', () => {
            console.log('Socket.IO client disconnected:', socket.id);
          });
        });
      }
    }
  ]
});
