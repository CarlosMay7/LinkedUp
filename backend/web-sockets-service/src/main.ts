import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIOAdapter } from './modules/chat/infrastructure/adapters/socket-io.adapter';
import { Server } from 'socket.io';
import { ChatGateway } from './modules/chat/infrastructure/gateways/chat.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure WebSocket adapter
  app.useWebSocketAdapter(new SocketIOAdapter(app));
  
  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  // Get the HTTP server
  const httpServer = app.getHttpServer();
  
  // Create Socket.IO server manually and attach to HTTP server
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    path: '/socket.io',
  });
  
  // Get the ChatGateway instance and connect it to the Socket.IO server
  const chatGateway = app.get(ChatGateway);
  chatGateway.server = io;
  
  // Call afterInit which will configure the messageBroker with the server
  chatGateway.afterInit(io);
  
  // Setup Socket.IO event handlers through the gateway
  io.on('connection', (socket) => {
    chatGateway.handleConnection(socket);
    
    socket.on('disconnect', () => {
      chatGateway.handleDisconnect(socket);
    });
    
    socket.on('register', (data) => {
      const result = chatGateway.handleRegister(data, socket);
      if (result) {
        socket.emit(result.event, result);
      }
    });
    
    socket.on('joinRoom', async (data) => {
      const result = await chatGateway.handleJoinRoom(data, socket);
      if (result) {
        socket.emit(result.event, result);
      }
    });
    
    socket.on('leaveRoom', (data) => {
      const result = chatGateway.handleLeaveRoom(data, socket);
      if (result) {
        socket.emit(result.event, result);
      }
    });
    
    socket.on('sendMessage', async (data) => {
      try {
        await chatGateway.handleSendMessage(data, socket);
      } catch (error) {
        console.error('Error handling sendMessage:', error);
      }
    });
    
    socket.on('typing', (data) => {
      chatGateway.handleTyping(data);
    });
    
    socket.on('message:delivered', (data) => {
      chatGateway.handleMessageDelivered(data);
    });
    
    socket.on('message:read', (data) => {
      chatGateway.handleMessageRead(data);
    });
  });
  
  console.log(`WebSocket Service running on http://localhost:${port}`);
  console.log(`WebSocket endpoint: ws://localhost:${port}/socket.io`);
}
bootstrap();
