import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIOAdapter } from './modules/chat/infrastructure/adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure WebSocket adapter with Socket.IO
  app.useWebSocketAdapter(new SocketIOAdapter(app));
  
  // Enable CORS for HTTP endpoints
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  console.log(`🚀 WebSocket Service running on http://localhost:${port}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${port}/socket.io`);
}

bootstrap();
