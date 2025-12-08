import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIOAdapter } from './modules/chat/infrastructure/adapters/socket-io.adapter';

// This file bootstraps the WebSocket service using NestJS and configures the Socket.IO adapter.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure WebSocket adapter (Socket.IO se maneja automáticamente con NestJS)
  app.useWebSocketAdapter(new SocketIOAdapter(app));

  // Enable CORS (una sola vez, aquí)
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const port = process.env.PORT || 3002;
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 WebSocket Service running on http://localhost:${port}`);
}

bootstrap();
